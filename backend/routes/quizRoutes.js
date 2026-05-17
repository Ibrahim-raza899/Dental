import express from 'express';
import {
  saveQuiz, getQuizzes, getQuizById, getQuizSolution,
  deleteQuiz, startQuizAttempt, submitQuizAttempt,
  getMyQuizResults, logCheatingEvent
} from '../controllers/quizController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

// Faculty routes
router.post('/save', protect, faculty, saveQuiz);
router.delete('/:id', protect, faculty, deleteQuiz);

// Student results
router.get('/my-results', protect, getMyQuizResults);

// Shared routes
router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuizById);
router.get('/:id/solution', protect, getQuizSolution);

// Student quiz flow
router.post('/:id/start', protect, startQuizAttempt);
router.post('/:id/submit', protect, submitQuizAttempt);

// Anti-cheating
router.post('/log-event', protect, logCheatingEvent);

export default router;
