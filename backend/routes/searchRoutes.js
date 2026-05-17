import express from 'express';
import { performSemanticSearch } from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, performSemanticSearch);

export default router;
