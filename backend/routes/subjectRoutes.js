import express from 'express';
import { getSubjects, createSubject, addChapterToSubject } from '../controllers/subjectController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSubjects)
  .post(protect, faculty, createSubject);

router.route('/:id/chapters')
  .post(protect, faculty, addChapterToSubject);

export default router;
