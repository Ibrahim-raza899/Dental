import Subject from '../models/Chapter.js'; // The file is named Chapter.js but exports Subject

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({});
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubject = async (req, res) => {
  const { title, description } = req.body;
  try {
    const subject = new Subject({ title, description, chapters: [] });
    const createdSubject = await subject.save();
    res.status(201).json(createdSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addChapterToSubject = async (req, res) => {
  const { title, description } = req.body;
  try {
    const subject = await Subject.findById(req.params.id);
    if (subject) {
      subject.chapters.push({ title, description, topics: [] });
      await subject.save();
      res.status(201).json(subject);
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
