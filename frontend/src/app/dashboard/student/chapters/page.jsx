'use client';
import { useState, useEffect } from 'react';
import { Book, CheckCircle, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function ChaptersList() {
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chaptersRes, progressRes] = await Promise.all([
          api.get('/chapters'),
          api.get('/progress')
        ]);
        setChapters(chaptersRes.data);
        setProgress(progressRes.data);
      } catch (err) {
        console.error("Failed to load chapters");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isRead = (chapterId) => {
    return progress.some(p => p.chapterId === chapterId && p.read);
  };

  if (loading) return <div className="p-10 text-center">Loading Course Content...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Book className="text-blue-400" /> Course Chapters
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chapters.map(chapter => (
          <div key={chapter._id} className="glass-panel p-6 flex flex-col h-full border-t-4 border-t-blue-500">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{chapter.title}</h2>
              {isRead(chapter._id) && <CheckCircle className="text-green-400 w-5 h-5" />}
            </div>
            
            <p className="text-slate-400 text-sm mb-6 flex-1">{chapter.description}</p>
            
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
              <span className="text-xs text-slate-500">{chapter.topics?.length || 0} Topics</span>
              <Link href={`/dashboard/student/chapters/${chapter._id}`} className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View Content <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
