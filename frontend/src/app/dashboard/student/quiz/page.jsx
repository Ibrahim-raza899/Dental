'use client';
import { useState, useEffect, useCallback } from 'react';
import { Beaker, Clock, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

export default function TakeQuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/quizzes').then(res => { setQuizzes(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const startQuiz = async (quizId) => {
    try {
      const res = await api.post(`/quizzes/${quizId}/start`);
      setAttempt(res.data.attempt);
      setActiveQuiz(res.data.quiz);
      setTimeLeft((res.data.quiz.settings?.timeLimitMinutes || 30) * 60);
      setAnswers({});
      setResult(null);
    } catch (err) { alert('Failed to start: ' + (err.response?.data?.message || err.message)); }
  };

  // Timer
  useEffect(() => {
    if (!activeQuiz || result) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft, result]);

  // Anti-cheating
  useEffect(() => {
    if (!attempt || result) return;
    const handleBlur = () => {
      api.post('/quizzes/log-event', { attemptId: attempt._id, event: 'window_blur' }).catch(() => {});
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [attempt, result]);

  const handleSubmit = useCallback(async () => {
    if (!attempt || !activeQuiz || submitting) return;
    setSubmitting(true);
    try {
      const answerPayload = activeQuiz.questions.map(q => ({
        questionId: q._id,
        submittedAnswer: answers[q._id] || '',
        timeTakenSeconds: 0,
      }));
      const res = await api.post(`/quizzes/${activeQuiz._id}/submit`, { attemptId: attempt._id, answers: answerPayload });
      setResult(res.data);
    } catch (err) { alert('Submit failed'); }
    finally { setSubmitting(false); }
  }, [attempt, activeQuiz, answers, submitting]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (loading) return <div className="p-10 text-center text-slate-400">Loading quizzes...</div>;

  // Results view
  if (result) {
    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
        <div className="glass-panel p-10 text-center border-t-4 border-t-green-500">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-slate-400 mb-6">{activeQuiz?.title}</p>
          <div className="inline-block p-6 bg-slate-900 rounded-2xl border border-white/10 mb-6">
            <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Your Score</p>
            <p className={`text-6xl font-bold ${result.score >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{result.score}%</p>
            <p className="text-sm text-slate-500 mt-2">{result.correctCount} of {result.totalQuestions} correct</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setActiveQuiz(null); setAttempt(null); setResult(null); }} className="primary-btn">Back to Quizzes</button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking view
  if (activeQuiz) {
    return (
      <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
        <div className="sticky top-0 z-10 glass-panel p-4 mb-6 flex justify-between items-center">
          <h2 className="font-bold text-white truncate">{activeQuiz.title}</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{Object.keys(answers).length}/{activeQuiz.questions.length}</span>
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'}`}>
              <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {activeQuiz.questions.map((q, idx) => (
            <div key={q._id} className="glass-panel p-6">
              <p className="font-bold text-lg mb-4"><span className="text-blue-400 mr-2">Q{idx+1}.</span>{q.text}</p>
              <div className="space-y-2">
                {q.options?.map((opt, oIdx) => (
                  <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${answers[q._id] === opt ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800/50 border-transparent hover:bg-slate-800'}`}>
                    <input type="radio" name={`q-${q._id}`} checked={answers[q._id] === opt} onChange={() => setAnswers({...answers, [q._id]: opt})} className="w-4 h-4" />
                    <span className="text-slate-200">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button onClick={() => { if (confirm('Abandon quiz?')) { setActiveQuiz(null); setAttempt(null); } }} className="text-slate-400 hover:text-white text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="primary-btn bg-green-600 hover:bg-green-700 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // Quiz list view
  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><Beaker className="text-blue-400" /> Take Quiz</h1>
      <p className="text-slate-400 mb-8">Choose a quiz to test your knowledge. Graded and timed.</p>

      {quizzes.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Beaker className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-300">No Quizzes Available</p>
          <p className="text-slate-500 mt-1">Your faculty hasn't created any quizzes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="glass-panel p-6 flex flex-col border-t-4 border-t-blue-500">
              <h3 className="text-lg font-bold text-white mb-2">{quiz.title}</h3>
              {quiz.description && <p className="text-sm text-slate-400 mb-3">{quiz.description}</p>}
              <div className="flex gap-3 text-xs mb-4">
                <span className="bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">{quiz.questions?.length || 0} Questions</span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.settings?.timeLimitMinutes || 30} min</span>
              </div>
              <button onClick={() => startQuiz(quiz._id)} className="primary-btn mt-auto flex items-center justify-center gap-2 text-sm py-2">
                Start Quiz <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
