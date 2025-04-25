import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  user_id: String,
  session_id: String, 
  message: String,
  response: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Chat', chatSchema);
