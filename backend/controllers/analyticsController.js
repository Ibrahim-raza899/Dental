import QuizAttempt from '../models/QuizAttempt.js';
import TestAttempt from '../models/TestAttempt.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Test from '../models/Test.js';

export const getStudentAnalytics = async (req, res) => {
  try {
    // Get both quiz and test attempts
    const quizAttempts = await QuizAttempt.find({ 
      userId: req.user._id, 
      status: 'completed' 
    }).populate('quizId');

    const testAttempts = await TestAttempt.find({
      userId: req.user._id
    }).populate('testId');
    
    // Build radar data from all performance
    const topicScores = {};
    
    quizAttempts.forEach(attempt => {
      const title = attempt.quizId?.title || 'Unknown Quiz';
      if (!topicScores[title]) topicScores[title] = { total: 0, count: 0 };
      topicScores[title].total += attempt.score;
      topicScores[title].count++;
    });

    testAttempts.forEach(attempt => {
      const title = attempt.testId?.title || 'Unknown Test';
      if (!topicScores[title]) topicScores[title] = { total: 0, count: 0 };
      topicScores[title].total += attempt.score;
      topicScores[title].count++;
    });

    let radarData = Object.entries(topicScores).map(([subject, data]) => ({
      subject: subject.length > 20 ? subject.substring(0, 20) + '...' : subject,
      A: Math.round(data.total / data.count),
      fullMark: 100
    }));

    if (radarData.length === 0) {
      radarData = [
        { subject: 'Odontogenic Cysts', A: 0, fullMark: 100 },
        { subject: 'Ameloblastoma', A: 0, fullMark: 100 },
        { subject: 'Fibro-osseous', A: 0, fullMark: 100 },
        { subject: 'Salivary Tumors', A: 0, fullMark: 100 },
        { subject: 'Oral Mucosa', A: 0, fullMark: 100 },
      ];
    }

    const weeklyData = [
      { name: 'Mon', hours: 2 }, { name: 'Tue', hours: 3 }, { name: 'Wed', hours: 1.5 },
      { name: 'Thu', hours: 4 }, { name: 'Fri', hours: 2.5 }, { name: 'Sat', hours: 5 }, { name: 'Sun', hours: 1 },
    ];

    let weakness = null;
    if (Object.keys(topicScores).length > 0) {
      let minScore = 101;
      Object.entries(topicScores).forEach(([subject, data]) => {
        const avg = data.total / data.count;
        if (avg < minScore) { minScore = avg; weakness = subject; }
      });
    }

    const allAttempts = [...quizAttempts, ...testAttempts];
    const avgScore = allAttempts.length > 0 
      ? Math.round(allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length) 
      : 0;

    res.json({
      radarData,
      weeklyData,
      weakness,
      stats: { 
        chaptersRead: (await User.findById(req.user._id).select('progress')).progress.filter(p => p.read).length,
        avgScore, 
        totalAttempts: allAttempts.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFacultyAnalytics = async (req, res) => {
  try {
    // ---- QUIZ DATA ----
    const quizzes = await Quiz.find({ creatorId: req.user._id });
    const quizIds = quizzes.map(q => q._id);
    const quizAttempts = await QuizAttempt.find({ 
      quizId: { $in: quizIds },
      status: 'completed' 
    }).populate('userId', 'name email').populate('quizId', 'title');

    // ---- TEST DATA ----
    const tests = await Test.find();
    const testIds = tests.map(t => t._id);
    const testAttempts = await TestAttempt.find({
      testId: { $in: testIds }
    }).populate('userId', 'name email').populate('testId', 'title type');

    // ---- BUILD COMBINED PERFORMANCE ----
    const performanceMap = {};

    // Add quiz performance
    quizzes.forEach(q => {
      performanceMap[`quiz-${q._id}`] = { title: q.title, type: 'Quiz', scores: [] };
    });
    quizAttempts.forEach(attempt => {
      const key = `quiz-${attempt.quizId?._id}`;
      if (performanceMap[key]) performanceMap[key].scores.push(attempt.score);
    });

    // Add test performance
    tests.forEach(t => {
      performanceMap[`test-${t._id}`] = { title: `${t.title} (${t.type})`, type: 'Test', scores: [] };
    });
    testAttempts.forEach(attempt => {
      const key = `test-${attempt.testId?._id}`;
      if (performanceMap[key]) performanceMap[key].scores.push(attempt.score);
    });

    // ---- BUILD STUDENT MAP (combined) ----
    const studentMap = {};

    const processAttempt = (attempt, sourceTitle) => {
      const sId = attempt.userId?._id?.toString();
      if (!sId) return;
      if (!studentMap[sId]) {
        studentMap[sId] = {
          _id: sId,
          name: attempt.userId.name,
          email: attempt.userId.email,
          scores: [],
          attempts: 0
        };
      }
      studentMap[sId].scores.push(attempt.score);
      studentMap[sId].attempts++;
    };

    quizAttempts.forEach(a => processAttempt(a));
    testAttempts.forEach(a => processAttempt(a));

    const classPerformance = Object.values(performanceMap).map(item => ({
      topic: item.title,
      type: item.type,
      avgScore: item.scores.length > 0 ? Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length) : 0,
      attempts: item.scores.length
    })).filter(cp => cp.attempts > 0);

    const students = Object.values(studentMap).map(s => ({
      ...s,
      avgScore: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length)
    }));

    let weakness = null;
    let minAvg = 101;
    classPerformance.forEach(cp => {
      if (cp.avgScore < minAvg && cp.attempts > 0) {
        minAvg = cp.avgScore;
        weakness = cp.topic;
      }
    });

    const totalAttempts = quizAttempts.length + testAttempts.length;

    res.json({ 
      classPerformance, 
      students,
      weakness,
      totalQuizzes: quizzes.length,
      totalTests: tests.length,
      totalStudents: Object.keys(studentMap).length,
      totalAttempts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Per-student detailed report (for faculty)
export const getStudentReport = async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const quizAttempts = await QuizAttempt.find({
      userId: req.params.studentId,
      status: 'completed'
    }).populate('quizId', 'title description').sort({ completedAt: -1 });

    const testAttempts = await TestAttempt.find({
      userId: req.params.studentId
    }).populate('testId', 'title type').sort({ completedAt: -1 });

    // Normalize into a unified format
    const allAttempts = [
      ...quizAttempts.map(a => ({
        _id: a._id,
        title: a.quizId?.title || 'Quiz',
        type: 'Quiz',
        score: a.score,
        totalQuestions: a.answers?.length || 0,
        completedAt: a.completedAt
      })),
      ...testAttempts.map(a => ({
        _id: a._id,
        title: a.testId?.title || 'Test',
        type: a.testId?.type || 'Test',
        score: a.score,
        totalQuestions: a.totalQuestions || 0,
        completedAt: a.completedAt
      }))
    ].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    const avgScore = allAttempts.length > 0 
      ? Math.round(allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length) 
      : 0;

    res.json({
      student: { _id: student._id, name: student.name, email: student.email },
      attempts: allAttempts,
      totalAttempts: allAttempts.length,
      avgScore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
