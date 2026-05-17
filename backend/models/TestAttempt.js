import mongoose from 'mongoose';

const testAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  answers: [{
    questionIndex: { type: Number },
    submittedAnswer: { type: String },
    isCorrect: { type: Boolean }
  }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);
export default TestAttempt;
