import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true },
  acceptedTerms: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: '7d' } // auto delete after 7 days
});

export default mongoose.model('Session', sessionSchema);
