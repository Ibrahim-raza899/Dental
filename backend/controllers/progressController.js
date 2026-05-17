import User from '../models/User.js';

// Mark Chapter as Read
export const markChapterAsRead = async (req, res) => {
  const { chapterId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    
    // Check if already read
    const existing = user.progress.find(p => p.chapterId && p.chapterId.toString() === chapterId);
    if (existing) {
      existing.read = true;
    } else {
      user.progress.push({ chapterId, read: true });
    }
    
    await user.save();
    res.json({ message: 'Chapter marked as read', progress: user.progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Track Progress (Get all progress)
export const getMyProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('progress');
    res.json(user.progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
