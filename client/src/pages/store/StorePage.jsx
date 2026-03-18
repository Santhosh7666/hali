import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore.js';
import { useAuthStore } from '../../store/authStore.js';
import axios from 'axios';
import {
  ShoppingCart,
  Search,
  Package,
  CheckCircle,
  XCircle,
  Star,
  Filter,
  Minus,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Use authStore token — same source used across all other stores
const getAuthHeader = () => {
  const token = useAuthStore.getState().token || localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const categoryColors = {
  Electronics: 'bg-indigo-100 text-indigo-700',
  Furniture:   'bg-amber-100 text-amber-700',
  Accessories: 'bg-emerald-100 text-emerald-700',
  Storage:     'bg-purple-100 text-purple-700',
  General:     'bg-slate-100 text-slate-700',
};


const StorePage = () => {
  const { products, fetchProducts, loading } = useProductStore();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notification, setNotification] = useState(null);

  // Purchase modal state
  const [purchaseModal, setPurchaseModal] = useState(null); // { product }
  const [qty, setQty] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = ['All', ...new Set(products.map(p => p.category || 'General'))];

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const openModal = (product) => {
    setPurchaseModal({ product });
    setQty(1);
  };

  const closeModal = () => {
    setPurchaseModal(null);
    setQty(1);
  };

  const handleConfirmPurchase = async () => {
    if (!purchaseModal) return;
    const { product } = purchaseModal;
    setPurchasing(true);
    try {
      await axios.post(
        '/api/orders/purchase',
        { productId: product._id, quantity: qty },
        { headers: getAuthHeader() }
      );
      // Refresh product list to get updated stock from server
      await fetchProducts();
      closeModal();
      showNotification(`🎉 You ordered ${qty}x "${product.name}" successfully!`, 'success');
    } catch (err) {
      closeModal();
      showNotification(err.response?.data?.message || 'Purchase failed', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold ${
              notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Quantity Modal */}
      <AnimatePresence>
        {purchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="text-left">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Confirm Purchase</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">{purchaseModal.product.name}</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quantity selector */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 space-y-3 text-left mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:shadow transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums w-8 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(purchaseModal.product.stock, q + 1))}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:shadow transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 font-bold">{purchaseModal.product.stock} in stock</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500">Total</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ${(purchaseModal.product.price * qty).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={purchasing}
                  className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {purchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                  {purchasing ? 'Placing…' : 'Place Order'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome to the Store, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Browse and purchase products from our curated catalog.</p>
        </div>
        <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-2xl text-xs font-black uppercase tracking-widest">
          {filtered.length} Products
        </span>
      </motion.div>

      {/* Filter Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
          <Package className="w-16 h-16 opacity-20" />
          <p className="font-black uppercase tracking-widest text-sm">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden flex flex-col"
            >
              {/* Product Image Area */}
              <div className="relative h-44 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Package className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
                  </div>
                )}
                <span className={`absolute top-4 left-4 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${categoryColors[product.category] || categoryColors.General}`}>
                  {product.category || 'General'}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Only {product.stock} left
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 flex flex-col flex-1 gap-3">
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 dark:text-white leading-tight text-base line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 font-medium leading-relaxed">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">${product.price.toFixed(2)}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">4.8</span>
                  </div>
                </div>
                <button
                  onClick={() => openModal(product)}
                  disabled={product.stock === 0}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    product.stock === 0
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 active:scale-[0.98]'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StorePage;
