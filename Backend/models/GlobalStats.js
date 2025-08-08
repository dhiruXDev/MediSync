import mongoose from 'mongoose';

const globalStatsSchema = new mongoose.Schema({
  totalAppointments: {
    type: Number,
    default: 0
  },
  totalReports: {
    type: Number,
    default: 0
  },
  totalFeedbacks: {
    type: Number,
    default: 0
  } 
});

export default mongoose.model('GlobalStats', globalStatsSchema); 