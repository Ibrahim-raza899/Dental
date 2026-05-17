'use client';
import { useState, useEffect } from 'react';
import { Activity, CheckCircle, ChevronRight, Filter } from 'lucide-react';
import api from '@/lib/api';

export default function TakeTestPage() {
  const [allTests, setAllTests] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [filterChapter, setFilterChapter] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, chaptersRes] = await Promise.all([
          api.get('/tests/all'),
          api.get('/chapters')
        ]);
        setAllTests(testsRes.data);
        setChapters(chaptersRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filteredTests = allTests.filter(test => {
    if (filterChapter && (test.chapterId?._id || test.chapterId) !== filterChapter) return false;
    if (filterType && test.type !== filterType) return false;
    return true;
  });

  const startTest = (test) => {
    setActiveTest(test);
    setAnswers({});
    setScore(null);
  };

  const handleAnswerChange = (qIndex, value) => {
    setAnswers({ ...answers, [qIndex]: value });
  };

  const submitTest = async () => {
    let correct = 0;
    activeTest.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    
    const finalScore = Math.round((correct / activeTest.questions.length) * 100);
    
    try {
      // Send answers to backend for proper storage in TestAttempt
      const answersPayload = activeTest.questions.map((q, idx) => ({
        submittedAnswer: answers[idx] || '',
      }));
      const res = await api.post('/tests/submit', { 
        testId: activeTest._id, 
        score: finalScore,
        answers: answersPayload
      });
      setScore(res.data.score || finalScore);
    } catch (err) {
      alert("Failed to submit score");
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading tests...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Activity className="text-blue-400" /> Assessment Center
      </h1>

      {!activeTest ? (
        <div>
          {/* Filters */}
          <div className="glass-panel p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-300">Filter Tests</span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <select value={filterChapter} onChange={(e) => setFilterChapter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm">
                <option value="">All Chapters</option>
                {chapters.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm">
                <option value="">All Types</option>
                <option value="pre-test">Pre-test</option>
                <option value="post-test">Post-test</option>
              </select>
              {(filterChapter || filterType) && (
                <button onClick={() => { setFilterChapter(''); setFilterType(''); }} className="text-xs text-slate-400 hover:text-white transition-colors">Clear filters</button>
              )}
            </div>
          </div>

          {/* Tests Grid */}
          {filteredTests.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-xl font-semibold text-slate-300 mb-2">No Tests Available</p>
              <p className="text-slate-500">
                {allTests.length === 0 ? 'Your faculty hasn\'t created any tests yet.' : 'No tests match your filters. Try adjusting them.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map(test => (
                <div key={test._id} className="glass-panel p-6 flex flex-col border-t-4 border-t-blue-500 hover:bg-white/5 transition-all">
                  <h3 className="text-lg font-bold text-white mb-2">{test.title}</h3>
                  <div className="flex gap-2 text-xs mb-3 flex-wrap">
                    <span className={`px-2 py-1 rounded capitalize font-semibold ${test.type === 'pre-test' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'}`}>
                      {test.type.replace('-', ' ')}
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">{test.questions.length} Qs</span>
                  </div>
                  {test.chapterId?.title && (
                    <p className="text-xs text-slate-500 mb-4">Chapter: {test.chapterId.title}</p>
                  )}
                  <button onClick={() => startTest(test)} className="primary-btn mt-auto py-2 flex items-center justify-center gap-2 text-sm">
                    Start Test <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-8 max-w-3xl mx-auto border-t-4 border-t-blue-500 relative">
          
          {score === null ? (
            <>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <h2 className="text-2xl font-bold">{activeTest.title}</h2>
                <button onClick={() => setActiveTest(null)} className="text-sm text-slate-400 hover:text-white">Cancel Test</button>
              </div>

              <div className="space-y-8">
                {activeTest.questions.map((q, idx) => (
                  <div key={idx} className="bg-slate-900/30 p-6 rounded-xl border border-white/5">
                    <p className="font-bold text-lg mb-4 text-white">{idx + 1}. {q.text}</p>
                    <div className="flex flex-col gap-3">
                      {q.options.map((opt, oIdx) => (
                        <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${answers[idx] === opt ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800/50 border-transparent hover:bg-slate-800'}`}>
                          <input 
                            type="radio" 
                            name={`question-${idx}`} 
                            value={opt} 
                            checked={answers[idx] === opt}
                            onChange={() => handleAnswerChange(idx, opt)}
                            className="w-4 h-4 text-blue-500"
                          />
                          <span className="text-slate-200">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                <button 
                  onClick={submitTest} 
                  disabled={Object.keys(answers).length !== activeTest.questions.length}
                  className="primary-btn bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Final Answers
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-2">Test Complete!</h2>
              <p className="text-slate-400 mb-8">You have successfully submitted the {activeTest.type.replace('-', ' ')}.</p>
              
              <div className="inline-block p-6 bg-slate-900 rounded-2xl border border-white/10 mb-8">
                <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Final Score</p>
                <p className={`text-6xl font-bold ${score >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{score}%</p>
              </div>

              <div>
                <button onClick={() => { setActiveTest(null); setScore(null); }} className="primary-btn">
                  Back to Assessments
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
