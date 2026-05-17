'use client';
import { useState, useEffect } from 'react';
import { BrainCircuit, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function ManageTests() {
  const [chapters, setChapters] = useState([]);
  const [tests, setTests] = useState([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [type, setType] = useState('pre-test');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  
  const [questionsList, setQuestionsList] = useState([]);

  useEffect(() => {
    const init = async () => {
      const res = await api.get('/chapters');
      setChapters(res.data);
      if(res.data.length > 0) {
        setChapterId(res.data[0]._id);
        fetchTests(res.data[0]._id);
      }
    };
    init();
  }, []);

  const fetchTests = async (cId) => {
    try {
      const res = await api.get(`/tests/chapter/${cId}`);
      setTests(res.data);
    } catch (err) { console.error(err); }
  };

  const handleChapterChange = (e) => {
    setChapterId(e.target.value);
    fetchTests(e.target.value);
  }

  const addQuestionToList = () => {
    if(!questionText || !correctAnswer || options.some(o => !o)) return alert("Fill all question fields");
    if(!options.includes(correctAnswer)) return alert("Correct answer must match one of the options exactly");
    
    setQuestionsList([...questionsList, { text: questionText, options: [...options], correctAnswer }]);
    // Reset Q form
    setQuestionText(''); setOptions(['', '', '', '']); setCorrectAnswer('');
  };

  const handleCreateTest = async () => {
    if(!title || questionsList.length === 0) return alert("Add title and at least one question");
    try {
      await api.post('/tests', { title, chapterId, type, questions: questionsList });
      setTitle(''); setQuestionsList([]);
      fetchTests(chapterId);
      alert("Test Created successfully!");
    } catch (err) { alert('Failed to create test'); }
  };

  const handleDelete = async (testId) => {
    try {
      await api.delete(`/tests/${testId}`);
      fetchTests(chapterId);
    } catch (err) { alert('Failed to delete'); }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <BrainCircuit className="text-purple-400" /> Manage Tests
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CREATE TEST FORM */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Create New Test</h2>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm text-slate-300 block mb-1">Target Chapter</label>
              <select value={chapterId} onChange={handleChapterChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white">
                {chapters.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-300 block mb-1">Test Type</label>
              <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white">
                <option value="pre-test">Pre-test</option>
                <option value="post-test">Post-test</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-sm text-slate-300 block mb-1">Test Title</label>
            <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="E.g. Ameloblastoma Post-Test" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 mb-6">
            <h3 className="font-bold mb-3 text-accent text-sm">Add Question</h3>
            <input type="text" placeholder="Question Text" value={questionText} onChange={(e)=>setQuestionText(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-3 text-sm" />
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              {options.map((opt, i) => (
                <input key={i} type="text" placeholder={`Option ${i+1}`} value={opt} onChange={(e)=>{const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts);}} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm" />
              ))}
            </div>
            <input type="text" placeholder="Exact Correct Answer" value={correctAnswer} onChange={(e)=>setCorrectAnswer(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-3 text-sm border-green-500/50" />
            
            <button onClick={addQuestionToList} className="w-full bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg text-sm transition-colors flex justify-center items-center gap-2"><Plus className="w-4 h-4"/> Add to Test</button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-slate-400 mb-2">Questions Added: {questionsList.length}</p>
            <button onClick={handleCreateTest} className="primary-btn w-full bg-purple-600 hover:bg-purple-700">Save Complete Test</button>
          </div>
        </div>

        {/* EXISTING TESTS LIST */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">Existing Tests for Chapter</h2>
          {tests.length === 0 ? <p className="text-slate-400">No tests found for this chapter.</p> : (
            tests.map(test => (
              <div key={test._id} className="glass-panel p-5 border-l-4 border-l-purple-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg">{test.title}</h3>
                  <button onClick={() => handleDelete(test._id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="bg-purple-900/50 text-purple-200 px-2 py-1 rounded capitalize">{test.type.replace('-', ' ')}</span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">{test.questions.length} Questions</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
