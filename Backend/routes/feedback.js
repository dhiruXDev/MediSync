import express from 'express';
import PatientFeedback from '../models/PatientFeedback.js';
import auth from '../middlewares/auth.js';
import roles from '../middlewares/roles.js';
import User from '../models/User.js';
import GlobalStats from '../models/GlobalStats.js';
import { configDotenv } from 'dotenv';
configDotenv();  
const router = express.Router();


router.post('/', auth, roles(['patient']), async (req, res) => {
    try {
        const { doctorId, type, reason, message } = req.body;
        const patientId = req.user.userId;
        const patientFeedback = new PatientFeedback({ doctorId, patientId, type, reason, message });
        await patientFeedback.save();
        console.log('Feedback submitted:', patientFeedback);
        
        const update = { $inc: { totalFeedbacks: 1 } };
        if (type === 'good') update.$inc.goodFeedbacks = 1;
        if (type === 'bad') update.$inc.badFeedbacks = 1;
        await User.findByIdAndUpdate(doctorId, update);
        
        await GlobalStats.findOneAndUpdate({}, { $inc: { totalFeedbacks: 1 } }, { upsert: true });
        res.status(201).json(patientFeedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/', auth, roles(['admin']), async (req, res) => {
    try {
        const feedbacks = await PatientFeedback.find().populate('doctorId', 'username specialization').populate('patientId', 'username');
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.put('/:id', auth, roles(['patient']), async (req, res) => {
    try {
        const feedback = await PatientFeedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
        if (feedback.patientId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const { type, reason, message } = req.body;
        feedback.type = type || feedback.type;
        feedback.reason = reason || feedback.reason;
        feedback.message = message || feedback.message;
        await feedback.save();
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', auth, roles(['patient']), async (req, res) => {
    try {
        const feedback = await PatientFeedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
        if (feedback.patientId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await feedback.deleteOne();
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
 
router.get('/getAll', async (req, res) => {
    try {
 
        const feedbacks = await PatientFeedback.find()
            .populate('doctorId', 'username email specialization')   // Adjust fields as needed
            .populate('patientId', 'username email')  // Adjust fields as needed
            .sort({ createdAt: -1 }); // Optional: latest feedback first
         res.status(200).json({ success:true, message :feedbacks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;