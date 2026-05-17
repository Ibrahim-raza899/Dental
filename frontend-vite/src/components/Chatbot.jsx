import React, { useState } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! I am your Odontogenic Oral Pathology AI tutor. How can I help you today?' }]);
  const [input, setInput] = useState('');

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to UI
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Mock API call to our backend /api/ai/chat
    // Since we don't have node running, we'll simulate the delay
    setTimeout(() => {
      setMessages([...newMessages, { sender: 'bot', text: 'This is a simulated AI response. Please ensure your backend is running to connect to the Gemini API.' }]);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {isOpen && (
        <div className="glass-panel fade-in" style={{ width: '300px', height: '400px', display: 'flex', flexDirection: 'column', marginBottom: '10px', padding: '1rem' }}>
          <h3 style={{ margin: 0, paddingBottom: '10px', borderBottom: '1px solid var(--glass-border)' }}>AI Tutor</h3>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', background: msg.sender === 'user' ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '12px', maxWidth: '80%', fontSize: '0.9rem' }}>
                {msg.text}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '5px' }}>
            <input 
              type="text" 
              className="custom-input" 
              style={{ marginBottom: 0 }} 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..." 
            />
            <button className="primary-btn" style={{ width: 'auto' }} onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
      <button className="primary-btn" style={{ borderRadius: '50%', width: '60px', height: '60px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }} onClick={toggleChat}>
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
