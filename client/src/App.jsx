import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { useNotificationStore } from './store/notificationStore.js';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import LogoutPage from './pages/auth/LogoutPage.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Admin pages
import UserDashboard from './pages/dashboard/UserDashboard.jsx';
import DashboardBuilder from './pages/dashboard/DashboardBuilder.jsx';
import AdminPanel from './pages/admin/AdminPanel.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';
import AnalyticsPage from './pages/admin/AnalyticsPage.jsx';

// Shared pages
import StorePage from './pages/store/StorePage.jsx';
import OrdersPage from './pages/orders/OrdersPage.jsx';
import CreateOrderPage from './pages/orders/CreateOrderPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

/**
 * Protects a route by requiring authentication.
 * If adminOnly=true, also requires role === 'admin'.
 * Non-admin users accessing admin routes are redirected to /dashboard/store.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard/store" />;

  return <>{children}</>;
};

/**
 * Redirects admin users to dashboard overview, users to the store.
 */
const DefaultDashboardRedirect = () => {
  const { user } = useAuthStore();
  return user?.role === 'admin'
    ? <Navigate to="/dashboard/overview" replace />
    : <Navigate to="/dashboard/store" replace />;
};

function App() {
  const { loadUser, user, isAuthenticated } = useAuthStore();
  const { initSocket } = useNotificationStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      initSocket(user._id);
    }
  }, [isAuthenticated, user, initSocket]);

  useEffect(() => {
    const theme = user?.settings?.theme || 'Light Mode';
    const root = document.documentElement;

    if (theme === 'Dark Mode') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (theme === 'Light Mode') {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else if (theme === 'System') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
      root.style.colorScheme = isDark ? 'dark' : 'light';
    }
  }, [user?.settings?.theme]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/logout" element={<LogoutPage />} />

        {/* Protected app shell */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default redirect based on role */}
          <Route index element={<DefaultDashboardRedirect />} />

          {/* ── USER routes ──────────────────────────────── */}
          {/* Ecommerce store – accessible to everyone */}
          <Route path="store" element={<StorePage />} />

          {/* ── ADMIN-only routes ────────────────────────── */}
          <Route
            path="overview"
            element={
              <ProtectedRoute adminOnly>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="builder"
            element={
              <ProtectedRoute adminOnly>
                <DashboardBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="builder/:id"
            element={
              <ProtectedRoute adminOnly>
                <DashboardBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute adminOnly>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="products"
            element={
              <ProtectedRoute adminOnly>
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Orders – all authenticated users (admin sees all, user sees own) */}
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          {/* My Orders alias for user sidebar link */}
          <Route
            path="my-orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          {/* Create Order — admin only */}
          <Route
            path="orders/create"
            element={
              <ProtectedRoute adminOnly>
                <CreateOrderPage />
              </ProtectedRoute>
            }
          />

          {/* Shared */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
