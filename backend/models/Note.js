import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject.chapters.topics' },
  content: { type: String, required: true }, // User's personal notes
  folder: { type: String, default: 'General' }, // For organizing
  highlightedText: { type: String } // If the note is attached to a highlight
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);
export default Note;
