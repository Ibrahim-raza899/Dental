'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { GraduationCap, BookOpen, Eye, EyeOff, ArrowRight, Sparkles, UserPlus, Check } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Additional profile fields
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  // Password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) return setError('Full name is required');
    if (!email.trim()) return setError('Email is required');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);

    try {
      // Register the user
      const registerRes = await api.post('/auth/register', { 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        password, 
        role: 'student' 
      });

      if (registerRes.data.token) {
        // Auto-login for demo accounts (or if auto-verified)
        localStorage.setItem('token', registerRes.data.token);
        localStorage.setItem('user', JSON.stringify(registerRes.data));
        dispatch(loginSuccess({ user: registerRes.data, token: registerRes.data.token }));

        router.push('/dashboard');
      } else {
        // Standard user needs to verify email
        router.push(`/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-panel p-10 max-w-lg w-full relative z-10 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">Odontogenic LMS</span>
          </div>
          <h1 className="text-3xl font-bold mb-1">Create Account</h1>
          <p className="text-slate-400 text-sm">Join the pathology learning platform</p>
        </div>
        
        {/* Role Description */}
        <div className="p-3 rounded-lg mb-5 text-xs border bg-blue-500/5 border-blue-500/20 text-blue-300">
          📚 Student accounts can read chapters, take tests & quizzes, track progress, and access preparation tools.
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg mb-5 text-sm">{error}</div>}
        
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <label className="text-sm text-slate-300 mb-1 block font-medium">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              required 
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-slate-300 mb-1 block font-medium">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@university.edu"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              required 
            />
          </div>

          {/* Conditional Profile Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-300 mb-1 block font-medium">University</label>
              <input 
                type="text" 
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="University name"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block font-medium">
                Student ID
              </label>
              <input 
                type="text" 
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. STD-2024-001"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-slate-300 mb-1 block font-medium">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all pr-11"
                required minLength={6}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password Strength Meter */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex gap-1 flex-1">
                    <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-300 rounded-full`} style={{ width: strength.width }} />
                    </div>
                  </div>
                  <span className={`text-xs ml-3 font-semibold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-slate-300 mb-1 block font-medium">Confirm Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className={`w-full bg-slate-800/50 border rounded-lg p-3 text-white focus:outline-none transition-all pr-11 ${
                  confirmPassword && confirmPassword === password 
                    ? 'border-green-500/50 focus:border-green-500' 
                    : confirmPassword 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-slate-700 focus:border-blue-500'
                }`}
                required 
              />
              {confirmPassword && confirmPassword === password && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
              )}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all mt-1 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                Creating account...
              </span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Register as Student
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-5 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline text-blue-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
