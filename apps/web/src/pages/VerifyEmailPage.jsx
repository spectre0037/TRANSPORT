import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const { user, markEmailVerified } = useAuthStore();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/verify-email', { otp });
      setVerified(true);
      markEmailVerified();
      toast.success('Email verified! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/send-verification');
      toast.success('A new verification code has been sent to your email.');
    } catch (err) {
      toast.error('Failed to send code');
    }
    setLoading(false);
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-clay-bg flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="clay-card text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-green-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-clay-text mb-2">Email Verified! ✅</h2>
          <p className="text-clay-muted text-sm mb-6">Your account is now active.</p>
          <Link to="/dashboard" className="clay-btn-primary block">Go to Dashboard</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay-bg flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="w-14 h-14 bg-clay-primary rounded-clay flex items-center justify-center mx-auto mb-4 shadow-clay">
          <Mail className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-clay-text mb-2">Verify Your Email</h1>
        <p className="text-clay-muted text-sm mb-2">
          We sent a 6-digit verification code to <strong>{user?.email || 'your email'}</strong>
        </p>
        <p className="text-xs text-clay-muted mb-6">
          Please check your inbox (and spam folder). The code expires in 10 minutes.
        </p>

        <form onSubmit={handleVerify} className="clay-card space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="clay-input text-center text-2xl tracking-[8px] font-mono"
            placeholder="000000"
            maxLength={6}
            required
          />
          <button type="submit" disabled={loading || otp.length !== 6} className="clay-btn-primary w-full disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
          <button type="button" onClick={handleResend} disabled={loading} className="text-sm text-clay-primary hover:underline w-full disabled:opacity-50">
            Didn't receive? Resend Code
          </button>
        </form>
      </motion.div>
    </div>
  );
}