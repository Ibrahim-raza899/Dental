import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  submittedAnswer: { type: String },
  isCorrect: { type: Boolean },
  timeTakenSeconds: { type: Number }
});

const cheatingLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  event: { type: String, enum: ['tab_switch', 'copy_paste', 'window_blur'], required: true }
});

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['in_progress', 'completed', 'terminated'], default: 'in_progress' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  antiCheatingLogs: [cheatingLogSchema]
}, { timestamps: true });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;
