'use client';
import { useState, useEffect } from 'react';
import { Beaker, Loader2, CheckCircle, XCircle, RotateCw } from 'lucide-react';
import api from '@/lib/api';

export default function SampleQuizPage() {
  const [chapters, setChapters] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/chapters').then(res => setChapters(res.data)).catch(console.error);
  }, []);

  const generateQuiz = async () => {
    if (!selectedTopic) return alert('Select a topic first');
    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const res = await api.post('/ai/sample-quiz', { topic: selectedTopic, numQuestions });
      setQuiz(res.data.quiz);
    } catch (err) {
      alert('Failed to generate quiz: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  const handleSubmit = () => setSubmitted(true);

  const getScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.forEach((q, idx) => { if (answers[idx] === q.correctAnswer) correct++; });
    return Math.round((correct / quiz.length) * 100);
  };

  const allTopics = chapters.flatMap(c => c.topics?.map(t => ({ label: `${c.title} → ${t.title}`, value: t.title })) || []);

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <Beaker className="text-purple-400" /> Sample Practice Quiz
      </h1>
      <p className="text-slate-400 mb-8">Generate AI-powered practice quizzes to test your knowledge. Not graded!</p>

      {!quiz && !loading && (
        <div className="glass-panel p-8">
          <div className="space-y-5">
            <div>
              <label className="text-sm text-slate-300 block mb-2">Select Topic</label>
              <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white">
                <option value="">-- Choose a Topic --</option>
                {allTopics.map((t, i) => <option key={i} value={t.value}>{t.label}</option>)}
                <option value="General Oral Pathology">General Oral Pathology</option>
                <option value="Odontogenic Cysts">Odontogenic Cysts</option>
                <option value="Ameloblastoma">Ameloblastoma</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 block mb-2">Number of Questions</label>
              <select value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white">
                <option value={3}>3 Questions (Quick)</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
            <button onClick={generateQuiz} className="primary-btn w-full flex items-center justify-center gap-2">
              <Beaker className="w-5 h-5" /> Generate Practice Quiz
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="glass-panel p-16 text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-300">AI is creating your practice quiz...</p>
        </div>
      )}

      {quiz && !submitted && (
        <div className="space-y-6">
          <div className="glass-panel p-4 flex justify-between items-center">
            <span className="text-sm text-slate-400">Practice Mode — Not Graded</span>
            <span className="text-sm text-purple-400 font-semibold">{Object.keys(answers).length}/{quiz.length} answered</span>
          </div>
          {quiz.map((q, idx) => (
            <div key={idx} className="glass-panel p-6">
              <p className="font-bold text-lg mb-4"><span className="text-purple-400 mr-2">Q{idx+1}.</span>{q.text}</p>
              <div className="space-y-2">
                {q.options?.map((opt, oIdx) => (
                  <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${answers[idx] === opt ? 'bg-purple-600/20 border-purple-500' : 'bg-slate-800/50 border-transparent hover:bg-slate-800'}`}>
                    <input type="radio" name={`q-${idx}`} checked={answers[idx] === opt} onChange={() => setAnswers({...answers, [idx]: opt})} className="w-4 h-4" />
                    <span className="text-slate-200">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSubmit} disabled={Object.keys(answers).length !== quiz.length}
            className="primary-btn w-full bg-green-600 hover:bg-green-700 disabled:opacity-50">
            Check Answers
          </button>
        </div>
      )}

      {quiz && submitted && (
        <div className="space-y-6">
          <div className="glass-panel p-8 text-center border-t-4 border-t-purple-500">
            <p className="text-sm text-slate-400 mb-2">Practice Score</p>
            <p className={`text-5xl font-bold mb-2 ${getScore() >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{getScore()}%</p>
            <p className="text-slate-400 text-sm">Review the explanations below</p>
          </div>
          {quiz.map((q, idx) => {
            const isCorrect = answers[idx] === q.correctAnswer;
            return (
              <div key={idx} className={`glass-panel p-6 border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="flex items-start gap-3 mb-3">
                  {isCorrect ? <CheckCircle className="w-5 h-5 text-green-400 mt-1" /> : <XCircle className="w-5 h-5 text-red-400 mt-1" />}
                  <p className="font-bold text-lg">{q.text}</p>
                </div>
                <p className="text-sm mb-1"><span className="text-slate-400">Your answer:</span> <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>{answers[idx]}</span></p>
                {!isCorrect && <p className="text-sm mb-2"><span className="text-slate-400">Correct:</span> <span className="text-green-400">{q.correctAnswer}</span></p>}
                {q.explanation && <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-300 mt-2">💡 {q.explanation}</div>}
              </div>
            );
          })}
          <button onClick={() => { setQuiz(null); setAnswers({}); setSubmitted(false); }}
            className="primary-btn w-full flex items-center justify-center gap-2">
            <RotateCw className="w-5 h-5" /> Try Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}
