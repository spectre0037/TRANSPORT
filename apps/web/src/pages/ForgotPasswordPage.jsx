import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Mail } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset code sent!');
    } catch {
      toast.error('Failed to send reset code');
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-clay-bg flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="clay-card text-center max-w-sm">
          <div className="w-16 h-16 bg-clay-info/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-clay-info" size={32} />
          </div>
          <h2 className="text-xl font-bold text-clay-text mb-2">Check Your Email</h2>
          <p className="text-clay-muted text-sm mb-6">We sent a reset code to <strong>{email}</strong></p>
          <Link to="/reset-password" state={{ email }} className="clay-btn-primary block">Enter Reset Code</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay-bg flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="w-14 h-14 bg-clay-primary rounded-clay flex items-center justify-center mx-auto mb-4 shadow-clay">
          <KeyRound className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-clay-text mb-2">Forgot Password?</h1>
        <p className="text-clay-muted text-sm mb-8">Enter your email to receive a reset code</p>
        <form onSubmit={handleSubmit} className="clay-card space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="clay-input pl-10" placeholder="you@example.com" required />
          </div>
          <button type="submit" disabled={loading} className="clay-btn-primary w-full disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
          <Link to="/login" className="block text-sm text-clay-muted hover:underline">Back to Login</Link>
        </form>
      </motion.div>
    </div>
  );
}
