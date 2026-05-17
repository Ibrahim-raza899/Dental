'use client';
import { useState, useEffect } from 'react';
import { BarChart3, Users, ArrowLeft, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '@/lib/api';

export default function StudentReportsPage() {
  const [stats, setStats] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/faculty');
        setStats(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const viewStudentDetail = async (studentId) => {
    try {
      const res = await api.get(`/analytics/faculty/students/${studentId}`);
      setStudentDetail(res.data);
      setViewMode('detail');
    } catch (err) { alert('Failed to load student details'); }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading reports...</div>;

  if (viewMode === 'detail' && studentDetail) {
    const trendData = studentDetail.attempts.map((a, i) => ({
      name: `Quiz ${studentDetail.attempts.length - i}`,
      score: a.score,
      quiz: a.quizId?.title || 'Unknown'
    })).reverse();

    return (
      <div className="animate-in fade-in duration-500">
        <button onClick={() => { setViewMode('overview'); setStudentDetail(null); }} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>
        <h1 className="text-3xl font-bold mb-2">{studentDetail.student.name}</h1>
        <p className="text-slate-400 mb-8">{studentDetail.student.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="glass-panel p-5 border-l-4 border-l-blue-500">
            <p className="text-sm text-slate-400">Total Attempts</p>
            <p className="text-3xl font-bold">{studentDetail.totalAttempts}</p>
          </div>
          <div className="glass-panel p-5 border-l-4 border-l-green-500">
            <p className="text-sm text-slate-400">Average Score</p>
            <p className={`text-3xl font-bold ${studentDetail.avgScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{studentDetail.avgScore}%</p>
          </div>
          <div className="glass-panel p-5 border-l-4 border-l-purple-500">
            <p className="text-sm text-slate-400">Best Score</p>
            <p className="text-3xl font-bold text-purple-400">{studentDetail.attempts.length > 0 ? Math.max(...studentDetail.attempts.map(a => a.score)) : 0}%</p>
          </div>
        </div>

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

        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4">Quiz History</h2>
          <div className="space-y-3">
            {studentDetail.attempts.map((attempt) => (
              <div key={attempt._id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-white/5">
                <div>
                  <p className="font-semibold text-white">{attempt.quizId?.title || 'Unknown Quiz'}</p>
                  <p className="text-xs text-slate-500">{new Date(attempt.completedAt).toLocaleDateString()} — {attempt.answers?.length || 0} questions</p>
                </div>
                <span className={`text-2xl font-bold ${attempt.score >= 70 ? 'text-green-400' : attempt.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{attempt.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><BarChart3 className="text-purple-400" /> Student Reports</h1>
      <p className="text-slate-400 mb-8">Performance analytics and detailed student reports.</p>

      {stats?.classPerformance && stats.classPerformance.length > 0 && (
        <div className="glass-panel p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Class Performance by Quiz</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.classPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="topic" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="avgScore" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="text-blue-400" /> All Students</h2>
        {(!stats?.students || stats.students.length === 0) ? (
          <p className="text-slate-400">No student data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead><tr className="border-b border-white/10">
                <th className="py-3 px-4 text-slate-400">Student</th>
                <th className="py-3 px-4 text-slate-400">Email</th>
                <th className="py-3 px-4 text-slate-400 text-center">Attempts</th>
                <th className="py-3 px-4 text-slate-400 text-center">Avg Score</th>
                <th className="py-3 px-4 text-slate-400 text-right">Action</th>
              </tr></thead>
              <tbody>
                {stats.students.map((s) => (
                  <tr key={s._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-slate-400">{s.email}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{s.attempts}</td>
                    <td className="py-3 px-4 text-center"><span className={`font-bold ${s.avgScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{s.avgScore}%</span></td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => viewStudentDetail(s._id)} className="text-purple-400 hover:text-purple-300 text-xs font-semibold">View Details →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
