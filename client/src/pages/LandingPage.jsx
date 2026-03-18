import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Globe,
  Lock,
  Package,
  ShoppingBag,
  Users,
  LineChart,
  UserCircle,
  CheckCircle,
  ChevronDown,
  Star,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import './LandingPage.css';

/* ─── Data ──────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: 'Admin Dashboard',
    desc: 'A powerful, real-time dashboard that gives admins full control — track users, monitor revenue, and manage everything in one place.',
    color: 'blue',
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Product Creation',
    desc: 'Upload images, set prices and stock levels, assign categories — creating a new product takes under 30 seconds.',
    color: 'violet',
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: 'Order Management',
    desc: 'Track every order from placement to delivery. Filter by status, export data, and update orders instantly.',
    color: 'cyan',
  },
  {
    icon: <UserCircle className="w-6 h-6" />,
    title: 'Profile System',
    desc: 'Every user gets a rich profile with photo upload, password management, and personalised settings.',
    color: 'emerald',
  },
  {
    icon: <LineChart className="w-6 h-6" />,
    title: 'Live Analytics',
    desc: 'Beautiful charts show monthly revenue, user growth, and order breakdowns so you always know what is happening.',
    color: 'amber',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Secure by Default',
    desc: 'JWT authentication, role-based access control, and bcrypt password hashing keep your data safe at every layer.',
    color: 'rose',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Create an Account',
    desc: 'Sign up in seconds. Admins get full access; regular users land straight in the store.',
  },
  {
    num: '02',
    title: 'Build Your Profile',
    desc: 'Upload a photo, set your display name, and personalise your account settings.',
  },
  {
    num: '03',
    title: 'Add Your Products',
    desc: 'Admins create products with photos, prices, and stock. They appear instantly in the store for all users.',
  },
  {
    num: '04',
    title: 'Manage Orders',
    desc: 'Users browse and buy; admins see every order, update statuses, and track revenue in real time.',
  },
];

const TRUST = [
  {
    icon: <Lock className="w-6 h-6 text-blue-400" />,
    title: 'Enterprise-grade Security',
    desc: 'JWT + bcrypt + role-based access control on every route.',
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-400" />,
    title: 'Fast & Responsive',
    desc: 'Optimised API calls, lazy loading, and smooth animations everywhere.',
  },
  {
    icon: <Globe className="w-6 h-6 text-emerald-400" />,
    title: 'Scales With You',
    desc: 'Built on MongoDB + Node.js — ready to grow from 10 to 10,000 users.',
  },
];

const colorMap = {
  blue:   { ring: 'ring-blue-500/20',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   glow: 'shadow-blue-500/20' },
  violet: { ring: 'ring-violet-500/20', bg: 'bg-violet-500/10', text: 'text-violet-400', glow: 'shadow-violet-500/20' },
  cyan:   { ring: 'ring-cyan-500/20',   bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   glow: 'shadow-cyan-500/20' },
  emerald:{ ring: 'ring-emerald-500/20',bg: 'bg-emerald-500/10',text: 'text-emerald-400',glow: 'shadow-emerald-500/20' },
  amber:  { ring: 'ring-amber-500/20',  bg: 'bg-amber-500/10',  text: 'text-amber-400',  glow: 'shadow-amber-500/20' },
  rose:   { ring: 'ring-rose-500/20',   bg: 'bg-rose-500/10',   text: 'text-rose-400',   glow: 'shadow-rose-500/20' },
};

/* ─── Reusable scroll-reveal wrapper ────────────────────────────────── */
const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const y = direction === 'up' ? 40 : direction === 'left' ? 0 : 0;
  const x = direction === 'left' ? 40 : direction === 'right' ? -40 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────── */
