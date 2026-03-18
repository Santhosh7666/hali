import React, { useEffect, useState } from 'react';
import { useOrderStore } from '../../store/orderStore.js';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  FileText,
  ShoppingBag,
  Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EditOrderModal from '../../components/EditOrderModal.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore.js';
import { formatCurrency } from '../../utils/currencyUtils.js';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const OrdersPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { orders, fetchOrders, deleteOrder, loading } = useOrderStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingOrder, setEditingOrder] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Resolve product name from either the legacy string or the populated ref
  const getProductName = (order) =>
    order.productId?.name || order.product || '—';

  // Resolve customer label: admin sees user name/email, user sees "My Order"
  const getCustomerLabel = (order) => {
    if (isAdmin) {
      const buyer = order.createdBy;
      if (buyer?.name) return buyer.name;
      if (buyer?.email) return buyer.email;
      return 'Unknown';
    }
    return 'My Order';
  };

  const filteredOrders = orders.filter(order => {
    const productName = getProductName(order).toLowerCase();
    const customerLabel = getCustomerLabel(order).toLowerCase();
    const matchesSearch =
      productName.includes(searchTerm.toLowerCase()) ||
      customerLabel.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Delete this order?')) await deleteOrder(id);
  };

  const exportToCSV = () => {
    const headers = ['Customer', 'Product', 'Quantity', 'Total', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(o => [
        getCustomerLabel(o),
        getProductName(o),
        o.quantity,
        o.totalAmount,
        o.status,
        new Date(o.orderDate || o.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12 text-left"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isAdmin ? t('orders.title') : 'My Orders'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {isAdmin
              ? t('orders.description')
              : 'Orders you have placed from the store.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          {/* Admin-only: manual create order */}
          {isAdmin && (
            <Link
              to="/dashboard/orders/create"
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('orders.newOrder')}
            </Link>
          )}
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isAdmin ? 'Search by customer or product…' : 'Search orders…'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 transition-all outline-none"
          />
        </div>
        <div className="relative flex-1 lg:w-48">
          <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 appearance-none focus:ring-2 focus:ring-indigo-500/10 outline-none"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5">
                {isAdmin && <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Customer</th>}
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Product</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Qty</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Date</th>
                {isAdmin && <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group"
                  >
                    {isAdmin && (
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black uppercase shadow-lg shadow-indigo-600/10">
                            {getCustomerLabel(order)[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{getCustomerLabel(order)}</p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              {order.createdBy?.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                          <Package className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-slate-700 dark:text-slate-300">{getProductName(order)}</span>
                          {order.productId?.createdBy?.name && (
                            <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                              Created by: {order.productId.createdBy.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300 tabular-nums">{order.quantity || 1}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(order.totalAmount || 0, user?.settings?.currency)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'Completed'  ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20' :
                        order.status === 'In Progress' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20' :
                        order.status === 'Cancelled'  ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                        {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingOrder(order)}
                            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl text-slate-400 hover:text-rose-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 px-10">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[40px] flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-slate-200 dark:text-slate-700" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                {isAdmin ? t('orders.noOrders') : 'No orders yet. Visit the Store to order products!'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50/30 dark:bg-white/5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
            {filteredOrders.length} / {orders.length} Orders
          </p>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-600 transition-all group">
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>
            <button className="w-10 h-10 rounded-xl text-xs font-black bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">1</button>
            <button className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-600 transition-all group">
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>
          </div>
        </div>
      </motion.div>

      <EditOrderModal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        order={editingOrder}
      />
    </motion.div>
  );
};

export default OrdersPage;
