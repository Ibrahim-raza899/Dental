'use client';
import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Upload, FileDown, File } from 'lucide-react';
import api from '@/lib/api';

export default function ManageTopics() {
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('text'); // 'text', 'file', 'both'
  
  const fetchChapters = async () => {
    const res = await api.get('/chapters');
    setChapters(res.data);
    if(res.data.length > 0 && !selectedChapter) setSelectedChapter(res.data[0]._id);
  };

  useEffect(() => { fetchChapters(); }, []);

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if(!selectedChapter) return alert("Select a chapter first");
    if(!title.trim()) return alert("Topic title is required");
    if(uploadMode === 'text' && !content.trim()) return alert("Content is required in text mode");
    if(uploadMode === 'file' && !file) return alert("Please select a file");

    try {
      const formData = new FormData();
      formData.append('title', title);
      if (content) formData.append('content', content);
      if (file) formData.append('file', file);

      await api.post(`/chapters/${selectedChapter}/topics`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle(''); setContent(''); setFile(null);
      fetchChapters();
    } catch (err) { alert('Failed to add topic: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (topicId) => {
    if (!confirm('Delete this topic?')) return;
    try {
      await api.delete(`/chapters/${selectedChapter}/topics/${topicId}`);
      fetchChapters();
    } catch (err) { alert('Failed to delete'); }
  };

  const activeChapter = chapters.find(c => c._id === selectedChapter);

  const getFileIcon = (type) => {
    if (type === 'pdf') return '📄';
    if (type === 'docx' || type === 'doc') return '📝';
    if (type === 'ppt' || type === 'pptx') return '📊';
    return '📎';
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <FileText className="text-purple-400" /> Manage Topics
      </h1>

      <div className="mb-6">
        <label className="text-sm text-slate-300 block mb-2">Select Chapter to Manage</label>
        <select 
          value={selectedChapter} 
          onChange={(e)=>setSelectedChapter(e.target.value)}
          className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500"
        >
          {chapters.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4"><Plus className="w-5 h-5 inline mr-2"/>Add Topic</h2>
            
            {/* Upload Mode Toggle */}
            <div className="flex gap-1 mb-5 p-1 bg-slate-800/80 rounded-lg">
              {['text', 'file', 'both'].map(mode => (
                <button key={mode} onClick={() => setUploadMode(mode)}
                  className={`flex-1 py-2 px-2 rounded-md text-xs font-semibold capitalize transition-all ${uploadMode === mode ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  {mode === 'both' ? 'Text + File' : mode === 'file' ? 'PDF / DOCX / PPT' : 'Text Only'}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddTopic} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-slate-300 block mb-1">Topic Title</label>
                <input required type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
              </div>

              {/* Text Content (shown for 'text' and 'both' modes) */}
              {(uploadMode === 'text' || uploadMode === 'both') && (
                <div>
                  <label className="text-sm text-slate-300 block mb-1">Content / Notes</label>
                  <textarea value={content} onChange={(e)=>setContent(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white h-32" 
                    required={uploadMode === 'text'} placeholder="Enter topic content..." />
                </div>
              )}

              {/* File Upload (shown for 'file' and 'both' modes) */}
              {(uploadMode === 'file' || uploadMode === 'both') && (
                <div>
                  <label className="text-sm text-slate-300 block mb-1">Upload PDF, DOCX, or PPT</label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${file ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 hover:border-purple-500'}`}
                    onClick={() => document.getElementById('topic-file-upload').click()}
                  >
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.ppt,.pptx" 
                      className="hidden" 
                      id="topic-file-upload"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <File className="w-8 h-8 text-green-400" />
                        <span className="text-green-300 text-sm font-semibold">{file.name}</span>
                        <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-slate-400 text-sm">Drop or click to upload</span>
                        <span className="text-xs text-slate-600">.pdf, .doc, .docx, .ppt, .pptx (up to 20MB)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" className="primary-btn bg-purple-600 hover:bg-purple-700">Add Topic</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {!activeChapter ? <p className="text-slate-400">Select a chapter.</p> : activeChapter.topics.length === 0 ? <p className="text-slate-400">No topics in this chapter yet.</p> : (
            activeChapter.topics.map(topic => (
              <div key={topic._id} className="glass-panel p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{topic.title}</h3>
                  <button onClick={() => handleDelete(topic._id)} className="p-2 bg-slate-800 hover:bg-red-900/50 rounded-lg text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                
                {/* Text Content */}
                {topic.content && (
                  <div className="p-4 bg-slate-900/50 rounded-lg text-slate-300 text-sm whitespace-pre-wrap border border-white/5 mb-3">
                    {topic.content}
                  </div>
                )}

                {/* File Attachment */}
                {topic.fileUrl && (
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/10">
                    <span className="text-2xl">{getFileIcon(topic.fileType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{topic.fileName || 'Uploaded file'}</p>
                      <p className="text-xs text-slate-500 uppercase">{topic.fileType || 'file'}</p>
                    </div>
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000'}${topic.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg"
                    >
                      <FileDown className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
