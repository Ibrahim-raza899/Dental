import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

import authRoutes from './routes/authRoutes.js';
import chapterRoutes from './routes/chapterRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import testRoutes from './routes/testRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import quizRoutes from './routes/quizRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically (for student PDF/DOCX downloads)
import fs from 'fs';

// Ensure upload directories exist for Render
const uploadsDir = path.join(__dirname, 'uploads');
const topicsDir = path.join(uploadsDir, 'topics');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(topicsDir)) fs.mkdirSync(topicsDir);

app.use('/uploads', express.static(uploadsDir));

import User from './models/User.js';

// Temporary route to hardpush users
app.get('/api/hardpush', async (req, res) => {
  try {
    const users = [
      { name: 'Ibrahim (Student)', email: 'ibrahimraza899@gmail.com', password: 'Ibrahim_104', role: 'student', isVerified: true },
      { name: 'Ibrahim (Faculty)', email: 'ibrahimraza3135@gmail.com', password: 'Ibrahim_104', role: 'faculty', isVerified: true }
    ];
    let results = [];
    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        exists.isVerified = true;
        exists.password = u.password;
        await exists.save();
        results.push(`Updated ${u.email}`);
      } else {
        await User.create(u);
        results.push(`Created ${u.email}`);
      }
    }
    res.json({ message: "Hardpush successful!", results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Odontogenic API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
