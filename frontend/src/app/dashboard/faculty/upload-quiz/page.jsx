'use client';
import { useState } from 'react';
import { Upload, FileText, Save, CheckCircle, BrainCircuit, Loader2, Sparkles, Type, FileUp, X } from 'lucide-react';
import api from '@/lib/api';

const INPUT_MODES = [
  { key: 'file', label: 'Upload File', icon: FileUp, hint: 'PDF, DOCX, PPT, PPTX, TXT (up to 30MB)' },
  { key: 'text', label: 'Plain Text', icon: Type, hint: 'Paste lecture notes or any text content' },
];

const FILE_ICONS = { pdf: '📄', doc: '📝', docx: '📝', ppt: '📊', pptx: '📊', txt: '📃' };

export default function UploadQuizPage() {
  const [inputMode, setInputMode] = useState('file');
  const [file, setFile] = useState(null);
  const [plainText, setPlainText] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const canGenerate = (inputMode === 'file' && file) || (inputMode === 'text' && plainText.trim().length >= 50);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!canGenerate) return;

    setLoading(true);
    setSaved(false);
    setQuizData(null);
    setError('');

    const formData = new FormData();
    formData.append('numQuestions', numQuestions);
    if (inputMode === 'file' && file) {
      formData.append('file', file);
    } else {
      formData.append('text', plainText);
    }

    try {
      const response = await api.post('/ai/generate-quiz', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setQuizData(response.data.quiz);
      setSourceText(response.data.sourceText || '');
      setQuizTitle(
        inputMode === 'file'
          ? file.name.replace(/\.[^.]+$/, '') + ' Quiz'
          : 'Generated Quiz'
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle || !quizData?.length) return alert('Provide a title and generate a quiz first.');
    setSaving(true);
    try {
      const questions = quizData.map(q => ({
        text: q.text || q.questionText,
        type: 'mcq',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium'
      }));
      await api.post('/quizzes/save', {
        title: quizTitle,
        description: quizDescription || `Generated from ${inputMode === 'file' ? file?.name : 'plain text'}`,
        questions,
        settings: { timeLimitMinutes: Math.max(questions.length * 2, 10), shuffleQuestions: true }
      });
      setSaved(true);
    } catch (err) {
      alert('Failed to save quiz: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const switchMode = (mode) => {
    setInputMode(mode);
    setFile(null);
    setPlainText('');
    setError('');
  };

  const fileExt = file?.name?.split('.').pop()?.toLowerCase();

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <Upload className="text-purple-400" /> AI Quiz Generation
      </h1>
      <p className="text-slate-400 mb-8">Generate MCQ quizzes from lecture files or plain text using Gemini AI.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileText className="text-blue-400" /> Content Source
          </h2>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-slate-800/80 rounded-xl mb-6">
            {INPUT_MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  inputMode === key ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleGenerate}>
            {/* File Upload */}
            {inputMode === 'file' && (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer mb-5 ${
                  dragOver ? 'border-purple-500 bg-purple-500/10' :
                  file ? 'border-green-500/60 bg-green-500/5' :
                  'border-slate-700 hover:border-purple-500 hover:bg-purple-500/5'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('quiz-file-input').click()}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  className="hidden"
                  id="quiz-file-input"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">{FILE_ICONS[fileExt] || '📎'}</span>
                    <span className="text-green-300 font-semibold text-sm">{file.name}</span>
                    <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • {fileExt?.toUpperCase()}</span>
                    <button
                      type="button"
                      onClick={(ev) => { ev.stopPropagation(); setFile(null); }}
                      className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1 rounded-full"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileUp className="w-12 h-12 text-slate-400 mb-1" />
                    <span className="text-slate-200 font-semibold">Drop file here or click to upload</span>
                    <div className="flex flex-wrap gap-2 justify-center mt-1">
                      {['PDF', 'DOCX', 'PPT', 'PPTX', 'TXT'].map(ext => (
                        <span key={ext} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">.{ext.toLowerCase()}</span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 mt-1">Up to 30MB</span>
                  </div>
                )}
              </div>
            )}

            {/* Plain Text */}
            {inputMode === 'text' && (
              <div className="mb-5">
                <textarea
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder="Paste your lecture notes, study material, clinical guidelines, or any relevant text here...

Gemini AI will analyze this content and generate targeted MCQ questions from it. (Minimum 50 characters)"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-purple-500 resize-none h-52 placeholder-slate-600 leading-relaxed"
                />
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${plainText.length < 50 ? 'text-red-400' : 'text-green-400'}`}>
                    {plainText.length} characters {plainText.length < 50 ? `(need ${50 - plainText.length} more)` : '✓ ready'}
                  </span>
                </div>
              </div>
            )}

            {/* Number of Questions */}
            <div className="mb-5">
              <label className="text-sm text-slate-300 block mb-2">Number of Questions</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumQuestions(n)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${
                      numQuestions === n
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-purple-500'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-sm mb-4">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canGenerate || loading}
              className="primary-btn w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with Gemini AI...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate {numQuestions} Questions</>
              )}
            </button>
          </form>

          {sourceText && (
            <div className="mt-5 bg-slate-900/50 rounded-xl p-4 border border-white/5">
              <h3 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-wider">Extracted Text Preview</h3>
              <p className="text-xs text-slate-500 line-clamp-4">{sourceText}</p>
            </div>
          )}
        </div>

        {/* Generated Quiz Preview & Save */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BrainCircuit className="text-green-400" /> Generated Quiz
          </h2>

          {!quizData ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Sparkles className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No quiz generated yet</p>
              <p className="text-sm mt-1 text-center">Upload a file or paste text, then click Generate</p>
            </div>
          ) : (
            <>
              {/* Save Form */}
              <div className="bg-slate-900/50 rounded-xl p-4 mb-5 border border-purple-500/20">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">💾 Save to Quiz Bank</p>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="Quiz title..."
                  />
                  <input
                    type="text"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="Description (optional)..."
                  />
                  <button
                    onClick={handleSaveQuiz}
                    disabled={saving || saved}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      saved ? 'bg-green-600/20 border border-green-500 text-green-400' : 'bg-purple-600 hover:bg-purple-700 text-white'
                    } disabled:cursor-not-allowed`}
                  >
                    {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> :
                     saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> :
                     <><Save className="w-4 h-4" /> Save Quiz to Database</>}
                  </button>
                </div>
              </div>

              {/* Questions */}
              <div className="max-h-[480px] overflow-y-auto pr-1 space-y-4">
                {quizData.map((q, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="font-semibold text-slate-200 text-sm">
                        <span className="text-purple-400 mr-1">Q{idx + 1}.</span>
                        {q.text || q.questionText}
                      </p>
                      {q.difficulty && (
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                          q.difficulty === 'easy' ? 'bg-green-900/50 text-green-300' :
                          q.difficulty === 'hard' ? 'bg-red-900/50 text-red-300' :
                          'bg-yellow-900/50 text-yellow-300'
                        }`}>{q.difficulty}</span>
                      )}
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {q.options?.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`text-xs px-3 py-2 rounded-lg ${opt === q.correctAnswer ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-slate-900/50 text-slate-400'}`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-blue-400 bg-blue-500/10 p-2 rounded-lg">💡 {q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
