import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore.js';
import {
  Users,
  ShoppingBag,
  Package,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = useAuthStore.getState().token || localStorage.getItem('token');
        const res = await axios.get('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-rose-500 font-bold">{error}</p>
      </div>
    );
  }

  const kpisConfig = [
    { label: 'Total Users', value: data.kpis.totalUsers, icon: <Users className="w-5 h-5" />, color: 'indigo', suffix: '' },
    { label: 'Total Orders', value: data.kpis.totalOrders, icon: <ShoppingBag className="w-5 h-5" />, color: 'blue', suffix: '' },
    { label: 'Total Products', value: data.kpis.totalProducts, icon: <Package className="w-5 h-5" />, color: 'violet', suffix: '' },
    { label: 'Total Revenue', value: `$${data.kpis.totalRevenue.toFixed(2)}`, icon: <DollarSign className="w-5 h-5" />, color: 'emerald', suffix: '' },
  ];

  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-left"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Analytics</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium ml-1">
          Platform-wide performance metrics — admin eyes only.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpisConfig.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="group bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 relative overflow-hidden"
          >
            <div className={`absolute -top-10 -right-10 w-24 h-24 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700 ${colorMap[kpi.color]}`} />
            <div className="flex items-center justify-between mb-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[kpi.color]}`}>
                {kpi.icon}
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-widest">
                <ArrowUpRight className="w-3 h-3" />
                Live
              </div>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{kpi.label}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight tabular-nums">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none text-left"
        >
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Monthly Revenue</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Last 6 months · Sales data</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlySales} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 700 }}
                  formatter={(val) => [`$${val.toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none text-left"
        >
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Order Status Breakdown</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Current order distribution</p>
          </div>
          {data.orderStatusData.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-slate-300 italic text-sm">
              No orders yet
            </div>
          ) : (
            <div className="flex items-center gap-6 h-[260px]">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={data.orderStatusData}
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {data.orderStatusData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <div>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200">{entry.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{entry.value} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* User Growth Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none text-left"
      >
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">User Growth</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">New user registrations · last 6 months</p>
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.monthlyUsers}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} fill="#10B981" fillOpacity={0.08} dot={{ fill: '#10B981', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Monthly Orders (additional chart) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none text-left"
      >
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Monthly Orders</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Orders volume trend · last 6 months</p>
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 700 }}
              />
              <Line type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
