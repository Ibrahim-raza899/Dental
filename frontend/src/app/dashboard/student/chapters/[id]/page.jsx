'use client';
import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, FileDown, File } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function ChapterDetails({ params }) {
  const [chapter, setChapter] = useState(null);
  const [tests, setTests] = useState({ pre: [], post: [] });
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(null);

  useEffect(() => {
    const fetchChapterAndTests = async () => {
      try {
        const [chapterRes, testsRes, progressRes] = await Promise.all([
          api.get(`/chapters/${params.id}`),
          api.get(`/tests/chapter/${params.id}`),
          api.get('/progress')
        ]);
        
        setChapter(chapterRes.data);
        
        const preTests = testsRes.data.filter(t => t.type === 'pre-test');
        const postTests = testsRes.data.filter(t => t.type === 'post-test');
        setTests({ pre: preTests, post: postTests });

        const readStatus = progressRes.data.some(p => p.chapterId === params.id && p.read);
        setIsRead(readStatus);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChapterAndTests();
  }, [params.id]);

  const markAsRead = async () => {
    try {
      await api.post('/progress/mark-read', { chapterId: params.id });
      setIsRead(true);
      alert("Chapter marked as Read!");
    } catch (error) {
      alert("Failed to mark as read");
    }
  };

  const exportTextAsPdf = async (topic) => {
    setExportingPdf(topic._id);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(topic.title, margin, 20);
      
      // Chapter Name
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      doc.text(`Chapter: ${chapter.title}`, margin, 30);
      
      // Divider line
      doc.setDrawColor(150);
      doc.line(margin, 34, pageWidth - margin, 34);
      
      // Content
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(topic.content || '', maxWidth);
      doc.text(lines, margin, 42);
      
      doc.save(`${topic.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      alert('Failed to export PDF: ' + err.message);
    } finally {
      setExportingPdf(null);
    }
  };

  const getFileIcon = (type) => {
    if (type === 'pdf') return '📄';
    if (type === 'docx' || type === 'doc') return '📝';
    if (type === 'ppt' || type === 'pptx') return '📊';
    return '📎';
  };

  const getFileLabel = (type) => {
    if (type === 'ppt' || type === 'pptx') return 'PowerPoint Presentation';
    if (type === 'docx' || type === 'doc') return 'Word Document';
    if (type === 'pdf') return 'PDF Document';
    return 'File';
  };

  if (loading || !chapter) return <div className="p-10 text-center">Loading Chapter...</div>;

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      {/* HEADER & PRE-TEST */}
      <div className="glass-panel p-8 mb-8 border-l-4 border-l-blue-500 relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
        <p className="text-slate-400 mb-6">{chapter.description}</p>
        
        {tests.pre.length > 0 && (
          <div className="bg-slate-900/50 p-4 rounded-xl border border-blue-500/30 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-300">Required Before Reading:</p>
              <p className="font-bold text-blue-400">{tests.pre[0].title}</p>
            </div>
            <Link href={`/dashboard/student/tests`} className="primary-btn bg-blue-600 hover:bg-blue-700 text-sm py-2">
              Take Pre-test
            </Link>
          </div>
        )}
      </div>

      {/* TOPICS LIST */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-accent" /> Topics</h2>
        
        {chapter.topics?.length === 0 ? <p className="text-slate-400">No topics available yet.</p> : (
          chapter.topics.map((topic, idx) => (
            <div key={topic._id} className="glass-panel p-6">
              <h3 className="text-xl font-bold mb-4">{idx + 1}. {topic.title}</h3>
              
              {/* Text Content */}
              {topic.content && (
                <div>
                  <div className="prose prose-invert max-w-none text-slate-300 mb-3">
                    {topic.content.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                  {/* Export text content as PDF */}
                  <button
                    onClick={() => exportTextAsPdf(topic)}
                    disabled={exportingPdf === topic._id}
                    className="flex items-center gap-2 text-sm font-semibold text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                  >
                    <FileDown className="w-4 h-4" />
                    {exportingPdf === topic._id ? 'Exporting...' : 'Export Notes as PDF'}
                  </button>
                </div>
              )}

              {/* Downloadable File (PDF / DOCX / PPT) */}
              {topic.fileUrl && (
                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-white/10 mt-4">
                  <span className="text-3xl">{getFileIcon(topic.fileType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-semibold truncate">{topic.fileName || 'Lecture Document'}</p>
                    <p className="text-xs text-slate-500 uppercase">{getFileLabel(topic.fileType)} — Click to download</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Direct download of original file */}
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000'}${topic.fileUrl}`} 
                      download={topic.fileName}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
                    >
                      <FileDown className="w-4 h-4" /> Download {(topic.fileType || '').toUpperCase()}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MARK AS READ & POST-TEST */}
      <div className="glass-panel p-8 flex flex-col items-center text-center">
        <h2 className="text-xl font-bold mb-4">Finished Reading?</h2>
        
        {!isRead ? (
          <button onClick={markAsRead} className="primary-btn bg-green-600 hover:bg-green-700 flex items-center gap-2 mb-6">
            <CheckCircle className="w-5 h-5" /> Mark Chapter as Read
          </button>
        ) : (
          <div className="text-green-400 font-bold flex items-center gap-2 mb-6">
            <CheckCircle className="w-5 h-5" /> Chapter Completed!
          </div>
        )}

        {isRead && tests.post.length > 0 && (
          <div className="w-full bg-slate-900/50 p-4 rounded-xl border border-purple-500/30 flex justify-between items-center mt-4">
            <div>
              <p className="text-sm text-slate-300">Ready to test your knowledge?</p>
              <p className="font-bold text-purple-400">{tests.post[0].title}</p>
            </div>
            <Link href={`/dashboard/student/tests`} className="primary-btn bg-purple-600 hover:bg-purple-700 text-sm py-2">
              Take Post-test
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
