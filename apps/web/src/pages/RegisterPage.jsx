import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', preferredCity: '' });
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      navigate('/verify-email');
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
          <h1 className="text-2xl font-bold text-clay-text">Create Account</h1>
          <p className="text-clay-muted text-sm mt-1">Join TaleemXpress today</p>
        </div>

        <form onSubmit={handleSubmit} className="clay-card space-y-4">
          <div>
            <label className="text-sm font-medium text-clay-text mb-1 block">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type="text" value={form.fullName} onChange={(e) => update('fullName', e.target.value)}
                className="clay-input pl-10" placeholder="John Doe" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-clay-text mb-1 block">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                className="clay-input pl-10" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-clay-text mb-1 block">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                className="clay-input pl-10" placeholder="+923001234567" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-clay-text mb-1 block">Preferred City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <select value={form.preferredCity} onChange={(e) => update('preferredCity', e.target.value)}
                className="clay-input pl-10">
                <option value="">Select city</option>
                <option value="Islamabad/Rawalpindi">Islamabad/Rawalpindi</option>
                <option value="Lahore">Lahore</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Swabi">Swabi</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-clay-text mb-1 block">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" size={18} />
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)}
                className="clay-input pl-10 pr-10" placeholder="••••••••" required minLength={6} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-clay-muted hover:text-clay-text">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="clay-btn-primary w-full disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-clay-muted">
            Already have an account? <Link to="/login" className="text-clay-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </form>
        </motion.div>
      </div>
    </div>
  );
}
