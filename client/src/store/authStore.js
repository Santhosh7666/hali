import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: !!localStorage.getItem('token'),
  settingsLoading: false,
  error: null,

  updateProfile: async (userData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.put('/api/auth/updateprofile', userData, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      set({ user: res.data.user, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Profile update failed',
        loading: false
      });
      throw err;
    }
  },

  updatePassword: async (passwordData) => {
    try {
      set({ loading: true, error: null });
      await axios.put('/api/auth/updatepassword', passwordData, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      set({ loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Password update failed',
        loading: false
      });
      throw err;
    }
  },

  updateSettings: async (settingsData) => {
    try {
      set({ settingsLoading: true, error: null });
      const res = await axios.put('/api/auth/updatesettings', settingsData, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      set({ user: res.data.user, settingsLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Settings update failed',
        settingsLoading: false
      });
      throw err;
    }
  },

  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post('/api/auth/login', credentials);
      localStorage.setItem('token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Login failed',
        loading: false
      });
    }
  },

  register: async (userData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Registration failed',
        loading: false
      });
    }
  },

  logout: async () => {
    try { await axios.get('/api/auth/logout'); } catch (_) {}
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ loading: false, isAuthenticated: false });
        return;
      }
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({
        user: res.data.user,
        token, // ← critical: restore token into Zustand state so all stores find it
        isAuthenticated: true,
        loading: false
      });
    } catch (err) {
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      });
    }
  }
}));
