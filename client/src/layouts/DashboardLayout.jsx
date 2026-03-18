import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  PlusCircle,
  Settings,
  User,
  LogOut,
  Menu,
  BarChart3,
  ShieldAlert,
  Package,
  ChevronRight,
  TrendingUp,
  Layout as LayoutIcon
} from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown.jsx';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DashboardLayout = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/logout');
  };

  // ── Admin navigation ────────────────────────────────────────────────
  const adminNavItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', path: '/dashboard/overview' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: <LayoutIcon className="w-5 h-5" />, label: 'Dashboard Builder', path: '/dashboard/builder' },
    { icon: <Package className="w-5 h-5" />, label: 'Products', path: '/dashboard/products' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders', path: '/dashboard/orders' },
    { icon: <PlusCircle className="w-5 h-5" />, label: 'Create Order', path: '/dashboard/orders/create' },
  ];

  const adminOnlyItems = [
    { icon: <ShieldAlert className="w-5 h-5" />, label: 'Admin Panel', path: '/dashboard/admin' },
  ];

  // ── User navigation ─────────────────────────────────────────────────
  const userNavItems = [
    { icon: <Store className="w-5 h-5" />, label: 'Store', path: '/dashboard/store' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'My Orders', path: '/dashboard/my-orders' },
  ];

  // ── Shared nav (profile, settings) ─────────────────────────────────
  const sharedNav = [
    { icon: <User className="w-5 h-5" />, label: t('layout.profile'), path: '/dashboard/profile' },
    { icon: <Settings className="w-5 h-5" />, label: t('layout.settings'), path: '/dashboard/settings' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
        isActive(item.path)
          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
    >
      <span className={`${isActive(item.path) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
        {item.icon}
      </span>
      {isSidebarOpen && <span className="text-sm">{item.label}</span>}
      {isSidebarOpen && isActive(item.path) && (
        <motion.div layoutId="active" className="ml-auto">
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <div>
                <span className="font-bold text-lg tracking-tight dark:text-white">ShopAdmin</span>
                {isAdmin ? (
                  <span className="block text-[9px] font-black text-indigo-500 uppercase tracking-widest">Administrator</span>
                ) : (
                  <span className="block text-[9px] font-black text-emerald-500 uppercase tracking-widest">Store</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <div className="p-4 space-y-1 text-left">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}

          {/* Admin-only section */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-3">
                {isSidebarOpen ? (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Administration</span>
                ) : (
                  <div className="h-px bg-slate-100 dark:bg-slate-800" />
                )}
              </div>
              {adminOnlyItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </>
          )}

          {/* Shared: profile + settings */}
          <div className="pt-4 pb-2 px-3">
            {isSidebarOpen ? (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account</span>
            ) : (
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
            )}
          </div>
          {sharedNav.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </div>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm">{t('layout.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Nav */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className={`text-[10px] font-black uppercase tracking-wider ${isAdmin ? 'text-indigo-500' : 'text-emerald-500'}`}>
                  {user?.role}
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
