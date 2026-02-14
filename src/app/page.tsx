'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ChevronRight,
  Package,
  ShieldCheck,
  GraduationCap,
  Globe2,
  Users,
  Menu,
  X,
  Lock,
  ArrowUpRight,
  Layers,
  Zap,
  Cpu,
  MousePointer2,
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    })
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Subtle Background Accents */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] rounded-full blur-[200px] bg-indigo-50" />
        <div className="absolute -bottom-[200px] -left-[200px] w-[600px] h-[600px] rounded-full blur-[180px] bg-blue-50/80" />
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm tracking-tight bg-slate-900 text-white shadow-lg shadow-slate-900/20 transition-all duration-300 group-hover:scale-105">
                DMU
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold tracking-tight leading-none text-slate-900">
                  Property <span className="text-indigo-600 font-medium">System</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase mt-0.5 text-slate-400">
                  Debremarkos University
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: t('navigation_home') || 'Home', href: '#' },
                { label: t('features'), href: '#features' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-[13px] font-medium rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  {item.label}
                </Link>
              ))}

              <div className="mx-3 w-px h-5 bg-slate-200" />

              {/* Language Toggle */}
              <div className="flex items-center rounded-lg p-0.5 bg-slate-100">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${language === 'en'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700'
                    }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('am')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${language === 'am'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-700'
                    }`}
                >
                  አማ
                </button>
              </div>

              <Link
                href="/login"
                className="ml-3 px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-semibold rounded-lg hover:bg-indigo-700 active:scale-[0.97] transition-all shadow-lg shadow-indigo-600/20"
              >
                {t('login')}
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-700 transition-all"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Hero Background Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          {/* Gradient orbs */}
          <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-100/60 to-blue-50/40 blur-[100px]" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-violet-100/40 to-cyan-50/30 blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-32 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 border border-indigo-100/80 shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                </span>
                {t('heroTag')}
                <Sparkles size={12} className="text-indigo-400" />
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.05] text-slate-900"
              >
                {t('heroStreamline')}{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-[gradientShift_4s_ease_infinite]">
                  {t('heroProperty')}
                </span>
                <br />
                {t('heroSystem')}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg leading-relaxed max-w-xl text-slate-500"
              >
                {t('heroSub')}
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/login"
                  className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl flex items-center gap-3 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.97] transition-all duration-300"
                >
                  {t('getStarted')}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

              </motion.div>

              {/* Trust Indicators */}
              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap items-center gap-5 pt-6">
                {[
                  { icon: <ShieldCheck size={15} />, text: 'SSL Secured', color: 'text-emerald-500' },
                  { icon: <Zap size={15} />, text: 'Real-time Sync', color: 'text-amber-500' },
                  { icon: <Globe2 size={15} />, text: 'Multi-language', color: 'text-blue-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <div className={`w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center ${item.color}`}>
                      {item.icon}
                    </div>
                    {item.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Interactive Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative w-[480px] h-[480px] flex items-center justify-center">
                {/* Outer decorative ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'conic-gradient(from 0deg, transparent, rgba(99,102,241,0.08), transparent, rgba(139,92,246,0.06), transparent)' }}
                />
                <div className="absolute inset-[3px] rounded-full bg-white" />

                {/* Animated ring pulse */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-[-20px] rounded-full border border-indigo-200/30"
                />
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.05, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-[-40px] rounded-full border border-violet-200/20"
                />

                {/* Main Dashboard Card */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10 w-[320px] bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
                >
                  {/* Dashboard Header */}
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-800">DMU Dashboard</div>
                        <div className="text-[9px] text-slate-400">Property Management</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <div className="w-2 h-2 rounded-full bg-rose-400" />
                    </div>
                  </div>
                  {/* Stats Row */}
                  <div className="px-5 py-3 flex gap-3">
                    {[
                      { value: '2,847', label: 'Assets', color: 'from-indigo-500 to-blue-500' },
                      { value: '156', label: 'Active', color: 'from-emerald-500 to-teal-500' },
                      { value: '99.8%', label: 'Uptime', color: 'from-violet-500 to-purple-500' },
                    ].map((stat, i) => (
                      <div key={i} className="flex-1 bg-slate-50 rounded-lg p-2.5 text-center">
                        <div className={`text-sm font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                        <div className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Activity Bars */}
                  <div className="px-5 pb-4 space-y-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Weekly Activity</div>
                    <div className="flex items-end gap-1.5 h-14">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          className={`flex-1 rounded-md ${i === 5 ? 'bg-gradient-to-t from-indigo-600 to-violet-500' : 'bg-gradient-to-t from-slate-200 to-slate-100'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Floating Cards */}
                {/* Top-right notification card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
                  transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6, delay: 0.8 }, x: { duration: 0.6, delay: 0.8 } }}
                  className="absolute top-[12%] -right-[10%] z-20 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <ShieldCheck size={14} className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-800">System Secure</div>
                    <div className="text-[9px] text-emerald-500 font-semibold">All systems operational</div>
                  </div>
                </motion.div>

                {/* Bottom-left users card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                  transition={{ y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6, delay: 1 }, x: { duration: 0.6, delay: 1 } }}
                  className="absolute bottom-[15%] -left-[12%] z-20 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 px-4 py-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={12} className="text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-800">Active Users</span>
                  </div>
                  <div className="flex -space-x-2">
                    {['bg-indigo-400', 'bg-violet-400', 'bg-blue-400', 'bg-cyan-400'].map((color, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full ${color} border-2 border-white flex items-center justify-center`}>
                        <span className="text-[7px] font-bold text-white">{String.fromCharCode(65 + i)}</span>
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                      <span className="text-[7px] font-bold text-slate-500">+12</span>
                    </div>
                  </div>
                </motion.div>

                {/* Top-left package card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: [0, -10, 0] }}
                  transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6, delay: 1.2 } }}
                  className="absolute top-[8%] -left-[5%] z-20 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Package size={14} className="text-amber-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-800">+24 Items</div>
                    <div className="text-[9px] text-slate-400 font-medium">Added today</div>
                  </div>
                </motion.div>

                {/* Decorative connector lines */}
                <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 480 480">
                  <motion.circle cx="240" cy="240" r="160" fill="none" stroke="url(#heroGrad)" strokeWidth="1" strokeDasharray="8 8"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '240px 240px' }}
                  />
                  <defs>
                    <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-300"
        >
          <div className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1.5 rounded-full bg-current"
            />
          </div>
        </motion.div>
      </section>




      {/* ===== WORKFLOWS ===== */}
      <section id="features" className="py-28 relative z-10 px-6 lg:px-8 border-y bg-slate-50/50 border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-indigo-600 text-sm font-semibold tracking-wide mb-3">
              {t('workflowsTag')}
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-5 text-slate-900">
              {t('workflowsTitle')}{' '}
              <span className="text-indigo-600">{t('workflowsTitle_2')}</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-base text-slate-500">
              {t('workflowsDesc')}
            </motion.p>
          </div>

          <div className="space-y-20">
            {/* Academic Flow */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-50 text-cyan-600">
                  <GraduationCap size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t('academicFlowLabel')}</h3>
              </div>
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                {[
                  { label: 'flow_teacher', icon: <Users size={16} /> },
                  { label: 'flow_dept_head', icon: <ShieldCheck size={16} /> },
                  { label: 'flow_ac', icon: <Cpu size={16} /> },
                  { label: 'flow_md', icon: <Building2 size={16} /> },
                  { label: 'flow_gs', icon: <Layers size={16} /> },
                  { label: 'flow_pmt', icon: <Package size={16} /> },
                  { label: 'flow_clerk', icon: <MousePointer2 size={16} /> },
                  { label: 'flow_keeper', icon: <Lock size={16} /> }
                ].map((step, idx, arr) => (
                  <div key={idx} className="flex flex-1 items-center gap-3 min-w-[140px] lg:min-w-0">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} viewport={{ once: true }}
                      className="flex-1 rounded-xl p-4 border bg-white border-slate-200 hover:border-cyan-300 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-cyan-50 text-cyan-600">
                        {step.icon}
                      </div>
                      <p className="text-[11px] font-semibold tracking-wide text-slate-600">{t(step.label as any)}</p>
                    </motion.div>
                    {idx < arr.length - 1 && <ChevronRight size={16} className="shrink-0 hidden lg:block text-slate-300" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Flow */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600">
                  <Building2 size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t('adminFlowLabel')}</h3>
              </div>
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                {[
                  { label: 'flow_employee', icon: <Users size={16} /> },
                  { label: 'flow_tl', icon: <Zap size={16} /> },
                  { label: 'flow_md', icon: <Building2 size={16} /> },
                  { label: 'flow_gs', icon: <Layers size={16} /> },
                  { label: 'flow_pmt', icon: <Package size={16} /> },
                  { label: 'flow_clerk', icon: <MousePointer2 size={16} /> },
                  { label: 'flow_keeper', icon: <Lock size={16} /> }
                ].map((step, idx, arr) => (
                  <div key={idx} className="flex flex-1 items-center gap-3 min-w-[140px] lg:min-w-0">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} viewport={{ once: true }}
                      className="flex-1 rounded-xl p-4 border bg-white border-slate-200 hover:border-indigo-300 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-indigo-50 text-indigo-600">
                        {step.icon}
                      </div>
                      <p className="text-[11px] font-semibold tracking-wide text-slate-600">{t(step.label as any)}</p>
                    </motion.div>
                    {idx < arr.length - 1 && <ChevronRight size={16} className="shrink-0 hidden lg:block text-slate-300" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===== FOOTER ===== */}
      <footer className="pt-20 pb-12 relative z-10 border-t bg-slate-50 border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-slate-900 text-white">DMU</div>
                <div>
                  <span className="text-[15px] font-bold tracking-tight text-slate-900">
                    Property <span className="text-indigo-600 font-medium">System</span>
                  </span>
                  <p className="text-[10px] tracking-widest uppercase text-slate-400">Debremarkos University</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-slate-400">
                Leading the digital transformation of Burie Campus. A vision of excellence in resource management.
              </p>
              <div className="flex gap-3">
                {[FaFacebook, FaTwitter, FaLinkedin, FaYoutube].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-400 hover:text-white hover:bg-indigo-600 transition-all">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <h6 className="text-xs font-semibold tracking-wider uppercase text-slate-900">System Units</h6>
              <ul className="space-y-3">
                {['Procurement', 'Academic', 'Inventory', 'Executive'].map(item => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-indigo-600 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <h6 className="text-xs font-semibold tracking-wider uppercase text-slate-900">Resources</h6>
              <ul className="space-y-3">
                {['User Guides', 'IT Support', 'Privacy Policy', 'Security'].map(item => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-indigo-600 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">&copy; 2025 Debremarkos University Burie Campus. Crafted by DMU Tech.</p>
            <div className="flex gap-6 items-center">
              <span className="flex items-center gap-1.5 text-xs text-indigo-600/50"><ShieldCheck size={12} /> Security Audited</span>
              <span className="flex items-center gap-1.5 text-xs text-blue-600/50"><Globe2 size={12} /> Globally Accessible</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== MOBILE NAV ===== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex flex-col bg-white">
            <div className="flex justify-end p-6">
              <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-20">
              {[
                { label: 'Home', href: '#' },
                { label: 'Features', href: '#features' },
              ].map((item, idx) => (
                <motion.a key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }}
                  href={item.href} onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors">
                  {item.label}
                </motion.a>
              ))}
              <div className="flex items-center gap-3 mt-6">
                <div className="flex items-center rounded-lg p-0.5 bg-slate-100">
                  <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>EN</button>
                  <button onClick={() => setLanguage('am')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${language === 'am' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>አማ</button>
                </div>
              </div>
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="mt-4 px-10 py-4 bg-indigo-600 text-white font-semibold rounded-xl text-lg shadow-xl shadow-indigo-600/25">
                {t('login')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
