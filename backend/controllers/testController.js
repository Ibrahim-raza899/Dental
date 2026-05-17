import Test from '../models/Test.js';
import TestAttempt from '../models/TestAttempt.js';
import User from '../models/User.js';

// --- FACULTY USE CASES ---

export const createTest = async (req, res) => {
  const { title, chapterId, type, questions } = req.body;
  try {
    const test = new Test({ title, chapterId, type, questions });
    const created = await test.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTest = async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- STUDENT USE CASES ---

// Get ALL tests (across all chapters)
export const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find().populate('chapterId', 'title');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTestsForChapter = async (req, res) => {
  try {
    const tests = await Test.find({ chapterId: req.params.chapterId });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit Test — properly saves attempt with graded answers
export const submitTest = async (req, res) => {
  const { testId, score, answers } = req.body;
  try {
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Grade answers if provided, otherwise use client score
    let gradedAnswers = [];
    let correctCount = 0;
    let finalScore = score;

    if (answers && answers.length > 0) {
      gradedAnswers = answers.map((ans, idx) => {
        const question = test.questions[idx];
        const isCorrect = question && ans.submittedAnswer === question.correctAnswer;
        if (isCorrect) correctCount++;
        return {
          questionIndex: idx,
          submittedAnswer: ans.submittedAnswer,
          isCorrect
        };
      });
      finalScore = Math.round((correctCount / test.questions.length) * 100);
    }

    // Save the attempt to TestAttempt collection
    const attempt = new TestAttempt({
      userId: req.user._id,
      testId: testId,
      answers: gradedAnswers,
      score: finalScore,
      totalQuestions: test.questions.length,
      completedAt: new Date()
    });
    await attempt.save();

    // Also update user progress for chapter read tracking
    const user = await User.findById(req.user._id);
    const chapterId = test.chapterId;
    const existingProgress = user.progress.find(p => p.chapterId?.toString() === chapterId?.toString());
    if (!existingProgress) {
      user.progress.push({ chapterId, read: false });
      await user.save();
    }

    res.json({ 
      message: 'Test submitted', 
      score: finalScore,
      correctCount,
      totalQuestions: test.questions.length,
      attemptId: attempt._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's own test results
export const getMyTestResults = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ userId: req.user._id })
      .populate('testId', 'title type chapterId')
      .sort({ completedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
