import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDashboardStore } from '../../store/dashboardStore.js';
import { useParams, useNavigate } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  Plus,
  Trash2,
  Settings2,
  Layout as LayoutIcon,
  BarChart,
  PieChart as PieIcon,
  Activity,
  Pencil,
  Save,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore.js';

const getAuthHeader = () => {
  const token = useAuthStore.getState().token || localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const ResponsiveGridLayout = WidthProvider(Responsive);
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const CHART_TYPES = ['Bar Chart', 'Pie Chart', 'Line Chart'];
const DATA_SOURCES = ['sales', 'users', 'orders'];

// Normalize a widget: always ensure `id` field exists (DB returns `_id`)
const normalizeWidget = (w) => ({
  ...w,
  id: w.id || w._id?.toString() || `w-${Date.now()}-${Math.random()}`,
});

// ─── Widget settings modal ─────────────────────────────────────────────────────
const WidgetModal = ({ widget, onSave, onClose }) => {
  const [type, setType] = useState(widget.type || 'Bar Chart');
  const [title, setTitle] = useState(widget.title || '');
  const [dataSource, setDataSource] = useState(widget.dataSource || 'sales');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-8 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Widget Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-left">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Chart Type</label>
            <div className="flex gap-2">
              {CHART_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
                  {t.replace(' Chart', '')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Data Source</label>
            <div className="flex gap-2">
              {DATA_SOURCES.map(src => (
                <button key={src} type="button" onClick={() => setDataSource(src)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dataSource === src ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
                  {src}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-2">
              {dataSource === 'sales' ? '→ Monthly revenue ($)' : dataSource === 'orders' ? '→ Order volume per month' : '→ New user registrations per month'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { onSave({ ...widget, type, title: title || `${type} – ${dataSource}`, dataSource }); onClose(); }}
          className="mt-6 w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Apply
        </button>
      </motion.div>
    </div>
  );
};

// ─── Chart rendering ───────────────────────────────────────────────────────────
const renderChart = (widget, analyticsData) => {
  const { type, dataSource } = widget;
  if (!analyticsData) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
    </div>
  );

  let chartData = [];
  if (dataSource === 'sales') {
    chartData = (analyticsData.monthlySales || []).map(m => ({ name: m.month, value: Math.round(m.revenue) }));
  } else if (dataSource === 'orders') {
    chartData = (analyticsData.monthlySales || []).map(m => ({ name: m.month, value: m.orders }));
  } else if (dataSource === 'users') {
    chartData = (analyticsData.monthlyUsers || []).map(m => ({ name: m.month, value: m.users }));
  }

  const tip = { borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 700 };

  if (type === 'Bar Chart') return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={chartData} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 700 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 700 }} width={35} />
        <Tooltip contentStyle={tip} />
        <Bar dataKey="value" fill="#6366F1" radius={[6,6,0,0]} />
      </ReBarChart>
    </ResponsiveContainer>
  );

  if (type === 'Pie Chart') return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chartData} innerRadius="50%" outerRadius="75%" paddingAngle={4} dataKey="value" label={({ name }) => name}>
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tip} />
      </PieChart>
    </ResponsiveContainer>
  );

  if (type === 'Line Chart') return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 700 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 700 }} width={35} />
        <Tooltip contentStyle={tip} />
        <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.08} dot={{ fill: '#10B981', r: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  );

  return <div className="flex items-center justify-center h-full text-slate-300 text-xs">Unknown chart type</div>;
};

