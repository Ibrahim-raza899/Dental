import express from 'express';
import { 
  createTest, editTest, deleteTest,
  getAllTests, getTestsForChapter, submitTest, getMyTestResults
} from '../controllers/testController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, faculty, createTest);

router.get('/all', protect, getAllTests);
router.get('/my-results', protect, getMyTestResults);

router.route('/:id')
  .put(protect, faculty, editTest)
  .delete(protect, faculty, deleteTest);

router.get('/chapter/:chapterId', protect, getTestsForChapter);
router.post('/submit', protect, submitTest);

export default router;
