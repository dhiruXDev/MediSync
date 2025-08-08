import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  symptoms: {
    type: String,
    required: true,
    trim: true
  },
  treatment: {
    type: String,
    required: true,
    trim: true
  },
  prescription: {
    type: String,
    trim: true
  },
  recommendations: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved', 'Under Observation'],
    default: 'Active'
  },
  notes: {
    type: String,
    trim: true
  },
  vitalSigns: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    weight: String,
    height: String
  },
  labResults: {
    type: String,
    trim: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

// Index for better query performance
reportSchema.index({ patientId: 1, createdAt: -1 });
reportSchema.index({ doctorId: 1, createdAt: -1 });
reportSchema.index({ appointmentId: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report; 