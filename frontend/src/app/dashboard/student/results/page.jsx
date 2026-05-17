'use client';
import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

export default function MyResultsPage() {
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllResults = async () => {
      try {
        // Fetch both quiz and test results
        const [quizRes, testRes] = await Promise.all([
          api.get('/quizzes/my-results').catch(() => ({ data: [] })),
          api.get('/tests/my-results').catch(() => ({ data: [] }))
        ]);

        // Normalize into unified format
        const quizResults = (quizRes.data || []).map(a => ({
          _id: a._id,
          title: a.quizId?.title || 'Quiz',
          type: 'Quiz',
          score: a.score,
          questionCount: a.answers?.length || 0,
          completedAt: a.completedAt
        }));

        const testResults = (testRes.data || []).map(a => ({
          _id: a._id,
          title: a.testId?.title || 'Test',
          type: a.testId?.type === 'pre-test' ? 'Pre-Test' : a.testId?.type === 'post-test' ? 'Post-Test' : 'Test',
          score: a.score,
          questionCount: a.totalQuestions || 0,
          completedAt: a.completedAt
        }));

        // Combine and sort by date
        const combined = [...quizResults, ...testResults]
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        setAllResults(combined);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAllResults();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-400">Loading results...</div>;

  const avgScore = allResults.length > 0 ? Math.round(allResults.reduce((s, a) => s + a.score, 0) / allResults.length) : 0;
  const bestScore = allResults.length > 0 ? Math.max(...allResults.map(a => a.score)) : 0;
  const passed = allResults.filter(a => a.score >= 70).length;

  const trendData = allResults.map((a, i) => ({
    name: `#${allResults.length - i}`,
    score: a.score,
  })).reverse();

  const getTypeBadgeClass = (type) => {
    switch(type) {
      case 'Quiz': return 'bg-purple-900/50 text-purple-300';
      case 'Pre-Test': return 'bg-blue-900/50 text-blue-300';
      case 'Post-Test': return 'bg-green-900/50 text-green-300';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <Trophy className="text-yellow-400" /> My Results
      </h1>
      <p className="text-slate-400 mb-8">Track your quiz and test performance over time.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="glass-panel p-5 border-l-4 border-l-blue-500">
          <p className="text-sm text-slate-400">Total Assessments</p>
          <p className="text-2xl font-bold">{allResults.length}</p>
        </div>
        <div className="glass-panel p-5 border-l-4 border-l-green-500">
          <p className="text-sm text-slate-400">Average Score</p>
          <p className={`text-2xl font-bold ${avgScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{avgScore}%</p>
        </div>
        <div className="glass-panel p-5 border-l-4 border-l-purple-500">
          <p className="text-sm text-slate-400">Best Score</p>
          <p className="text-2xl font-bold text-purple-400">{bestScore}%</p>
        </div>
        <div className="glass-panel p-5 border-l-4 border-l-yellow-500">
          <p className="text-sm text-slate-400">Passed (≥70%)</p>
          <p className="text-2xl font-bold text-yellow-400">{passed}/{allResults.length}</p>
        </div>
      </div>

      {/* Trend Chart */}
      {trendData.length > 1 && (
        <div className="glass-panel p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-green-400" /> Score Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4">Assessment History</h2>
        {allResults.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-300">No Results Yet</p>
            <p className="text-slate-500 mt-1">Take a quiz or test to see your results here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allResults.map((result) => (
              <div key={result._id} className={`flex justify-between items-center p-4 rounded-xl border transition-all ${result.score >= 70 ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-800/30 border-white/5'}`}>
                <div className="flex items-center gap-3">
                  {result.score >= 70 ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                  <div>
                    <p className="font-semibold text-white">{result.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${getTypeBadgeClass(result.type)}`}>{result.type}</span>
                      <span className="text-xs text-slate-500">{new Date(result.completedAt).toLocaleDateString()} • {result.questionCount} questions</span>
                    </div>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${result.score >= 70 ? 'text-green-400' : result.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{result.score}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
