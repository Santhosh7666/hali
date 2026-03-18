import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore.js';

// Reliable token source — reads from live Zustand store, with localStorage fallback
const getToken = () => useAuthStore.getState().token || localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

export const useDashboardStore = create((set, get) => ({
  dashboards: [],
  currentDashboard: null,
  loading: false,
  error: null,

  fetchDashboards: async () => {
    try {
      set({ loading: true });
      const res = await axios.get('/api/dashboards', { headers: authHeader() });
      set({ dashboards: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch dashboards', loading: false });
    }
  },

  createDashboard: async (data) => {
    try {
      set({ loading: true });
      const res = await axios.post('/api/dashboards', data, { headers: authHeader() });
      set({ dashboards: [...get().dashboards, res.data.data], loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create dashboard', loading: false });
      throw err;
    }
  },

  updateDashboard: async (id, data) => {
    try {
      set({ loading: true });
      const res = await axios.put(`/api/dashboards/${id}`, data, { headers: authHeader() });
      set({
        dashboards: get().dashboards.map((d) => (d._id === id ? res.data.data : d)),
        currentDashboard: res.data.data,
        loading: false
      });
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update dashboard', loading: false });
      throw err;
    }
  },

  deleteDashboard: async (id) => {
    try {
      set({ loading: true });
      await axios.delete(`/api/dashboards/${id}`, { headers: authHeader() });
      set({
        dashboards: get().dashboards.filter((d) => d._id !== id),
        currentDashboard: null,
        loading: false
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete dashboard', loading: false });
      throw err;
    }
  },

  setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard })
}));
