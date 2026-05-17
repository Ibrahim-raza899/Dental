import React, { useState } from 'react';

export default function FacultyDashboard() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleGenerateQuiz = () => {
    if (!selectedFile) return alert('Please upload a PDF first');
    alert(`Mocking quiz generation for ${selectedFile.name} via Gemini API...`);
  };

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Faculty Dashboard</h2>
      
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h3>Content Management</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload educational PDFs and generate quizzes using AI.</p>
        
        <input type="file" accept="application/pdf" onChange={handleFileUpload} className="custom-input" />
        
        <button onClick={handleGenerateQuiz} className="primary-btn" style={{ marginTop: '1rem' }}>
          Generate AI Quiz from PDF
        </button>
      </div>

      <div className="glass-panel">
        <h3>Student Progress Overview</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Mock table showing student completions will appear here.</p>
      </div>
    </div>
  );
}
