import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getChapters, getChapterDetails, 
  createChapter, editChapter, deleteChapter,
  addTopic, editTopic, deleteTopic 
} from '../controllers/chapterController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer config for topic file uploads (PDF/DOCX)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/topics');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, PPT, and PPTX files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

// Faculty & Student Routes
router.route('/')
  .get(protect, getChapters)
  .post(protect, faculty, createChapter);

router.route('/:id')
  .get(protect, getChapterDetails)
  .put(protect, faculty, editChapter)
  .delete(protect, faculty, deleteChapter);

// Topic Management (Faculty only) — with file upload support
router.route('/:id/topics')
  .post(protect, faculty, upload.single('file'), addTopic);

router.route('/:chapterId/topics/:topicId')
  .put(protect, faculty, editTopic)
  .delete(protect, faculty, deleteTopic);

export default router;
