'use client';
import { useState, useEffect } from 'react';
import { Book, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chaptersRes, progressRes, resultsRes] = await Promise.all([
          api.get('/chapters'),
          api.get('/progress'),
          api.get('/tests/my-results')
        ]);
        setChapters(chaptersRes.data);
        setProgress(progressRes.data || []);
        setTestResults(resultsRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chaptersRead = progress.filter(p => p.read).length;
  const totalChapters = chapters.length;
  const testsTaken = testResults.length;

  // Find the first unread chapter to suggest as "Continue Reading"
  const readIds = new Set(progress.filter(p => p.read).map(p => p.chapterId));
  const nextChapter = chapters.find(c => !readIds.has(c._id));

  if (loading) return <div className="p-10 text-center text-slate-400">Loading your progress...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8">Student Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-500/20 rounded-lg"><Book className="text-blue-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Chapters Read</p>
            <p className="text-2xl font-bold">{chaptersRead} / {totalChapters}</p>
          </div>
        </div>
        <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="p-3 bg-purple-500/20 rounded-lg"><CheckCircle className="text-purple-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Tests Submitted</p>
            <p className="text-2xl font-bold">{testsTaken}</p>
          </div>
        </div>
        <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-3 bg-green-500/20 rounded-lg"><TrendingUp className="text-green-400" /></div>
          <div>
            <p className="text-sm text-slate-400">Completion</p>
            <p className="text-2xl font-bold">{totalChapters > 0 ? Math.round((chaptersRead / totalChapters) * 100) : 0}%</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-panel p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Course Progress</h2>
        <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${totalChapters > 0 ? (chaptersRead / totalChapters) * 100 : 0}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-400">{chaptersRead} of {totalChapters} chapters completed</p>
      </div>

      {/* Continue Reading */}
      {nextChapter && (
        <div>
          <h2 className="text-xl font-bold mb-4">Continue Reading</h2>
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-accent">{nextChapter.title}</h3>
            <p className="text-slate-400 text-sm mt-1 mb-4">{nextChapter.description}</p>
            <p className="text-xs text-slate-500 mb-4">{nextChapter.topics?.length || 0} topics available</p>
            <Link href={`/dashboard/student/chapters/${nextChapter._id}`} className="primary-btn text-sm py-2 px-4 inline-flex items-center gap-2">
              Resume Chapter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {!nextChapter && totalChapters > 0 && (
        <div className="glass-panel p-8 text-center border-t-4 border-t-green-500">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Chapters Completed!</h2>
          <p className="text-slate-400">Great job. Head to the Assessment Center to take your post-tests.</p>
        </div>
      )}
    </div>
  );
}
