'use client';
import { useState, useEffect } from 'react';
import { Users, BookOpen, FileCheck, Upload, BarChart3, ClipboardList, BrainCircuit, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function FacultyDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/faculty');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch faculty stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-400">Loading faculty dashboard...</div>;

  const totalStudents = stats?.totalStudents || 0;
  const totalQuizzes = (stats?.totalQuizzes || 0) + (stats?.totalTests || 0);
  const totalAttempts = stats?.totalAttempts || 0;
  const overallAvg = stats?.classPerformance?.length > 0
    ? Math.round(stats.classPerformance.reduce((s, c) => s + c.avgScore * c.attempts, 0) / stats.classPerformance.reduce((s, c) => s + c.attempts, 0))
    : 0;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <BrainCircuit className="text-purple-400" /> Faculty Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
        <div className="glass-panel p-5 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="p-3 bg-purple-500/20 rounded-lg"><ClipboardList className="text-purple-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Total Assessments</p>
            <p className="text-2xl font-bold">{totalQuizzes}</p>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-500/20 rounded-lg"><Users className="text-blue-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Active Students</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-3 bg-green-500/20 rounded-lg"><FileCheck className="text-green-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Total Attempts</p>
            <p className="text-2xl font-bold">{totalAttempts}</p>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4 border-l-4 border-l-yellow-500">
          <div className="p-3 bg-yellow-500/20 rounded-lg"><TrendingUp className="text-yellow-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Class Average</p>
            <p className="text-2xl font-bold">{overallAvg}%</p>
          </div>
        </div>
      </div>

      {/* Quiz Performance */}
      {stats?.classPerformance && stats.classPerformance.length > 0 && (
        <div className="glass-panel p-6 mb-8">
          <h2 className="text-xl font-bold mb-5">Assessment Performance Overview</h2>
          <div className="space-y-4">
            {stats.classPerformance.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-sm text-slate-300 w-48 truncate" title={item.topic}>{item.topic}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-3 relative">
                  <div 
                    className={`h-3 rounded-full transition-all duration-700 ${item.avgScore >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : item.avgScore >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-pink-400'}`}
                    style={{ width: `${item.avgScore}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-bold w-12 text-right ${item.avgScore >= 70 ? 'text-green-400' : item.avgScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {item.avgScore}%
                </span>
                <span className="text-xs text-slate-500 w-20 text-right">{item.attempts} attempts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weakness Alert */}
      {stats?.weakness && (
        <div className="glass-panel p-6 border-l-4 border-l-red-500 mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-2">Class Weakness Alert</h2>
          <p className="text-slate-300">Students are struggling the most with: <strong className="text-white">{stats.weakness}</strong>. Consider creating additional content or review sessions for this topic.</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/faculty/upload-quiz" className="group p-5 bg-slate-800/50 rounded-xl border border-white/5 hover:border-purple-500/50 transition-all text-center">
            <Upload className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-white">Upload PDF & Generate Quiz</p>
            <p className="text-xs text-slate-400 mt-1">AI-powered quiz creation</p>
          </Link>
          <Link href="/dashboard/faculty/quiz-solutions" className="group p-5 bg-slate-800/50 rounded-xl border border-white/5 hover:border-blue-500/50 transition-all text-center">
            <ClipboardList className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-white">Quiz Solutions</p>
            <p className="text-xs text-slate-400 mt-1">View answer keys</p>
          </Link>
          <Link href="/dashboard/faculty/reports" className="group p-5 bg-slate-800/50 rounded-xl border border-white/5 hover:border-green-500/50 transition-all text-center">
            <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-white">Student Reports</p>
            <p className="text-xs text-slate-400 mt-1">Performance analytics</p>
          </Link>
          <Link href="/dashboard/faculty/chapters" className="group p-5 bg-slate-800/50 rounded-xl border border-white/5 hover:border-yellow-500/50 transition-all text-center">
            <BookOpen className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-white">Manage Content</p>
            <p className="text-xs text-slate-400 mt-1">Chapters & topics</p>
          </Link>
        </div>
      </div>

      {/* Students Table */}
      {stats?.students && stats.students.length > 0 && (
        <div className="glass-panel p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Student Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-slate-400 font-semibold">Student</th>
                  <th className="py-3 px-4 text-slate-400 font-semibold">Email</th>
                  <th className="py-3 px-4 text-slate-400 font-semibold text-center">Attempts</th>
                  <th className="py-3 px-4 text-slate-400 font-semibold text-center">Avg Score</th>
                  <th className="py-3 px-4 text-slate-400 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.students.map((student) => (
                  <tr key={student._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{student.name}</td>
                    <td className="py-3 px-4 text-slate-400">{student.email}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{student.attempts}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${student.avgScore >= 70 ? 'text-green-400' : student.avgScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {student.avgScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/dashboard/faculty/reports?student=${student._id}`} className="text-purple-400 hover:text-purple-300 text-xs font-semibold">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
