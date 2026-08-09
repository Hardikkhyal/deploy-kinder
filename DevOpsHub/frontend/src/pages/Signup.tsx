import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Mail, Loader2, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/auth/send-otp', { email });
      setMessage(response.data.message || 'Verification code sent!');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !code) return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', { email, password, code });
      login(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#08080a] px-4 selection:bg-blue-500/30 font-sans relative overflow-hidden">
      {/* Spider-Man background image */}
      <img 
        src="/marvels-spider-man-3840x2160-11990.jpeg" 
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-0 brightness-100 contrast-105"
      />

      {/* Crystal clear light overlay & ambient red/blue glowing liquid glass orbs */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0" />

      <Link to="/" className="absolute top-8 left-8 text-white/70 hover:text-white transition-colors text-sm font-semibold flex items-center gap-2 z-20 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 shadow-lg">
        &larr; Back to Home
      </Link>

      <div className="w-full max-w-sm glass-panel border border-white/20 shadow-2xl rounded-2xl p-8 animate-fade-up relative z-10">
        <h2 className="text-2xl font-bold text-center text-white mb-1 flex items-center justify-center gap-2.5 tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
            <svg viewBox="0 0 256 256" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
            </svg>
          </div>
          Selfhost
        </h2>
        <p className="text-[11px] text-white/60 text-center mb-8 uppercase tracking-widest font-semibold">Create Account</p>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-300 p-3 rounded-xl mb-6 text-[11px] font-medium text-center backdrop-blur-md">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-[#28c840]/15 border border-[#28c840]/30 text-[#28c840] p-3 rounded-xl mb-6 text-[11px] font-medium text-center backdrop-blur-md">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-2 font-semibold">Email Address</label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50 z-10">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input py-2.5 pl-10 pr-3 text-white placeholder-white/30 text-sm outline-none transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 shadow-lg shadow-blue-600/30 border border-white/20 active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>
            
            <div className="text-center mt-6">
              <Link to="/login" className="text-xs text-white/60 hover:text-white transition-colors">
                Already have an account? <span className="font-semibold underline decoration-white/40 underline-offset-2">Login</span>
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] uppercase tracking-wider text-white/60 font-semibold">Enter 6-Digit Code</label>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setMessage('');
                  }}
                  className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 cursor-pointer font-semibold transition-colors"
                >
                  <ArrowLeft size={10} /> Change email
                </button>
              </div>
              
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50 z-10">
                  <ShieldCheck size={16} />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full glass-input py-2.5 pl-10 pr-3 text-white placeholder-white/30 text-lg font-mono tracking-[0.4em] font-bold text-center outline-none transition-all"
                  placeholder="000000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-2 font-semibold">Set Password</label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50 z-10">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input py-2.5 pl-10 pr-3 text-white placeholder-white/30 text-sm outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 shadow-lg shadow-blue-600/30 border border-white/20 active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Verifying & Creating...</span>
                </>
              ) : (
                <span>Verify & Sign Up</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
