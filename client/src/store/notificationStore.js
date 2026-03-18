import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = '/api/notifications';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  socket: null,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const notifications = res.data.data;
      set({ 
        notifications, 
        unreadCount: notifications.filter((n) => !n.isRead).length,
        loading: false 
      });
    } catch (err) {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedNotifications = get().notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      );
      set({ 
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length
      });
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await axios.put(`${API_URL}/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      set({ 
        notifications: get().notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      });
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  },

  initSocket: (userId) => {
    if (get().socket) return;

    const socket = io('/', {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join', userId);
    });

    socket.on('notification', (notification) => {
      get().addNotification(notification);
    });

    set({ socket });
  },

  addNotification: (notification) => {
    set({ 
      notifications: [notification, ...get().notifications].slice(0, 20),
      unreadCount: get().unreadCount + 1
    });
  }
}));
