import React, { useState, useEffect } from 'react';
import { Settings, Bell, Palette, Globe, Lock, Check, Loader2, ChevronRight, LayoutPanelTop, Terminal, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { motion } from 'framer-motion';
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

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user, updateSettings, settingsLoading: loading, error: storeError } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Sync i18n with user language on mount
  useEffect(() => {
    const userLang = user?.settings?.language;
    if (userLang) {
      const langCode = userLang.includes('Spanish') ? 'es' : 
                       userLang.includes('French') ? 'fr' : 
                       userLang.includes('German') ? 'de' : 'en';
      if (i18n.language !== langCode) {
        i18n.changeLanguage(langCode);
      }
    }
  }, [user?.settings?.language, i18n]);

  const handleUpdate = async (key, value) => {
    try {
      if (!user) {
        setLocalError("User session lost. Please log in again.");
        return;
      }
      setLocalError(null);
      const currentSettings = user.settings || {
        theme: 'Light Mode',
        language: 'English (US)',
        currency: 'USD ($)',
        autoSave: true,
        emailAlerts: true,
        pushNotifications: true
      };
      const newSettings = { ...currentSettings, [key]: value };
      
      // Update i18n if language changed
      if (key === 'language') {
        const langCode = value.includes('Spanish') ? 'es' : 
                         value.includes('French') ? 'fr' : 
                         value.includes('German') ? 'de' : 'en';
        await i18n.changeLanguage(langCode);
      }

      await updateSettings(newSettings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setLocalError(err.response?.data?.message || t('settings.updateFailed'));
      setTimeout(() => setLocalError(null), 5000);
    }
  };

  const sections = [
    {
      title: t('settings.general'),
      desc: t('settings.generalDesc'),
      icon: <Globe className="w-5 h-5 text-indigo-400" />,
      settings: [
        { 
          label: t('settings.language'), 
          key: 'language',
          value: user?.settings?.language || 'English (US)',
          options: ['English (US)', 'Spanish', 'French', 'German']
        },
        { 
          label: t('settings.currency'), 
          key: 'currency',
          value: user?.settings?.currency || 'USD ($)',
          options: ['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)', 'JPY (¥)']
        },
      ]
    },
    {
      title: t('settings.appearance'),
      desc: t('settings.appearanceDesc'),
      icon: <Palette className="w-5 h-5 text-violet-400" />,
      settings: [
        { 
          label: t('settings.theme'), 
          key: 'theme',
          value: user?.settings?.theme || 'Light Mode',
          options: ['Light Mode', 'Dark Mode', 'System']
        },
        { 
          label: t('settings.autoSave'), 
          key: 'autoSave',
          value: user?.settings?.autoSave ?? true,
          type: 'toggle'
        },
      ]
    },
    {
      title: t('settings.notifications'),
      desc: t('settings.notificationsDesc'),
      icon: <Bell className="w-5 h-5 text-amber-400" />,
      settings: [
        { 
          label: t('settings.emailNotifications'), 
          key: 'emailAlerts',
          value: user?.settings?.emailAlerts ?? true,
          type: 'toggle'
        },
        { 
          label: t('settings.pushNotifications'), 
          key: 'pushNotifications',
          value: user?.settings?.pushNotifications ?? true,
          type: 'toggle'
        },
      ]
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto pb-20 px-4"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 text-left">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('settings.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('settings.description')}</p>
        </div>
        <motion.div>
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100"
            >
              <Check className="w-4 h-4" />
              {t('settings.saved')}
            </motion.div>
          ) : localError || storeError ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100"
            >
              <Zap className="w-4 h-4" />
              {localError || storeError}
            </motion.div>
          ) : (
             <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700">
              <Check className="w-4 h-4" />
              {t('settings.updated')}
            </div>
          )}
        </motion.div>
      </motion.div>

      <div className="space-y-10 text-left">
        {sections.map((section, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
          >
            <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{section.title}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">{section.desc}</p>
                </div>
              </div>
              <div className="hidden md:block">
                 <LayoutPanelTop className="w-8 h-8 text-slate-50" />
              </div>
            </div>
            <div className="p-10 space-y-10">
              {section.settings.map((setting, j) => (
                <div key={j} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 group/item">
                  <div className="max-w-md">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">{setting.label}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 leading-relaxed">Customize your {setting.label.toLowerCase()} preferences.</p>
                  </div>
                  <div className="flex items-center gap-6">
                    {setting.type === 'toggle' ? (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleUpdate(setting.key, !setting.value);
                        }}
                        disabled={loading}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none shadow-inner ${setting.value ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full shadow-md transition-all flex items-center justify-center ${setting.value ? 'translate-x-7 bg-white' : 'translate-x-1 bg-white dark:bg-slate-300'}`}>
                          {loading && <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />}
                        </span>
                      </button>
                    ) : (
                      <div className="relative inline-block">
                        <select 
                          value={setting.value}
                          onChange={(e) => handleUpdate(setting.key, e.target.value)}
                          disabled={loading}
                          className="appearance-none bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-black uppercase tracking-widest px-8 py-3.5 pr-12 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all min-w-[180px]"
                        >
                          {setting.options?.map(opt => (
                            <option key={opt} value={opt} className="dark:bg-slate-900">{opt}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-indigo-400">
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div 
          variants={itemVariants}
          className="bg-rose-50 p-12 rounded-[50px] border border-rose-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-rose-500/20 transition-all duration-700" />
          <div className="relative z-10 font-bold">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-xl shadow-rose-600/10">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-rose-950 tracking-tight">{t('settings.dangerZone')}</h3>
                <p className="text-rose-600/70 font-bold text-xs uppercase tracking-widest mt-1">{t('settings.dangerDesc')}</p>
              </div>
            </div>
            <p className="text-sm text-rose-950/60 font-medium max-w-xl leading-relaxed mb-10">Deleting your account will permanently remove all your data, settings, and order history. This cannot be reversed.</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button className="px-10 py-4 bg-rose-600 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/30 active:scale-[0.98]">
                {t('settings.deleteAccount')}
              </button>
              <button className="px-10 py-4 bg-white/50 border border-rose-200 text-rose-700 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-white transition-all backdrop-blur-sm">
                {t('settings.resetApp')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
