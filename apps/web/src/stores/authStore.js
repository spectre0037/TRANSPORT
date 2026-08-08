import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  loading: false,
  initialized: false,

  initialize: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { set({ initialized: true }); return; }
    try {
      const { data } = await api.get('/api/users/me');
      set({ user: data, token, initialized: true });
    } catch {
      localStorage.clear();
      set({ user: null, token: null, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user, token: data.accessToken, loading: false });
      return { success: true, user: data.user };
    } catch (err) {
      set({ loading: false });
      const data = err.response?.data || {};
      // Return the full error details so the login page can show OTP, etc.
      return { success: false, error: data.error || 'Login failed', code: data.code };
    }
  },

  register: async (payload) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/api/auth/register', payload);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user, token: data.accessToken, loading: false });
      return { success: true, user: data.user };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout', { refreshToken: localStorage.getItem('refreshToken') });
    } catch {}
    localStorage.clear();
    set({ user: null, token: null });
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get('/api/users/me');
      set({ user: data });
    } catch {}
  },

  // Called after successful email verification
  markEmailVerified: () => {
    const user = get().user;
    if (user) set({ user: { ...user, isEmailVerified: true } });
  },
}));

export default useAuthStore;
