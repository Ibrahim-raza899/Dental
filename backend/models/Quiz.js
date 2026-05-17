import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'true_false', 'short_answer'], default: 'mcq' },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject.chapters.topics' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Faculty who created it
  questions: [questionSchema],
  settings: {
    timeLimitMinutes: { type: Number, default: 30 },
    negativeMarking: { type: Boolean, default: false },
    shuffleQuestions: { type: Boolean, default: true },
    adaptiveMode: { type: Boolean, default: false } // If true, difficulty scales dynamically
  }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