const LandingPage = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, [0, 600], [0, 180]);

  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden font-sans selection:bg-indigo-500/30">

      {/* ── Mouse Glow ──────────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed z-0 hidden lg:block w-[600px] h-[600px] rounded-full"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          transition: 'left 0.15s ease, top 0.15s ease',
        }}
      />

      {/* ── Ambient blobs ───────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/8 blur-[140px] rounded-full animate-blob" />
        <div className="absolute top-[30%] right-[-15%] w-[700px] h-[700px] bg-violet-600/6 blur-[140px] rounded-full animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full animate-blob animation-delay-4000" />
      </div>

      {/* ── Floating particles ──────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="particle absolute rounded-full bg-indigo-400/20"
            style={{
              left: `${(i * 4.2 + 3) % 100}%`,
              width: `${(i % 3) + 1}px`,
              height: `${(i % 3) + 1}px`,
              animationDelay: `${(i * 1.3) % 10}s`,
              '--duration': `${12 + (i % 8)}s`,
            }}
          />
        ))}
      </div>

      {/* ====================================================
          NAV
      ===================================================== */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3 bg-[#030712]/85 backdrop-blur-2xl border-b border-white/6'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/25 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">
              HALLEY<span className="text-indigo-400">X</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {['Features', 'Analytics', 'Security'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/login"
              className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/30 hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu */}
          <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-white/6"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black text-center hover:bg-indigo-500 transition">Get Started →</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ====================================================
          HERO
      ===================================================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 overflow-hidden hero-section">

        {/* Grid mesh overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Heading glow orb behind text */}
          <div className="hero-glow-orb" />

          
          {/* Headline — staggered word reveal */}
          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tighter leading-[1.0] mb-8 relative">
            <motion.span
              className="block text-white hero-word"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Build.
            </motion.span>
            <motion.span
              className="block hero-word-gradient hero-word"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.30, ease: [0.22, 1, 0.36, 1] }}
            >
              Scale.
            </motion.span>
            <motion.span
              className="block text-white hero-word"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              Dominate.
            </motion.span>
          </h1>

          {/* Subtext */}
          <motion.p
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            All-in-one admin platform to manage products, track orders, and analyze performance — faster, smarter, better.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.80, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/register"
              className="hero-btn-primary group relative overflow-hidden px-10 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-[0.97]"
            >
              <span className="relative flex items-center gap-3">
                Start Managing Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <a
              href="#features"
              className="hero-btn-secondary px-10 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-[0.97]"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.0 }}
          >
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1">5.0 Rating</span>
            </div>
            <span className="opacity-30 hidden sm:block">|</span>
            <span>Zero Setup Cost</span>
            <span className="opacity-30 hidden sm:block">|</span>
            <span>No Credit Card Required</span>
          </motion.div>
        </div>

        {/* Dashboard mock preview */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 30 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: parallax }}
          className="relative z-10 mt-20 w-full max-w-5xl mx-auto"
        >
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-indigo-600/30 via-violet-600/30 to-blue-600/30 blur-2xl scale-105" />
            {/* The mock dashboard box */}
            <div className="relative rounded-[28px] border border-white/10 bg-[#0d1117] overflow-hidden shadow-2xl shadow-black/60 p-0">
              {/* Toolbar bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6 bg-[#0a0f1e]">
                <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <div className="flex-1" />
                <div className="px-4 py-1 bg-white/5 rounded-md text-[10px] text-slate-500 font-mono">
                  halleyx.app/dashboard
                </div>
                <div className="flex-1" />
              </div>
              {/* Dashboard content mock */}
              <div className="flex">
                {/* Sidebar */}
                <div className="hidden md:flex flex-col w-52 border-r border-white/5 p-4 gap-2 bg-[#0a0e1a]">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/20 mb-2">
                    <div className="w-4 h-4 rounded bg-indigo-500/50" />
                    <div className="w-16 h-2 rounded bg-indigo-400/40" />
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/4">
                      <div className="w-4 h-4 rounded bg-slate-700" />
                      <div className={`h-2 rounded bg-slate-700 ${i % 3 === 0 ? 'w-20' : i % 3 === 1 ? 'w-14' : 'w-18'}`} />
                    </div>
                  ))}
                </div>
                {/* Main area */}
                <div className="flex-1 p-6 bg-[#0b1020]">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Revenue', val: '$12,400', color: 'indigo' },
                      { label: 'Orders', val: '284', color: 'violet' },
                      { label: 'Users', val: '1,820', color: 'cyan' },
                      { label: 'Products', val: '56', color: 'emerald' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/4 border border-white/6 rounded-2xl p-4">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-xl font-black text-white">{s.val}</p>
                      </div>
                    ))}
                  </div>
                  {/* Chart mock */}
                  <div className="bg-white/3 border border-white/5 rounded-2xl p-5 mb-4">
                    <div className="flex items-end gap-2 h-24">
                      {[35, 55, 40, 70, 60, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-600/80 to-violet-500/60"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Table mock */}
                  <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-white/4 last:border-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20" />
                        <div className="flex-1 h-2 rounded bg-slate-700/60 max-w-[120px]" />
                        <div className="w-12 h-2 rounded bg-slate-700/40" />
                        <div className="w-10 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-5 -right-4 md:right-8 bg-emerald-500/90 text-white px-4 py-2 rounded-2xl text-[11px] font-black shadow-xl shadow-emerald-500/30 backdrop-blur flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Order Completed
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-5 -left-4 md:left-8 bg-indigo-600/90 text-white px-4 py-2 rounded-2xl text-[11px] font-black shadow-xl shadow-indigo-600/30 backdrop-blur flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" /> Revenue +24%
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="relative z-10 mt-24 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ====================================================
          STATS STRIP
      ===================================================== */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Response time', value: '< 50ms' },
              { label: 'Security level', value: 'L3+' },
              { label: 'Uptime guarantee', value: '99.9%' },
              { label: 'Transactions / sec', value: '10K+' },
            ].map((stat, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="group text-center p-6 rounded-[24px] bg-white/3 border border-white/6 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-default">
                  <p className="text-3xl font-black bg-gradient-to-br from-white to-indigo-300 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          FEATURES
      ===================================================== */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <Reveal>
              <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em] mb-4">
                What's Included
              </p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                Everything you need,{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  nothing you don't
                </span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                Built from the ground up for admins who want real control. No bloat, no confusion — just the tools that matter.
              </p>
            </Reveal>
          </div>

          {/* Cards grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <Reveal key={i} delay={i * 0.07}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`group relative p-8 rounded-[28px] bg-white/3 border border-white/6 hover:border-white/12 hover:bg-white/5 transition-all cursor-default overflow-hidden ring-1 ring-transparent hover:${c.ring}`}
                  >
                    {/* Glow top */}
                    <div className={`absolute -top-12 -right-12 w-36 h-36 ${c.bg} blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-xl ${c.bg} ${c.text} mb-6 ring-1 ${c.ring}`}>
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-black text-white mb-3">{f.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-medium text-sm">{f.desc}</p>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>


      {/* ====================================================
          DASHBOARD PREVIEW
      ===================================================== */}
      <section id="analytics" className="py-32 px-6 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text side */}
            <div className="lg:w-1/2">
              <Reveal>
                <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em] mb-4">Real-time Analytics</p>
                <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
                  Data that tells the{' '}
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    whole story
                  </span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed font-medium mb-10">
                  Monthly revenue charts, order status breakdowns, and user growth curves — all visible the moment you log in. Make decisions based on real numbers, not guesswork.
                </p>
                <div className="space-y-4">
                  {[
                    'Live revenue tracking across all orders',
                    'Order status breakdown with visual pie charts',
                    'Month-by-month user growth trend lines',
                    'Instantly refreshes when new data arrives',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3 h-3 text-indigo-400" />
                      </div>
                      <span className="text-slate-300 font-medium text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Visual side */}
            <div className="lg:w-1/2 relative">
              <Reveal direction="left" delay={0.2}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/25 to-violet-600/25 rounded-[32px] blur-2xl scale-105" />
                  <div className="relative bg-[#0a0e1a] border border-white/8 rounded-[28px] p-6 shadow-2xl shadow-black/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Monthly Revenue</p>
                    {/* Bar chart */}
                    <div className="flex items-end gap-1.5 h-40 mb-6">
                      {[40, 65, 45, 80, 60, 90, 70, 85, 75, 95, 80, 100].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                          className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-700 to-violet-500"
                        />
                      ))}
                    </div>
                    {/* Mini stat cards */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Revenue', val: '$48.2K', up: true },
                        { label: 'Orders', val: '1,284', up: true },
                        { label: 'Avg. Order', val: '$37.54', up: false },
                      ].map((s, i) => (
                        <div key={i} className="bg-white/4 rounded-xl p-3">
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{s.label}</p>
                          <p className="text-sm font-black text-white mt-0.5">{s.val}</p>
                          <p className={`text-[9px] font-black mt-0.5 ${s.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {s.up ? '▲ 18%' : '▼ 3%'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          TRUST SECTION
      ===================================================== */}
      <section id="security" className="py-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Reveal>
              <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em] mb-4">Built to Last</p>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight">
                Secure. Fast.{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Scalable.
                </span>
              </h2>
            </Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TRUST.map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group p-8 rounded-[28px] bg-white/3 border border-white/6 hover:border-white/12 transition-all text-center cursor-default"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/8 mb-6 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-black text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          FINAL CTA
      ===================================================== */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="relative overflow-hidden rounded-[40px] text-center">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-violet-900/60 to-blue-900/80 border border-indigo-500/20 rounded-[40px]" />
              {/* Corner glows */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/30 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/30 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.04] rounded-[40px] overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }}
              />
              {/* Content */}
              <div className="relative z-10 py-20 px-8">
                <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
                  Start your journey today
                </h2>
                <p className="text-indigo-200/70 text-lg font-medium max-w-xl mx-auto mb-12 leading-relaxed">
                  Join thousands of businesses using Halleyx to manage products, orders, and analytics — all in one place.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/register"
                    className="group px-12 py-5 bg-white text-indigo-900 rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-2xl shadow-white/20 hover:shadow-white/30 hover:scale-105 active:scale-[0.97] transition-all"
                  >
                    Create Account Now →
                  </Link>
                  <Link
                    to="/login"
                    className="px-12 py-5 bg-white/10 border border-white/20 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-white/15 transition-all hover:scale-105 active:scale-[0.97]"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ====================================================
          FOOTER
      ===================================================== */}
      <footer className="py-16 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-black" />
            </div>
            <span className="font-black tracking-tighter uppercase text-lg">
              HALLEY<span className="text-indigo-400">X</span>
            </span>
          </div>
          <p className="text-slate-600 text-sm font-medium">
            © 2026 HalleyX. Crafted with care.
          </p>
          <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
            {['Privacy', 'Terms', 'Status'].map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
