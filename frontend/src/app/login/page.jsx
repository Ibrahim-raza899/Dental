'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { GraduationCap, BookOpen, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState('student');
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      dispatch(loginSuccess({ user: response.data, token: response.data.token }));
      
      if (response.data.role === 'faculty') {
        router.push('/dashboard/faculty');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.message === 'Please verify your email before signing in') {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreate = async (role) => {
    const testEmail = role === 'faculty' ? 'faculty@test.com' : 'student@test.com';
    const testName = role === 'faculty' ? 'Dr. Faculty' : 'Test Student';
    const testPass = 'password123';

    try {
      setLoading(true);
      setError('');
      try {
        await api.post('/auth/register', { 
          name: testName, 
          email: testEmail, 
          password: testPass, 
          role,
          demoSecret: 'odontogenic_demo_123'
        });
      } catch (e) { /* User might already exist */ }

      const response = await api.post('/auth/login', { email: testEmail, password: testPass });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      dispatch(loginSuccess({ user: response.data, token: response.data.token }));
      
      if (response.data.role === 'faculty') {
        router.push('/dashboard/faculty');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Quick login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-panel p-10 max-w-md w-full relative z-10 border border-white/10 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">Odontogenic LMS</span>
          </div>
          <h1 className="text-3xl font-bold mb-1">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Sign in to continue your learning journey</p>
        </div>
        
        {/* Role Toggle */}
        <div className="flex gap-1 mb-6 p-1 bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveRole('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeRole === 'student' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Student
          </button>
          <button
            onClick={() => setActiveRole('faculty')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeRole === 'faculty' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Faculty
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg mb-5 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block font-medium">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={activeRole === 'faculty' ? 'faculty@university.edu' : 'student@university.edu'}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              required 
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block font-medium">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all pr-11"
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all mt-1 ${
              activeRole === 'faculty' 
                ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                Signing in...
              </span>
            ) : (
              <>Sign In as {activeRole === 'faculty' ? 'Faculty' : 'Student'} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-5 text-center">
          <p className="text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className={`font-semibold hover:underline ${activeRole === 'faculty' ? 'text-purple-400' : 'text-blue-400'}`}>
              Sign Up
            </Link>
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 border-t border-slate-700/50"></div>
          <span className="text-xs text-slate-500 uppercase tracking-wider">Quick Access</span>
          <div className="flex-1 border-t border-slate-700/50"></div>
        </div>

        {/* Demo Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => handleQuickCreate('student')}
            disabled={loading}
            className="flex-1 py-2.5 px-3 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-semibold hover:bg-blue-600/20 hover:border-blue-500/40 transition-all disabled:opacity-50"
          >
            Demo Student
          </button>
          <button 
            onClick={() => handleQuickCreate('faculty')}
            disabled={loading}
            className="flex-1 py-2.5 px-3 bg-purple-600/10 border border-purple-500/20 rounded-lg text-purple-400 text-sm font-semibold hover:bg-purple-600/20 hover:border-purple-500/40 transition-all disabled:opacity-50"
          >
            Demo Faculty
          </button>
        </div>
      </div>
    </div>
  );
}
