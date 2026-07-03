import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Mail, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1 = input email, 2 = input code
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/verify-otp', { email, code });
      login(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-bg-soft px-4">
      <div className="SoftCard w-full max-w-md shadow-2xl transition-all">
        <h2 className="text-2xl font-bold text-center text-text-soft mb-1 flex items-center justify-center gap-1.5 font-sans tracking-tight">
          <span>DevOpsHub</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 self-end mb-1.5"></span>
        </h2>
        <p className="text-[11px] text-text-muted text-center mb-8 uppercase tracking-widest font-semibold">Control Plane Access</p>

        {error && (
          <div className="bg-bg-soft soft-shadow-inset border-l-4 border-red-500 text-red-650 dark:text-red-400 p-4 rounded-[14px] mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-bg-soft soft-shadow-inset border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-400 p-4 rounded-[14px] mb-6 text-sm font-medium">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2.5 font-semibold">Email Address</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 top-3 flex items-center justify-center text-text-muted">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="SoftInput w-full pl-11"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="SoftButton SoftButtonAccent w-full py-4 text-sm font-semibold active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white mr-2" />
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="block text-[11px] uppercase tracking-wider text-text-muted font-semibold">Enter 6-Digit Code</label>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setMessage('');
                  }}
                  className="text-xs text-text-muted hover:text-text-soft flex items-center gap-1 cursor-pointer font-semibold transition-colors"
                >
                  <ArrowLeft size={12} /> Change email
                </button>
              </div>
              
              <div className="relative flex items-center">
                <div className="absolute left-3.5 top-3 flex items-center justify-center text-text-muted">
                  <ShieldCheck size={16} />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="SoftInput w-full pl-11 font-mono text-center tracking-[0.4em] text-lg placeholder-neutral-300 font-bold"
                  placeholder="000000"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="SoftButton SoftButtonAccent w-full py-4 text-sm font-semibold active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white mr-2" />
                  <span>Verifying code...</span>
                </>
              ) : (
                <span>Verify & Login</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
