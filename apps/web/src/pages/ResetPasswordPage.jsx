import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Lock } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = location.state?.userId || location.state?.email;
      await api.post('/api/auth/reset-password', { userId, otp, newPassword });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-clay-bg flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="w-14 h-14 bg-clay-primary rounded-clay flex items-center justify-center mx-auto mb-4 shadow-clay">
          <KeyRound className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-clay-text mb-2">Reset Password</h1>
        <p className="text-clay-muted text-sm mb-8">Enter the code and your new password</p>
        <form onSubmit={handleSubmit} className="clay-card space-y-4">
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
            className="clay-input text-center tracking-[8px] font-mono" placeholder="Enter OTP" maxLength={6} required />
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="clay-input pl-10" placeholder="New password" required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="clay-btn-primary w-full disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <Link to="/login" className="block text-sm text-clay-muted hover:underline">Back to Login</Link>
        </form>
      </motion.div>
    </div>
  );
}
