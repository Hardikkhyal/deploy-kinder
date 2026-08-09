import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Mail, Loader2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
        <p className="text-[11px] text-white/60 text-center mb-8 uppercase tracking-widest font-semibold">Welcome Back</p>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-300 p-3 rounded-xl mb-6 text-[11px] font-medium text-center backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
          
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-white/60 mb-2 font-semibold">Password</label>
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
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
          
          <div className="text-center mt-6">
            <Link to="/signup" className="text-xs text-white/60 hover:text-white transition-colors">
              Don't have an account? <span className="font-semibold underline decoration-white/40 underline-offset-2">Sign up</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
