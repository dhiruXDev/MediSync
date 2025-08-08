import express from 'express';
import Report from '../models/Report.js';
import Appointment from '../models/Appointment.js';
import auth from '../middlewares/auth.js';
import roles from '../middlewares/roles.js';
import GlobalStats from '../models/GlobalStats.js';
import User from '../models/User.js';
import sendSMS from '../utils/sms.js';
import { configDotenv } from 'dotenv';
configDotenv();  
const router = express.Router();

// Doctor: Create a new report for a patient
router.post('/create', auth, roles(['doctor']), async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      diagnosis,
      symptoms,
      treatment,
      prescription,
      recommendations,
      followUpDate,
      followUpRequired,
      severity,
      status,
      notes,
      vitalSigns,
      labResults
    } = req.body;

    // Verify that the appointment exists and belongs to this doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only create reports for your own appointments' });
    }

    if (appointment.patientId.toString() !== patientId) {
      return res.status(400).json({ message: 'Patient ID does not match appointment' });
    }

    // Check if a report already exists for this appointment
    const existingReport = await Report.findOne({ appointmentId });
    if (existingReport) {
      return res.status(400).json({ message: 'A report already exists for this appointment' });
    }

    const report = new Report({
      patientId,
      doctorId: req.user.userId,
      appointmentId,
      diagnosis,
      symptoms,
      treatment,
      prescription,
      recommendations,
      followUpDate: followUpRequired ? new Date(followUpDate) : null,
      followUpRequired,
      severity,
      status,
      notes,
      vitalSigns,
      labResults
    });

    await report.save();

    // Increment global report count
    await GlobalStats.findOneAndUpdate({}, { $inc: { totalReports: 1 } }, { upsert: true });

    // Populate patient and doctor information for response
    await report.populate('patientId', 'username email age avatar');
    await report.populate('doctorId', 'username specialization');

    // Send SMS to patient
    const patient = await User.findById(patientId);
    const doctor = await User.findById(req.user.userId);
    if (patient && patient.phone && doctor) {
      const msg = `A new medical report has been generated for you by Dr. ${doctor.username}. Please log in to view details.`;
      sendSMS(patient.phone, msg);
    }

    res.status(201).json({ 
      message: 'Report created successfully', 
      report 
    });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/my-reports', auth, roles(['doctor', 'patient']), async (req, res) => {
  try {
    let reports;
    if (req.user.role === 'doctor') {
      reports = await Report.find({ doctorId: req.user.userId })
        .populate('patientId', 'username email age avatar')
        .populate('appointmentId', 'scheduledTime reason status')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'patient') {
      reports = await Report.find({ patientId: req.user.userId })
        .populate('doctorId', 'username specialization avatar')
        .populate('appointmentId', 'scheduledTime reason status')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patientId', 'username email age avatar')
      .populate('doctorId', 'username specialization avatar')
      .populate('appointmentId', 'scheduledTime reason status');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    
    if (req.user.role === 'patient' && report.patientId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'doctor' && report.doctorId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(report);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.put('/:id', auth, roles(['doctor']), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.doctorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update your own reports' });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId', 'username email age avatar')
     .populate('doctorId', 'username specialization avatar')
     .populate('appointmentId', 'scheduledTime reason status');

    res.json({ 
      message: 'Report updated successfully', 
      report: updatedReport 
    });
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.delete('/:id', auth, roles(['doctor']), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.doctorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own reports' });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/appointment/:appointmentId', auth, async (req, res) => {
  try {
    const report = await Report.findOne({ appointmentId: req.params.appointmentId })
      .populate('patientId', 'username email age avatar')
      .populate('doctorId', 'username specialization avatar')
      .populate('appointmentId', 'scheduledTime reason status');

    if (!report) {
      return res.status(404).json({ message: 'No report found for this appointment' });
    }

    if (req.user.role === 'patient' && report.patientId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'doctor' && report.doctorId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(report);
  } catch (err) {
    console.error('Error fetching appointment report:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/', auth, roles(['admin']), async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('patientId', 'username email age avatar')
      .populate('doctorId', 'username specialization avatar')
      .populate('appointmentId', 'scheduledTime reason status');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router; 