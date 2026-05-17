'use client';
import { useState } from 'react';
import { BrainCircuit, UploadCloud, MessageSquare, FileText, Type, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function AIPage() {
  // Quiz Generator State
  const [quizMode, setQuizMode] = useState('file'); // 'file' | 'text'
  const [file, setFile] = useState(null);
  const [plainText, setPlainText] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizError, setQuizError] = useState('');

  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (quizMode === 'file' && !file) return;
    if (quizMode === 'text' && !plainText.trim()) return;

    setLoading(true);
    setQuizData(null);
    setQuizError('');

    try {
      const formData = new FormData();
      formData.append('numQuestions', numQuestions);
      if (quizMode === 'file' && file) {
        formData.append('file', file);
      } else {
        formData.append('text', plainText);
      }

      const response = await api.post('/ai/generate-quiz', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setQuizData(response.data.quiz);
    } catch (error) {
      setQuizError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatMessage('');
    setChatLoading(true);

    try {
      const response = await api.post('/ai/chat', { 
        message: userMessage, 
        context: 'General Oral Pathology' 
      });
      setChatHistory(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const difficultyColor = (d) => {
    if (d === 'easy') return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (d === 'hard') return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <BrainCircuit className="text-purple-500 w-8 h-8" /> 
        AI Lab & Intelligence
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Quiz Generator */}
        <div className="glass-panel p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <UploadCloud className="text-blue-400" /> AI Quiz Generator
          </h2>
          <p className="text-slate-400 text-sm mb-5">Generate an MCQ quiz from a document or paste text directly.</p>

          {/* Mode Toggle */}
          <div className="flex gap-1 mb-5 p-1 bg-slate-800/80 rounded-lg">
            <button
              onClick={() => { setQuizMode('file'); setFile(null); }}
              className={`flex-1 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${quizMode === 'file' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <UploadCloud className="w-3.5 h-3.5" /> Upload File
            </button>
            <button
              onClick={() => { setQuizMode('text'); setFile(null); }}
              className={`flex-1 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${quizMode === 'text' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Type className="w-3.5 h-3.5" /> Plain Text
            </button>
          </div>

          <form onSubmit={handleGenerateQuiz} className="flex flex-col gap-4 flex-1">
            {quizMode === 'file' ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${file ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 hover:border-blue-500'}`}
                onClick={() => document.getElementById('quiz-file-upload').click()}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  className="hidden"
                  id="quiz-file-upload"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                    <span className="text-green-300 font-semibold text-sm">{file.name}</span>
                    <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-slate-400" />
                    <span className="text-slate-300 font-semibold">Drop or click to upload</span>
                    <span className="text-xs text-slate-500">Supports PDF, DOCX, PPT, PPTX, TXT (up to 30MB)</span>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                placeholder="Paste your lecture notes, study material, or any text content here... (minimum 50 characters)"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500 resize-none h-48"
                required
              />
            )}

            {/* Number of Questions */}
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3 border border-slate-700">
              <label className="text-sm text-slate-300 whitespace-nowrap">Number of Questions:</label>
              <input
                type="number"
                min={3}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-600 rounded-lg p-1.5 text-white text-center text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-500">(3–20)</span>
            </div>

            {quizError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {quizError}
              </div>
            )}

            <button
              type="submit"
              disabled={(quizMode === 'file' && !file) || (quizMode === 'text' && !plainText.trim()) || loading}
              className="primary-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                  Analyzing with Gemini AI...
                </>
              ) : (
                <><BrainCircuit className="w-4 h-4" /> Generate {numQuestions} Questions</>
              )}
            </button>
          </form>

          {/* Quiz Results */}
          {quizData && (
            <div className="mt-6 bg-slate-800/50 rounded-xl border border-white/10 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-800/90 backdrop-blur-sm">
                <h3 className="font-bold text-accent">Generated Quiz ({quizData.length} Questions)</h3>
              </div>
              <div className="p-4 space-y-5">
                {quizData.map((q, idx) => (
                  <div key={idx} className="pb-4 border-b border-white/5 last:border-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-slate-200 text-sm">{idx + 1}. {q.text || q.questionText}</p>
                      {q.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${difficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                    <ul className="pl-3 mb-2 space-y-1">
                      {q.options.map((opt, oIdx) => (
                        <li key={oIdx} className={`text-xs py-1 px-2 rounded ${opt === q.correctAnswer ? 'text-green-400 bg-green-500/10' : 'text-slate-400'}`}>
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && (
                      <p className="text-xs text-slate-500 italic border-l-2 border-slate-600 pl-2">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clinical Chatbot */}
        <div className="glass-panel p-6 flex flex-col h-[700px]">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <MessageSquare className="text-green-400" /> Clinical Assistant
          </h2>
          <p className="text-slate-400 text-sm mb-4">Ask any question about Odontogenic Oral Pathology.</p>
          
          <div className="flex-1 bg-slate-900/50 rounded-xl p-4 overflow-y-auto mb-4 border border-white/5 flex flex-col gap-4">
            {chatHistory.length === 0 ? (
              <div className="text-center text-slate-500 my-auto">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                Ask me any question about Odontogenic Oral Pathology!
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-600 self-end rounded-tr-none text-white' : 'bg-slate-800 self-start rounded-tl-none text-slate-200'}`}>
                  {msg.text}
                </div>
              ))
            )}
            {chatLoading && (
              <div className="bg-slate-800 self-start rounded-tl-none max-w-[80%] p-3 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="E.g. What are the histological features of an Ameloblastoma?"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-accent text-sm"
              disabled={chatLoading}
            />
            <button type="submit" disabled={chatLoading || !chatMessage.trim()} className="primary-btn px-6 disabled:opacity-50 disabled:cursor-not-allowed">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
