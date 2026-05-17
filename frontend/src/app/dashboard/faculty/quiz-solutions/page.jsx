'use client';
import { useState, useEffect } from 'react';
import { ClipboardList, ChevronDown, ChevronUp, CheckCircle, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function QuizSolutionsPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quizzes');
      setQuizzes(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    try { await api.delete(`/quizzes/${id}`); fetchQuizzes(); }
    catch { alert('Failed to delete'); }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <ClipboardList className="text-purple-400" /> Quiz Solutions
      </h1>
      <p className="text-slate-400 mb-8">View answer keys and explanations for all your generated quizzes.</p>

      {quizzes.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <ClipboardList className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-300">No Quizzes Yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="glass-panel overflow-hidden">
              <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedQuiz(expandedQuiz === quiz._id ? null : quiz._id)}>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{quiz.title}</h3>
                  <div className="flex gap-3 text-xs">
                    <span className="bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">{quiz.questions?.length || 0} Questions</span>
                    <span className="text-slate-500">{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(quiz._id); }} className="p-2 hover:bg-red-900/50 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                  {expandedQuiz === quiz._id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {expandedQuiz === quiz._id && (
                <div className="border-t border-white/10 p-5 bg-slate-900/30 space-y-4">
                  {quiz.questions?.map((q, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                      <p className="font-semibold text-slate-200 mb-3"><span className="text-purple-400 mr-2">Q{idx+1}.</span>{q.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${opt === q.correctAnswer ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-slate-900/50 text-slate-400'}`}>
                            {opt === q.correctAnswer && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                            <span>{String.fromCharCode(65+oIdx)}. {opt}</span>
                          </div>
                        ))}
                      </div>
                      {q.explanation && <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-300">💡 {q.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