// ─── Main Component ────────────────────────────────────────────────────────────
const DashboardBuilder = () => {
  const { t } = useTranslation();
  const { id: dashboardId } = useParams();
  const { createDashboard, updateDashboard, currentDashboard, setCurrentDashboard, dashboards, fetchDashboards } = useDashboardStore();
  const navigate = useNavigate();

  const [layout, setLayout] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [dashboardName, setDashboardName] = useState('My Dashboard');
  const [editingWidget, setEditingWidget] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // ── Fetch analytics data (for chart rendering)
  useEffect(() => {
    axios.get('/api/analytics', { headers: getAuthHeader() })
      .then(res => setAnalyticsData(res.data.data))
      .catch(() => setAnalyticsError(true));
  }, []);

  // ── Load saved dashboards
  useEffect(() => {
    fetchDashboards().catch(() => {});
  }, [fetchDashboards]);

  // ── Load a specific dashboard by URL param
  useEffect(() => {
    if (dashboardId && dashboards.length > 0) {
      const dash = dashboards.find(d => d._id === dashboardId);
      if (dash) {
        setCurrentDashboard(dash);
      }
    } else if (!dashboardId) {
      // Creating a new dashboard — reset state
      setCurrentDashboard(null);
      setWidgets([]);
      setLayout([]);
      setDashboardName('My Dashboard');
    }
  }, [dashboardId, dashboards]);

  // ── Populate form from currentDashboard
  useEffect(() => {
    if (currentDashboard) {
      setDashboardName(currentDashboard.name || 'My Dashboard');
      const normalized = (currentDashboard.widgets || []).map(normalizeWidget);
      setWidgets(normalized);
      // Build layout from saved widget positions
      setLayout(normalized.map(w => ({
        i: w.id,
        x: w.x ?? 0,
        y: w.y ?? 0,
        w: w.w ?? 4,
        h: w.h ?? 4,
        minW: 2,
        minH: 3,
      })));
    }
  }, [currentDashboard]);

  const addWidget = (type) => {
    const id = `widget-${Date.now()}`;
    const newWidget = normalizeWidget({ id, type, title: `${type} – Sales`, dataSource: 'sales' });
    const col = (widgets.length * 4) % 12;
    const newLayoutItem = { i: id, x: col, y: Infinity, w: 4, h: 4, minW: 2, minH: 3 };
    setWidgets(prev => [...prev, newWidget]);
    setLayout(prev => [...prev, newLayoutItem]);
  };

  const removeWidget = (id) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setLayout(prev => prev.filter(l => l.i !== id));
  };

  const updateWidget = (updated) => {
    setWidgets(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  const handleSave = async () => {
    if (!dashboardName.trim()) {
      setSaveMsg('Please enter a dashboard name');
      return;
    }
    setSaving(true);
    setSaveMsg('');

    // Merge layout positions into widget objects before saving
    const widgetsWithLayout = widgets.map(w => {
      const l = layout.find(li => li.i === w.id) || {};
      return {
        id: w.id, 
        type: w.type,
        title: w.title,
        dataSource: w.dataSource,
        x: l.x ?? 0,
        y: l.y ?? 0,
        w: l.w ?? 4,
        h: l.h ?? 4,
      };
    });

    const dashboardData = {
      name: dashboardName.trim(),
      widgets: widgetsWithLayout,
      layout: layout.map(l => ({ i: l.i, x: l.x || 0, y: l.y || 0, w: l.w || 4, h: l.h || 4 })),
    };

    try {
      if (currentDashboard?._id) {
        await updateDashboard(currentDashboard._id, dashboardData);
        setSaveMsg('✓ Saved!');
      } else {
        const newDash = await createDashboard(dashboardData);
        setCurrentDashboard(newDash);
        navigate(`/dashboard/builder/${newDash._id}`, { replace: true });
        setSaveMsg('✓ Dashboard created!');
      }
    } catch (err) {
      setSaveMsg(`Save failed: ${err?.message || 'unknown error'}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto text-left">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[32px] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 gap-6"
      >
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 shrink-0">
            <LayoutIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 group/title">
              <input
                type="text"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="text-2xl font-black text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-500/10 p-2 -ml-2 rounded-xl bg-transparent block w-full outline-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                placeholder="Dashboard name..."
              />
              <Pencil className="w-4 h-4 text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">
              {currentDashboard ? `Editing saved dashboard` : 'New dashboard — not saved yet'}
              {' · '}{widgets.length} widget{widgets.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 flex-wrap">
          {dashboards.length > 0 && (
            <div className="relative group">
              <button
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-black hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                Load Dashboard
                <ChevronRight className="w-4 h-4 rotate-90" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto p-2">
                  <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved Dashboards</div>
                  {dashboards.map(d => (
                    <button
                      key={d._id}
                      onClick={() => navigate(`/dashboard/builder/${d._id}`)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                        currentDashboard?._id === d._id
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
                  <button
                    onClick={() => navigate('/dashboard/builder')}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Start New
                  </button>
                </div>
              </div>
            </div>
          )}

          {saveMsg && (
            <span className={`text-xs font-black uppercase tracking-widest ${saveMsg.startsWith('✓') ? 'text-emerald-500' : 'text-rose-500'}`}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : currentDashboard ? 'Save Changes' : 'Create Dashboard'}
          </button>
        </div>
      </motion.div>

      {/* Analytics error banner */}
      {analyticsError && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-6 py-4 text-amber-700 dark:text-amber-400 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Could not load analytics data. Charts will be empty. Check your connection or try refreshing.
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-72 shrink-0 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Add Widget</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-6">Click a chart to add it. Then click ⚙ to set its data source.</p>
            <div className="space-y-3">
              {[
                { type: 'Bar Chart',  icon: <BarChart className="w-4 h-4" />,  desc: 'Monthly data as bars'    },
                { type: 'Pie Chart',  icon: <PieIcon className="w-4 h-4" />,   desc: 'Distribution breakdown'  },
                { type: 'Line Chart', icon: <Activity className="w-4 h-4" />,  desc: 'Trend over time'         },
              ].map((w) => (
                <button
                  key={w.type}
                  onClick={() => addWidget(w.type)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-indigo-600 group-hover:shadow-md transition-all">
                    {w.icon}
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-700 dark:text-slate-200">{w.type}</span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold">{w.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Data Sources</p>
              {[
                { src: 'sales',  label: 'Sales',  desc: 'Monthly revenue ($)' },
                { src: 'orders', label: 'Orders', desc: 'Order volume / month' },
                { src: 'users',  label: 'Users',  desc: 'Registrations / month' },
              ].map(item => (
                <div key={item.src} className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="capitalize">{item.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal">→ {item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid canvas */}
        <div className="flex-1 min-h-[900px]">
          <div className="bg-slate-100/50 dark:bg-slate-800/20 rounded-[60px] p-8 border-2 border-dashed border-slate-200/60 dark:border-slate-700/60 min-h-full">
            {widgets.length > 0 ? (
              <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                onLayoutChange={(l) => setLayout(l)}
                draggableHandle=".drag-handle"
                margin={[24, 24]}
              >
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
                  >
                    {/* Card header */}
                    <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3 drag-handle cursor-move select-none">
                        <div className="flex flex-col gap-0.5">
                          <div className="w-3 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                          <div className="w-3 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                          <div className="w-3 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>
                        <div className="leading-tight">
                          <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest line-clamp-1">{widget.title}</span>
                          <span className="block text-[9px] font-bold text-indigo-400 uppercase tracking-wider">{widget.type} · {widget.dataSource}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button onClick={() => setEditingWidget(widget)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Settings">
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeWidget(widget.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-600 transition-colors" title="Remove">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Chart area */}
                    <div className="p-4 h-[calc(100%-52px)]">
                      {renderChart(widget, analyticsData)}
                    </div>
                  </div>
                ))}
              </ResponsiveGridLayout>
            ) : (
              <div className="flex flex-col items-center justify-center h-[700px]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[40px] flex items-center justify-center shadow-2xl shadow-indigo-500/10 mb-8 border border-slate-100 dark:border-slate-800"
                >
                  <LayoutIcon className="w-14 h-14 text-indigo-500/20" />
                </motion.div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Empty Dashboard</h3>
                <p className="text-slate-400 font-bold max-w-xs text-center mt-3 text-sm">Click a chart type from the left panel to add widgets. Use ⚙ to configure chart type and data source.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Widget settings modal */}
      <AnimatePresence>
        {editingWidget && (
          <WidgetModal
            widget={editingWidget}
            onSave={updateWidget}
            onClose={() => setEditingWidget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardBuilder;
