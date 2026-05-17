import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of chapter, topic, or model
  type: { type: String, enum: ['chapter', 'topic', '3d_model', 'chatbot_answer'], required: true },
  title: { type: String } // Quick reference title
}, { timestamps: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
