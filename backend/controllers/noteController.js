import Note from '../models/Note.js';

export const getMyNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNote = async (req, res) => {
  const { topicId, content, folder, highlightedText } = req.body;
  try {
    const note = new Note({
      userId: req.user._id,
      topicId,
      content,
      folder,
      highlightedText
    });
    const createdNote = await note.save();
    res.status(201).json(createdNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
