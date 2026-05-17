import express from 'express';
import multer from 'multer';
import { chatWithBot, generateQuizFromText, generateSampleQuiz } from '../controllers/aiController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();
// Accept any file type for quiz generation — text extraction is done server-side
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB
});

router.post('/chat', protect, chatWithBot);
// Use multer to parse the uploaded file before passing to the controller
router.post('/generate-quiz', protect, faculty, upload.single('file'), generateQuizFromText);
// Student-accessible practice quiz generation
router.post('/sample-quiz', protect, generateSampleQuiz);

export default router;
