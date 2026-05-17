import express from 'express';
import { getMyNotifications, markAsRead, createAnnouncement } from '../controllers/notificationController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMyNotifications)
  .post(protect, faculty, createAnnouncement);

router.route('/:id/read')
  .put(protect, markAsRead);

export default router;
