import Chapter from '../models/Chapter.js';

// --- FACULTY USE CASES ---

// Create a Chapter
export const createChapter = async (req, res) => {
  const { title, description } = req.body;
  try {
    const chapter = new Chapter({ title, description, topics: [] });
    const created = await chapter.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit a Chapter
export const editChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Chapter
export const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json({ message: 'Chapter deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a Topic (supports file upload via multer)
export const addTopic = async (req, res) => {
  const { title, content, mediaUrl } = req.body;
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    
    const topicData = { title, content: content || '', mediaUrl };
    
    // If a file was uploaded via multer
    if (req.file) {
      topicData.fileUrl = `/uploads/topics/${req.file.filename}`;
      topicData.fileName = req.file.originalname;
      const ext = req.file.originalname.split('.').pop().toLowerCase();
      topicData.fileType = ext;
    }
    
    chapter.topics.push(topicData);
    await chapter.save();
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit a Topic
export const editTopic = async (req, res) => {
  const { chapterId, topicId } = req.params;
  try {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    
    const topic = chapter.topics.id(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    
    topic.set(req.body);
    await chapter.save();
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Topic
export const deleteTopic = async (req, res) => {
  const { chapterId, topicId } = req.params;
  try {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    
    chapter.topics.pull({ _id: topicId });
    await chapter.save();
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- STUDENT USE CASES ---

// View Chapters List
export const getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find({ isPublished: true });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View Chapter Details (including Topics List)
export const getChapterDetails = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
