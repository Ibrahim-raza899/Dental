import { Routes, Route } from 'react-router-dom'
import Chatbot from './components/Chatbot'
import ThreeDViewer from './components/ThreeDViewer'

function App() {
  return (
    <div className="app-container">
      <header className="glass-header">
        <h1>Odontogenic Oral Pathology</h1>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      <Chatbot />
    </div>
  )
}

function Home() {
  return (
    <div className="hero-section fade-in" style={{ width: '100%' }}>
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2>Welcome to the Interactive Dental Hub</h2>
        <p>Explore 3D models, take interactive quizzes, and track your progress.</p>
      </div>
      <ThreeDViewer />
    </div>
  )
}

function Login() {
  return (
    <div className="login-container fade-in">
      <div className="glass-panel">
        <h2>Login</h2>
        <form>
          <input type="email" placeholder="Email" className="custom-input" />
          <input type="password" placeholder="Password" className="custom-input" />
          <button type="button" className="primary-btn">Sign In</button>
        </form>
      </div>
    </div>
  )
}

export default App
