import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  DollarSign,
  Users,
  ShoppingBag,
  Clock,
  CheckCircle,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore.js';
import { formatCurrency } from '../../utils/currencyUtils.js';

const getAuthHeader = () => {
  const token = useAuthStore.getState().token || localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// All possible summary cards
const ALL_CARDS = [
  { key: 'totalSales',      label: 'Total Sales',       icon: <DollarSign className="w-5 h-5" />,  color: 'indigo',  format: 'currency' },
  { key: 'totalUsers',      label: 'Total Users',        icon: <Users className="w-5 h-5" />,       color: 'blue',    format: 'number'   },
  { key: 'totalOrders',     label: 'Total Orders',       icon: <ShoppingBag className="w-5 h-5" />, color: 'violet',  format: 'number'   },
  { key: 'pendingOrders',   label: 'Pending Orders',     icon: <Clock className="w-5 h-5" />,       color: 'amber',   format: 'number'   },
  { key: 'completedOrders', label: 'Completed Orders',   icon: <CheckCircle className="w-5 h-5" />, color: 'emerald', format: 'number'   },
  { key: 'revenueToday',    label: 'Revenue Today',      icon: <TrendingUp className="w-5 h-5" />,  color: 'rose',    format: 'currency' },
  { key: 'newUsersToday',   label: 'New Users Today',    icon: <UserPlus className="w-5 h-5" />,    color: 'cyan',    format: 'number'   },
];

const STORAGE_KEY = 'overview_visible_cards';
const DEFAULT_VISIBLE = ALL_CARDS.map(c => c.key);

const colorMap = {
  indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-600 dark:text-indigo-400',  blob: 'bg-indigo-500/5'  },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400',      blob: 'bg-blue-500/5'    },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-600 dark:text-violet-400',  blob: 'bg-violet-500/5'  },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-600 dark:text-amber-400',    blob: 'bg-amber-500/5'   },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400',blob: 'bg-emerald-500/5' },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-600 dark:text-rose-400',      blob: 'bg-rose-500/5'    },
  cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-600 dark:text-cyan-400',      blob: 'bg-cyan-500/5'    },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const UserDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  useEffect(() => {
    axios.get('/api/analytics/overview', { headers: getAuthHeader() })
      .then(res => setOverview(res.data.data))
      .catch(() => setOverview(null))
      .finally(() => setLoadingOverview(false));
  }, []);

  const formatValue = (card) => {
    const raw = overview?.[card.key] ?? 0;
    if (card.format === 'currency') return formatCurrency(raw, user?.settings?.currency);
    return raw;
  };



  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('dashboard.welcome')}, {user?.name ? user.name.split(' ')[0] : 'User'}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('dashboard.description')}</p>
        </div>
      </motion.div>

      {/* Summary Cards — Static and Simplified */}
      {loadingOverview ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ALL_CARDS.map((card, i) => {
            const c = colorMap[card.color];
            return (
              <motion.div
                key={card.key}
                variants={itemVariants}
                className="group bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 relative overflow-hidden"
              >
                <div className={`absolute -top-10 -right-10 w-24 h-24 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700 ${c.blob}`} />
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} ${c.text}`}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{card.label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight tabular-nums">
                  {formatValue(card)}
                </h3>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default UserDashboard;
