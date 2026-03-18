import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore.js';

const getAuthHeader = () => {
  const token = useAuthStore.getState().token || localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    try {
      set({ loading: true });
      const res = await axios.get('/api/orders', { headers: getAuthHeader() });
      set({ orders: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch orders', loading: false });
    }
  },

  createOrder: async (orderData) => {
    try {
      set({ loading: true });
      const res = await axios.post('/api/orders', orderData, { headers: getAuthHeader() });
      set({ orders: [...get().orders, res.data.data], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create order', loading: false });
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      set({ loading: true });
      const res = await axios.put(`/api/orders/${id}`, orderData, { headers: getAuthHeader() });
      set({
        orders: get().orders.map((o) => (o._id === id ? res.data.data : o)),
        loading: false
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update order', loading: false });
    }
  },

  deleteOrder: async (id) => {
    try {
      set({ loading: true });
      await axios.delete(`/api/orders/${id}`, { headers: getAuthHeader() });
      set({
        orders: get().orders.filter((o) => o._id !== id),
        loading: false
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete order', loading: false });
    }
  }
}));
