import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { User, Mail, Shield, Camera, Check, X, Loader2, KeyRound, UserCircle, ShieldCheck, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateProfile, updatePassword, loading, error } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    profileImage: ''
  });

  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setIsEditing(false);
      showSuccess('Identity parameters updated successfully.');
    } catch (err) {}
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Security violation: Passwords do not match');
      return;
    }
    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSuccess('Access key re-synchronized successfully.');
    } catch (err) {}
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-4 pb-20 text-left"
    >
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-24 right-8 z-50 bg-slate-900 border border-white/10 text-white px-6 py-4 rounded-[24px] shadow-2xl flex items-center gap-3 font-bold backdrop-blur-xl"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <span className="text-sm tracking-tight">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('profile.description')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none text-center">
            <div className="relative inline-block mb-6">
              <div 
                className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[48px] flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {profileForm.profileImage || user?.profileImage ? (
                  <img src={profileForm.profileImage || user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-20 h-20 text-slate-300 dark:text-slate-600" />
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user?.name}</h2>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mt-1">{user?.role || t('profile.role')}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-left p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('profile.joined')}</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 mt-0.5">{new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <Calendar className="w-5 h-5 text-slate-300" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Forms */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          {/* Identity Section */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.info')}</h3>
                  <p className="text-slate-400 font-medium text-sm mt-0.5">{t('profile.infoDesc')}</p>
                </div>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  {t('profile.edit')}
                </button>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('profile.fullName')}</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold disabled:opacity-50"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('profile.email')}</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="email"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold disabled:opacity-50"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-3 pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {t('profile.saveChanges')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-3.5 bg-slate-50 text-slate-400 rounded-2xl text-xs font-black hover:bg-slate-100 transition-all"
                  >
                    {t('profile.cancel')}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.security')}</h3>
                  <p className="text-slate-400 font-medium text-sm mt-0.5">{t('profile.changePassword')}</p>
                </div>
              </div>
              {!isChangingPassword && (
                <button 
                  onClick={() => setIsChangingPassword(true)}
                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4 shadow-xl shadow-slate-900/10" />
                  {t('profile.changePassword')}
                </button>
              )}
            </div>

            <AnimatePresence>
              {isChangingPassword && (
                <motion.form 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handlePasswordSubmit}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-full space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('profile.currentPassword')}</label>
                      <input 
                        type="password"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 transition-all text-sm font-bold"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('profile.newPassword')}</label>
                      <input 
                        type="password"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 transition-all text-sm font-bold"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('profile.confirmPassword')}</label>
                      <input 
                        type="password"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 transition-all text-sm font-bold"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      {t('profile.updatePassword')}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="px-8 py-3.5 bg-slate-50 text-slate-400 rounded-2xl text-xs font-black hover:bg-slate-100 transition-all"
                    >
                      {t('profile.cancel')}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
