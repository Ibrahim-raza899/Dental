import express from 'express';
import { getStudentAnalytics, getFacultyAnalytics, getStudentReport } from '../controllers/analyticsController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/student', protect, getStudentAnalytics);
router.get('/faculty', protect, faculty, getFacultyAnalytics);
router.get('/faculty/students/:studentId', protect, faculty, getStudentReport);

export default router;
