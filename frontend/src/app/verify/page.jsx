'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const [otp, setOtp] = useState('');
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

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return setError('Please enter a valid 6-digit code');
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-otp', { email, otp });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/resend-verification', { email });
      setError('');
      alert('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
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
        <h2 className="text-2xl font-bold mb-2">Account Verified!</h2>
        <p className="text-slate-400 mb-6">Your email has been verified successfully. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-10 max-w-md w-full relative z-10 border border-white/10 shadow-2xl text-center">
      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-8 h-8 text-blue-400" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
      <p className="text-slate-400 text-sm mb-8">
        We've sent a 6-digit code to <br />
        <strong className="text-white">{email}</strong>
      </p>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg mb-5 text-sm text-left">{error}</div>}

      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center text-2xl font-bold tracking-[0.5em] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            required
            maxLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 shadow-lg shadow-blue-600/20 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all mt-4"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              Verifying...
            </span>
          ) : (
            <>Verify Account <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        <button 
          onClick={handleResend}
          disabled={loading}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors bg-transparent border-none cursor-pointer"
        >
          Didn't receive the code? Resend
        </button>
        <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Suspense fallback={<div className="glass-panel p-10 text-center text-slate-400">Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
