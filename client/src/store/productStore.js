import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore.js';

const getAuthHeader = () => {
  const token = useAuthStore.getState().token || localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get('/api/products', { headers: getAuthHeader() });
      set({ products: res.data.data || [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch products', loading: false });
    }
  },

  createProduct: async (productData) => {
    try {
      const res = await axios.post('/api/products', productData, { headers: getAuthHeader() });
      set({ products: [res.data.data, ...get().products] });
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create product');
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const res = await axios.put(`/api/products/${id}`, productData, { headers: getAuthHeader() });
      set({ products: get().products.map(p => p._id === id ? res.data.data : p) });
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update product');
    }
  },

  deleteProduct: async (id) => {
    try {
      await axios.delete(`/api/products/${id}`, { headers: getAuthHeader() });
      set({ products: get().products.filter(p => p._id !== id) });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete product');
    }
  },

  purchaseProduct: async (id) => {
    try {
      const res = await axios.post(`/api/products/${id}/purchase`, {}, { headers: getAuthHeader() });
      set({
        products: get().products.map(p =>
          p._id === id ? { ...p, stock: Math.max(0, (p.stock || 0) - 1) } : p
        ),
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Purchase failed');
    }
  },
}));
