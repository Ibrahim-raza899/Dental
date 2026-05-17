import React from 'react';
import ThreeDViewer from '../components/ThreeDViewer';

export default function StudentDashboard() {
  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Student Learning Portal</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-panel">
          <h3>Your Progress</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Chapter 1: Ameloblastoma - <span style={{ color: 'var(--accent-color)' }}>80% Complete</span></p>
          <progress value="80" max="100" style={{ width: '100%', marginTop: '1rem' }} />
        </div>
        
        <div className="glass-panel">
          <h3>Pending Tests</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>Pre-test: Odontogenic Cysts</li>
            <li style={{ padding: '0.5rem 0' }}>Post-test: Fibro-osseous Lesions</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '1rem' }}>AR/3D Topic Preparation</h3>
        <ThreeDViewer />
      </div>
    </div>
  );
}
