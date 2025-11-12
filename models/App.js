import mongoose from 'mongoose';

const appSchema = new mongoose.Schema({
  id: String,
  name: String,
  active: Boolean
});

export default mongoose.model('App', appSchema);
