import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' }, // Notes/Text
  mediaUrl: { type: String }, // General media link
  fileUrl: { type: String }, // Uploaded PDF/DOCX path
  fileName: { type: String }, // Original file name
  fileType: { type: String }, // 'pdf' or 'docx'
});

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  topics: [topicSchema],
  isPublished: { type: Boolean, default: true } // Faculty control
}, { timestamps: true });

const Chapter = mongoose.model('Chapter', chapterSchema);
export default Chapter;
