'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { ShieldCheck, ArrowRight, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Please enter a valid 6-digit code');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-panel p-10 max-w-md w-full text-center border-t-4 border-t-green-500 relative z-10">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
        <p className="text-slate-400 mb-6">Your password has been successfully updated. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-10 max-w-md w-full relative z-10 border border-white/10 shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
        <p className="text-slate-400 text-sm">
          Please enter the 6-digit code sent to<br/>
          <strong className="text-white">{email}</strong>
        </p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg mb-5 text-sm">{error}</div>}

      <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
        {/* OTP Input */}
        <div>
          <label className="text-sm text-slate-300 mb-1 block font-medium">Reset Code</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center text-xl tracking-[0.5em] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            required
            maxLength={6}
          />
        </div>

        {/* New Password Input */}
        <div>
          <label className="text-sm text-slate-300 mb-1 block font-medium">New Password</label>
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
              placeholder="Repeat your new password"
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
          disabled={loading || otp.length !== 6 || password !== confirmPassword || password.length < 6}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 shadow-lg shadow-blue-600/20 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              Resetting...
            </span>
          ) : (
            <>Reset Password <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Cancel and go back
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Suspense fallback={<div className="glass-panel p-10 text-center text-slate-400">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
