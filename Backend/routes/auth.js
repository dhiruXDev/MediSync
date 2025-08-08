import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middlewares/auth.js';
import roles from '../middlewares/roles.js';
import Notification from '../models/Notification.js';
import fs from 'fs';
import path from 'path';
const router = express.Router();
import { configDotenv } from 'dotenv';
configDotenv();  

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, avatar, specialization, experience, age, phone } = req.body;
       
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
         const hashedPassword = await bcrypt.hash(password, 10);
         const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'patient',
            avatar: avatar || '',
            specialization: role === 'doctor' ? specialization : undefined,
            experience: role === 'doctor' ? experience : undefined,
            age: role === 'doctor' ? age : undefined,
            phone,
        });

       const x =  await user.save();
         console.log("3rd", x)
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


router.post('/register-admin', async (req, res) => {
  const { secret, username, email, password, avatar, phone } = req.body;
   if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
     const existingUser = await User.findOne({ $or: [{ email }, { username }] });
     if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
     const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: avatar || '',
      phone,
      role: 'admin',
      isVerified: true
    });
     // Save the new admin user
   const respose =  await newUser.save();
 
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message , err });
  }
});


router.get('/doctors', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }, 'username specialization experience age avatar email');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/doctors/specialization/:spec', async (req, res) => {
    try {
        const specialization = req.params.spec;
        const doctors = await User.find({ role: 'doctor', specialization }, 'username specialization experience age avatar email');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token, user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            specialization: user.specialization,
            experience: user.experience,
            age: user.age,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.put('/profile', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const updateFields = {};
        const allowedFields = ['username', 'avatar', 'specialization', 'experience', 'age', 'phone'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });
        updateFields.updatedAt = new Date();
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user: {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            specialization: updatedUser.specialization,
            experience: updatedUser.experience,
            age: updatedUser.age,
            phone: updatedUser.phone,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        }});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get current user details
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            specialization: user.specialization,
            experience: user.experience,
            age: user.age,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Doctor marks attendance 
router.post('/doctors/attendance', auth, roles(['doctor']), async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const today = new Date();
    today.setHours(0,0,0,0);

    // Prepare attendance record
    const attendanceRecord = {
      date: today.toISOString(),
      present: true
    };

    
    const dir = path.join(process.cwd(), 'Backend', 'attendance');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `doctor_${doctorId}.json`);

    let attendanceHistory = [];
    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, 'utf-8');
        attendanceHistory = JSON.parse(data);
        if (!Array.isArray(attendanceHistory)) attendanceHistory = [];
      } catch (err) {
        attendanceHistory = [];
      }
    }

    if (attendanceHistory.some(a => new Date(a.date).toDateString() === today.toDateString())) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    attendanceHistory.push(attendanceRecord);
    fs.writeFileSync(filePath, JSON.stringify(attendanceHistory, null, 2));

    const doctor = await User.findById(doctorId);
    if (doctor) {
      doctor.weeklyAttendance = doctor.weeklyAttendance.filter(a => new Date(a.date).toDateString() !== today.toDateString());
      doctor.weeklyAttendance.push({ date: today, present: true });
      doctor.weeklyAttendance = doctor.weeklyAttendance.filter(a => (today - new Date(a.date)) <= 7*24*60*60*1000);
      await doctor.save();
    }

    res.json({ message: 'Attendance marked and saved to file', attendance: attendanceHistory });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/doctors/attendance/history/:doctorId', auth, roles(['doctor', 'admin']), (req, res) => {
  const doctorId = req.params.doctorId;
  const filePath = path.join(process.cwd(), 'Backend', 'attendance', `doctor_${doctorId}.json`);
  if (!fs.existsSync(filePath)) {
    return res.json({ attendance: [] });
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const attendance = JSON.parse(data);
    if (!Array.isArray(attendance)) return res.json({ attendance: [] });
    res.json({ attendance });
  } catch (err) {
    res.json({ attendance: [] });
  }
});


router.get('/doctors/available', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const doctors = await User.find({ role: 'doctor', 'weeklyAttendance': { $elemMatch: { date: today, present: true } } }, 'username specialization avatar experience');
    res.json({ availableDoctors: doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.post('/notifications/mark-read', auth, async (req, res) => {
  try {
    const { notificationId } = req.body;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.post('/notifications', async (req, res) => {
  try {
    const { userId, type, message, link, meta } = req.body;
    const notification = new Notification({ userId, type, message, link, meta });
    await notification.save();
    res.status(201).json({ notification });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.post('/doctors/availability', auth, roles(['doctor']), async (req, res) => {
  try {
    const { availability } = req.body; 
    const doctor = await User.findById(req.user.userId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    doctor.availability = availability;
    await doctor.save();
    res.json({ message: 'Availability updated', availability: doctor.availability });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/doctors/availability/:doctorId', auth, async (req, res) => {
  try {
    const doctor = await User.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ availability: doctor.availability || [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/doctors/attendance/all', auth, roles(['admin']), (req, res) => {
  const dir = path.join(process.cwd(), 'Backend', 'attendance');
  if (!fs.existsSync(dir)) return res.json({ records: {} });
  const files = fs.readdirSync(dir).filter(f => f.startsWith('doctor_') && f.endsWith('.json'));
  const records = {};
  files.forEach(file => {
    const doctorId = file.replace('doctor_', '').replace('.json', '');
    try {
      const data = fs.readFileSync(path.join(dir, file), 'utf-8');
      const attendance = JSON.parse(data);
      if (Array.isArray(attendance)) {
        records[doctorId] = attendance;
      } else {
        records[doctorId] = [];
      }
    } catch {
      records[doctorId] = [];
    }
  });
  res.json({ records });
});

export default router; 