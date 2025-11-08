import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  event: String,
  userId: String,
  appId: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Analytics', analyticsSchema);
