import express from 'express';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import auth from '../middlewares/auth.js';
import roles from '../middlewares/roles.js';
import GlobalStats from '../models/GlobalStats.js';
import User from '../models/User.js';
import sendSMS from '../utils/sms.js';
const router = express.Router();
import { configDotenv } from 'dotenv';
configDotenv();   

router.post('/request', auth, roles(['patient']), async (req, res) => {
    try {
        const { doctorId, reason, scheduledTime, specialization } = req.body;
        const appointment = new Appointment({
            patientId: req.user.userId,
            doctorId,
            reason,
            scheduledTime,
        });
        await appointment.save();
        
        await GlobalStats.findOneAndUpdate({}, { $inc: { totalAppointments: 1 } }, { upsert: true });

        
        const doctor = await User.findById(doctorId);
        const patient = await User.findById(req.user.userId);
        if (doctor && patient) {
            const doctorMsg = `New appointment booked with patient ${patient.username} on ${new Date(scheduledTime).toLocaleString()}.`;
            const patientMsg = `Your appointment with Dr. ${doctor.username} is booked for ${new Date(scheduledTime).toLocaleString()}.`;
            if (doctor.phone) sendSMS(doctor.phone, doctorMsg);
            if (patient.phone) sendSMS(patient.phone, patientMsg);
            
            // Create notifications
            const patientNotification = new Notification({
                userId: req.user.userId,
                type: 'appointment_created',
                message: `Your appointment with Dr. ${doctor.username} has been booked for ${new Date(scheduledTime).toLocaleDateString()}.`,
                link: `/dashboard`,
                meta: {
                    appointmentId: appointment._id,
                    doctorName: doctor.username,
                    scheduledTime: scheduledTime
                }
            });
            await patientNotification.save();
            
            const doctorNotification = new Notification({
                userId: doctorId,
                type: 'appointment_request',
                message: `New appointment request from ${patient.username} for ${new Date(scheduledTime).toLocaleDateString()}.`,
                link: `/dashboard`,
                meta: {
                    appointmentId: appointment._id,
                    patientName: patient.username,
                    scheduledTime: scheduledTime
                }
            });
            await doctorNotification.save();
        }

        res.status(201).json({ message: 'Appointment requested', appointment });
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
});


router.get('/mine', auth, roles(['patient']), async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user.userId })
            .populate('doctorId', 'username specialization email avatar')
            .populate('patientId', 'username email');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
});




router.get('/my-doctors', auth, roles(['patient']), async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user.userId, status: { $in: ['approved', 'completed'] } })
            .populate('doctorId', 'username specialization email avatar');
        
        const doctorMap = {};
        appointments.forEach(app => {
            if (app.doctorId && app.doctorId._id) {
                doctorMap[app.doctorId._id] = app.doctorId;
            }
        });
        const uniqueDoctors = Object.values(doctorMap);
        res.json(uniqueDoctors);
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
});


router.get('/requests', auth, roles(['doctor']), async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.user.userId, status: 'pending' }).populate('patientId', 'username email');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
});


router.post('/:id/approve', auth, roles(['doctor']), async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true })
            .populate('patientId', 'username')
            .populate('doctorId', 'username');
            
        // Create notification for patient
        if (appointment) {
            const notification = new Notification({
                userId: appointment.patientId._id,
                type: 'appointment_approved',
                message: `Your appointment with Dr. ${appointment.doctorId.username} has been approved!`,
                link: `/dashboard`,
                meta: {
                    appointmentId: appointment._id,
                    doctorName: appointment.doctorId.username,
                    scheduledTime: appointment.scheduledTime
                }
            });
            await notification.save();
        }
        
        res.json({ message: 'Appointment approved', appointment });
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
});


router.post('/:id/decline', auth, roles(['doctor']), async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: 'declined' }, { new: true })
            .populate('patientId', 'username')
            .populate('doctorId', 'username');
            
        // Create notification for patient
        if (appointment) {
            const notification = new Notification({
                userId: appointment.patientId._id,
                type: 'appointment_declined',
                message: `Your appointment with Dr. ${appointment.doctorId.username} has been declined.`,
                link: `/dashboard`,
                meta: {
                    appointmentId: appointment._id,
                    doctorName: appointment.doctorId.username,
                    scheduledTime: appointment.scheduledTime
                }
            });
            await notification.save();
        }
        
        res.json({ message: 'Appointment declined', appointment });
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
});


router.post('/:id/schedule', auth, roles(['doctor']), async (req, res) => {
    try {
        const { scheduledTime } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { scheduledTime, status: 'approved' }, { new: true });
        res.json({ message: 'Meeting scheduled', appointment });
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
});


router.get('/all', auth, roles(['admin']), async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'username email avatar')
            .populate('doctorId', 'username email specialization');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
});


router.get('/doctor/all', auth, roles(['doctor']), async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.user.userId })
            .populate('patientId', 'username email avatar')
            .populate('doctorId', 'username specialization email avatar');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
});


export default router; 