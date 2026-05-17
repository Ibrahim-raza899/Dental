import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  type: { type: String, enum: ['pre-test', 'post-test'], required: true },
  questions: [questionSchema]
}, { timestamps: true });

const Test = mongoose.model('Test', testSchema);
export default Test;
