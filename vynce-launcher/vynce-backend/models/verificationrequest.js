import mongoose from 'mongoose';
const vrSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['age-document','child-link'], required: true },
  payload: mongoose.Mixed,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  reviewedAt: Date
});
export default mongoose.model('VerificationRequest', vrSchema);
