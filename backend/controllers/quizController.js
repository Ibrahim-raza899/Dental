import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';

// --- FACULTY USE CASES ---

// Save a generated quiz (from PDF or manual)
export const saveQuiz = async (req, res) => {
  const { title, description, questions, settings } = req.body;
  try {
    const quiz = new Quiz({
      title,
      description,
      creatorId: req.user._id,
      questions,
      settings: settings || {}
    });
    const saved = await quiz.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all quizzes (faculty sees theirs, students see all)
export const getQuizzes = async (req, res) => {
  try {
    let quizzes;
    if (req.user.role === 'faculty') {
      quizzes = await Quiz.find({ creatorId: req.user._id }).sort({ createdAt: -1 });
    } else {
      quizzes = await Quiz.find().sort({ createdAt: -1 });
    }
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single quiz
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quiz solution (faculty anytime, students only after attempt)
export const getQuizSolution = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Faculty can always see solutions
    if (req.user.role === 'faculty') {
      return res.json(quiz);
    }

    // Students can only see solutions after they have completed an attempt
    const attempt = await QuizAttempt.findOne({
      userId: req.user._id,
      quizId: req.params.id,
      status: 'completed'
    });

    if (!attempt) {
      return res.status(403).json({ message: 'Complete the quiz first to view solutions' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a quiz
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    
    if (quiz.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- STUDENT USE CASES ---

// Start a quiz attempt
export const startQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Check if there's already an in-progress attempt
    const existing = await QuizAttempt.findOne({
      userId: req.user._id,
      quizId: req.params.id,
      status: 'in_progress'
    });

    if (existing) {
      return res.json({ attempt: existing, quiz });
    }

    const attempt = new QuizAttempt({
      userId: req.user._id,
      quizId: req.params.id,
      answers: [],
      startedAt: new Date()
    });
    const saved = await attempt.save();

    // Return quiz without correct answers for the student
    const safeQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      settings: quiz.settings,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        text: q.text,
        type: q.type,
        options: q.options,
        difficulty: q.difficulty
      }))
    };

    res.status(201).json({ attempt: saved, quiz: safeQuiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit a quiz attempt
export const submitQuizAttempt = async (req, res) => {
  const { attemptId, answers } = req.body;
  try {
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (attempt.status === 'completed') {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Grade the answers
    let correctCount = 0;
    const gradedAnswers = answers.map(ans => {
      const question = quiz.questions.id(ans.questionId);
      const isCorrect = question && question.correctAnswer === ans.submittedAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: ans.questionId,
        submittedAnswer: ans.submittedAnswer,
        isCorrect,
        timeTakenSeconds: ans.timeTakenSeconds || 0
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    attempt.answers = gradedAnswers;
    attempt.score = score;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    await attempt.save();

    res.json({
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      attempt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my quiz results
export const getMyQuizResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      userId: req.user._id,
      status: 'completed'
    }).populate('quizId', 'title description').sort({ completedAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Anti-cheating endpoint
export const logCheatingEvent = async (req, res) => {
  const { attemptId, event } = req.body;
  try {
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: 'Quiz attempt not found' });

    attempt.antiCheatingLogs.push({ event });
    
    // Automatically terminate if too many warnings
    if (attempt.antiCheatingLogs.length > 3) {
      attempt.status = 'terminated';
    }
    
    await attempt.save();
    res.json({ message: 'Event logged', status: attempt.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
