import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore.js';
import { useProductStore } from '../../store/productStore.js';
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore.js';
import { formatCurrency } from '../../utils/currencyUtils.js';

const CreateOrderPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { createOrder, loading: orderLoading } = useOrderStore();
  const { products, fetchProducts, loading: productsLoading } = useProductStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const selectedProductId = watch('productId');

  const onSubmit = async (data) => {
    await createOrder({
      ...data,
      // Backend now dynamically calculates unitPrice/totalAmount based on productId
    });
    navigate('/dashboard/orders');
  };

  const getUnitPrice = (id) => {
    const product = products.find(p => p._id === id);
    return product ? product.price : 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('createOrder.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('createOrder.description')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Customer Information */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('profile.info')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('createOrder.firstName')}</label>
              <input 
                {...register('firstName', { required: true })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('createOrder.lastName')}</label>
              <input 
                {...register('lastName', { required: true })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('createOrder.email')}</label>
              <input 
                {...register('email', { required: true })}
                type="email"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
              <input 
                {...register('phoneNumber', { required: true })}
                type="tel"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Shipping Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Street Address</label>
                <input 
                  {...register('streetAddress', { required: true })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">City</label>
                <input 
                  {...register('city', { required: true })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">State / Province</label>
                <input 
                  {...register('state', { required: true })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Postal Code</label>
                <input 
                  {...register('postalCode', { required: true })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                  placeholder="10001"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Country</label>
                <input 
                  {...register('country', { required: true })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
                  placeholder="United States"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('createOrder.product')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('createOrder.product')}</label>
              <div className="relative">
                {productsLoading ? (
                  <div className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-500">
                    Loading products...
                  </div>
                ) : (
                  <select
                    {...register('productId', { required: true })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold text-slate-900 dark:text-white appearance-none"
                  >
                    <option value="">Select a product</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id} disabled={p.stock <= 0}>
                        {p.name} - ${p.price.toFixed(2)} {p.stock <= 0 ? '(Out of Stock)' : `(${p.stock} in stock)`}
                      </option>
                    ))}
                  </select>
                )}
                {selectedProductId && (
                  <div className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Unit Price: ${getUnitPrice(selectedProductId).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('createOrder.quantity')}</label>
              <input 
                {...register('quantity', { required: true, min: 1 })}
                type="number"
                defaultValue={1}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
              />
              {selectedProductId && (
                <div className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Total: ${(getUnitPrice(selectedProductId) * (watch('quantity') || 1)).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            {t('profile.cancel')}
          </button>
          <button 
            type="submit"
            disabled={orderLoading || productsLoading}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {orderLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('createOrder.processing')}</> : t('createOrder.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
