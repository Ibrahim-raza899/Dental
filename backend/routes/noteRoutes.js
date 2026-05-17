import express from 'express';
import { getMyNotes, createNote } from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMyNotes)
  .post(protect, createNote);

export default router;
