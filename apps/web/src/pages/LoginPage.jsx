import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(result.user.role === 'admin' ? '/admin' : '/dashboard');
    } else if (result.code === 'EMAIL_NOT_VERIFIED') {
      toast.error('Please verify your email before logging in. Check your inbox for the code.');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-clay-bg px-4 pb-12 pt-24">
      <Navbar />
      <div className="mx-auto flex w-full max-w-md justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-clay-primary rounded-clay flex items-center justify-center mx-auto mb-4 shadow-clay">
            <GraduationCap className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-clay-text">Welcome Back</h1>
          <p className="text-clay-muted text-sm mt-1">Sign in to your Transport account</p>
        </div>

        <form onSubmit={handleSubmit} className="clay-card space-y-4">
          <div>
            <label className="text-sm font-medium text-clay-text mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="clay-input pl-10" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-clay-text mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                className="clay-input pl-10 pr-10" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-clay-muted hover:text-clay-text">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-clay-primary hover:underline">Forgot Password?</Link>
          </div>
          <button type="submit" disabled={loading} className="clay-btn-primary w-full disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-clay-muted">
            Don't have an account? <Link to="/register" className="text-clay-primary font-semibold hover:underline">Sign Up</Link>
          </p>
        </form>
        </motion.div>
      </div>
    </div>
  );
}