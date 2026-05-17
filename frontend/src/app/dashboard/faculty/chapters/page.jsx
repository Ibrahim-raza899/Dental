'use client';
import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function ManageChapters() {
  const [chapters, setChapters] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchChapters = async () => {
    try {
      const res = await api.get('/chapters');
      setChapters(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const handleAddChapter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/chapters', { title, description });
      setTitle('');
      setDescription('');
      fetchChapters();
    } catch (err) {
      alert('Failed to add chapter');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    try {
      await api.delete(`/chapters/${id}`);
      fetchChapters();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <FileText className="text-purple-400" /> Manage Chapters
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5"/> Add New Chapter</h2>
            <form onSubmit={handleAddChapter} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-slate-300 block mb-1">Title</label>
                <input required type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="text-sm text-slate-300 block mb-1">Description</label>
                <textarea required value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white h-24" />
              </div>
              <button type="submit" className="primary-btn mt-2 bg-purple-600 hover:bg-purple-700">Create Chapter</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {loading ? <p>Loading chapters...</p> : chapters.length === 0 ? <p className="text-slate-400">No chapters found.</p> : (
            chapters.map(chapter => (
              <div key={chapter._id} className="glass-panel p-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{chapter.title}</h3>
                  <p className="text-slate-400 text-sm mb-3">{chapter.description}</p>
                  <span className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-300">{chapter.topics?.length || 0} Topics</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(chapter._id)} className="p-2 bg-slate-800 hover:bg-red-900/50 rounded-lg text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
