'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  MousePointer2,
  Layers,
  Zap,
  Cpu,
  Sun,
  Moon
} from 'lucide-react';
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';

import { useLanguage } from '../src/contexts/LanguageContext';
import { useTheme } from '../src/contexts/ThemeContext';

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div ref={containerRef} className={`min-h-screen transition-colors duration-700 ${theme === 'dark'
      ? "bg-[#020205] text-white selection:bg-indigo-500/30 selection:text-indigo-200"
      : "bg-slate-50 text-slate-900 selection:bg-indigo-200 selection:text-indigo-900"
      }`}>

      {/* Mesh Gadients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse transition-opacity duration-700 ${theme === 'dark' ? 'opacity-100' : 'opacity-40'}`} />
        <div className={`absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse decoration-3000 transition-opacity duration-700 ${theme === 'dark' ? 'opacity-100' : 'opacity-40'}`} />
        <div className={`absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full transition-opacity duration-700 ${theme === 'dark' ? 'opacity-100' : 'opacity-40'}`} />
      </div>

      <nav className={`fixed top-0 w-full z-[100] backdrop-blur-xl transition-all duration-500 border-b ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-white/70 border-slate-200 shadow-sm'
        }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
                DMU
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-black tracking-tighter uppercase leading-none italic transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Property <span className="text-indigo-500 font-normal">Hub</span>
                </span>
                <span className={`hidden sm:block text-[8px] font-black tracking-[0.4em] uppercase mt-1 transition-colors ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Debremarkos University
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link href="#" className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-indigo-500 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('navigation_home') || 'Home'}
              </Link>
              <Link href="#features" className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-indigo-500 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('features')}
              </Link>
              <Link href="#modules" className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-indigo-500 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('modules')}
              </Link>
              <Link href="#team" className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-indigo-500 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('about')}
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10'
                  : 'bg-slate-50 border-slate-200 text-indigo-600 hover:bg-indigo-50'
                  }`}
              >
                {theme === 'dark' ? <Sun size={18} fill="currentColor" /> : <Moon size={18} fill="currentColor" />}
              </button>

              {/* Language Toggle */}
              <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full transition-all ${language === 'en' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('am')}
                  className={`px-3 py-1 rounded-full transition-all ${language === 'am' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  አማ
                </button>
              </div>

              <Link
                href="/login"
                className="px-8 py-3 bg-white text-black font-black text-[10px] rounded-full uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-white/10"
              >
                Login
              </Link>
            </div>

            <button className="lg:hidden w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Parallax Immersive */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden px-6">
        <motion.div style={{ y: heroY, opacity: opacityHero }} className="absolute inset-0 z-0">
          <Image
            src="/university_hero.png"
            alt="DMU Burie Campus"
            fill
            className="object-cover opacity-60 scale-110"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-700 ${theme === 'dark' ? 'from-[#020205]/40 via-[#020205]/80 to-[#020205]' : 'from-slate-50/10 via-slate-50/50 to-slate-50'
            }`} />
        </motion.div>

        <div className="max-w-7xl mx-auto relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 mx-auto">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
              {t('heroTag')}
            </div>
            <h1 className={`text-6xl md:text-9xl font-black tracking-[-0.04em] leading-[0.85] mb-10 uppercase italic transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('heroStreamline')} <span className="text-indigo-600 not-italic">{t('heroProperty')}</span> <br />
              {t('heroSystem')}
            </h1>
            <p className={`text-lg md:text-2xl font-medium leading-relaxed mb-12 max-w-3xl mx-auto transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('heroSub')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/login"
                className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white font-black rounded-[2rem] flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:scale-105 hover:bg-indigo-500 active:scale-95 transition-all group"
              >
                {t('getStarted')} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-12 py-6 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black rounded-[2rem] flex items-center justify-center gap-4 hover:bg-white/10 transition-all active:scale-95">
                <MousePointer2 size={20} /> {t('requestAccess')}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-indigo-500/50 to-transparent" />
        </motion.div>
      </section >

      {/* Advanced Bento Grid Modules */}
      < section id="modules" className="py-32 relative z-10 px-6 lg:px-8" >
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <p className="text-indigo-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4">{t('modulesTag')}</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-6 italic">
              {t('modulesTitle')}
            </h2>
            <div className="w-20 h-1 bg-indigo-600" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Main Feature - Dashboard */}
            {/* Main Feature - Removed as per request */}

            {/* Small - Procurement */}
            {/* Small - Procurement - Removed as per request */}

            {/* Small - Academic */}
            <motion.div variants={itemVariants} className="md:col-span-4 group relative bg-white rounded-[3rem] p-10 flex flex-col justify-between overflow-hidden transition-all duration-700 border border-slate-200">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-8">
                  <GraduationCap className="text-white" />
                </div>
                <h3 className="text-3xl font-black text-black uppercase italic mb-4">{t('academicHubLabel')}</h3>
                <p className="text-slate-600 font-bold text-sm leading-relaxed">
                  {t('academicHubDesc')}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-[50%] opacity-0 group-hover:opacity-10 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                <Image src="/academic_hub.png" alt="Academic" fill className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-5 pointer-events-none" />
              <ArrowUpRight size={32} className="absolute bottom-10 right-10 text-black/10 group-hover:text-black transition-all duration-500" />
            </motion.div>

            {/* Med - Security & AI */}
            <motion.div variants={itemVariants} className={`md:col-span-8 group relative rounded-[3rem] border p-10 flex items-center gap-10 overflow-hidden transition-all duration-700 ${theme === 'dark' ? 'bg-[#0c0c11] border-white/5' : 'bg-white border-slate-200'
              }`}>
              <div className="flex-1 relative z-10">
                <p className="text-indigo-500 font-black tracking-widest text-[9px] mb-4 uppercase">Infrastructure Security</p>
                <h3 className={`text-3xl font-black uppercase italic mb-4 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Enterprise Shield</h3>
                <p className={`font-medium text-sm leading-relaxed mb-6 transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Every transaction and property record is protected by AES-256 encryption and role-based cryptographic signing.
                </p>
                <div className="flex gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-colors ${theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-500'
                    }`}>
                    <ShieldCheck size={14} className="text-indigo-500" /> SSL SECURED
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-colors ${theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-500'
                    }`}>
                    <Zap size={14} className="text-amber-500" /> ULTRA FAST
                  </div>
                </div>
              </div>
              <div className="hidden lg:block w-48 h-48 relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 border-2 border-dashed rounded-full transition-colors ${theme === 'dark' ? 'border-indigo-500/20' : 'border-indigo-100'
                    }`}
                />
                <div className={`absolute inset-4 border rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'border-indigo-500/30' : 'border-indigo-100'
                  }`}>
                  <Lock className={`w-12 h-12 transition-colors ${theme === 'dark' ? 'text-indigo-500' : 'text-indigo-600'}`} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section >
      {/* Streamlined Workflows Section */}
      < section id="features" className={`py-32 relative z-10 px-6 lg:px-8 border-y transition-colors duration-700 ${theme === 'dark' ? 'bg-[#05050a]/50 border-white/5' : 'bg-white/80 border-slate-200'
        }`
      }>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-indigo-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4"
            >
              {t('workflowsTag')}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-8 italic transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              {t('workflowsTitle')} <br />
              <span className="text-indigo-600 not-italic">{t('workflowsTitle_2')}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 max-w-2xl mx-auto font-medium"
            >
              {t('workflowsDesc')}
            </motion.p>
          </div>

          <div className="space-y-32">
            {/* Academic Flow */}
            <div className="relative">
              <div className="flex items-center gap-4 mb-12">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${theme === 'dark' ? 'bg-indigo-600/20 border-indigo-600/30' : 'bg-indigo-50 border-indigo-200'
                  }`}>
                  <GraduationCap className="text-indigo-500 w-5 h-5" />
                </div>
                <h3 className={`text-2xl font-black uppercase italic tracking-tight transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('academicFlowLabel')}</h3>
              </div>

              <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-2">
                {[
                  { label: 'flow_teacher', icon: <Users size={20} /> },
                  { label: 'flow_dept_head', icon: <ShieldCheck size={20} /> },
                  { label: 'flow_ac', icon: <Cpu size={20} /> },
                  { label: 'flow_md', icon: <Building2 size={20} /> },
                  { label: 'flow_gs', icon: <Layers size={20} /> },
                  { label: 'flow_pmt', icon: <Package size={20} /> },
                  { label: 'flow_clerk', icon: <MousePointer2 size={20} /> },
                  { label: 'flow_keeper', icon: <Lock size={20} /> }
                ].map((step, idx, arr) => (
                  <div key={idx} className="flex flex-1 items-center gap-2 min-w-[160px] lg:min-w-0" style={{ perspective: "1200px" }}>
                    <motion.div
                      initial={{ opacity: 0, y: 30, rotateX: 25 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      whileHover={{
                        rotateY: 20,
                        rotateX: -15,
                        scale: 1.08,
                        translateZ: 40,
                        boxShadow: "0 20px 40px -10px rgba(6, 182, 212, 0.3)"
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        delay: idx * 0.05
                      }}
                      viewport={{ once: true }}
                      className={`flex-1 group relative rounded-[2rem] backdrop-blur-3xl border transition-all cursor-default overflow-hidden ${theme === 'dark'
                        ? 'bg-cyan-950/20 border-cyan-500/20 hover:border-cyan-400'
                        : 'bg-white border-cyan-200 hover:border-cyan-500 shadow-lg shadow-cyan-100/50'
                        }`}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Holographic Edge Glow */}
                      <div className="absolute inset-0 border-[0.5px] border-white/10 rounded-[2rem] pointer-events-none" />

                      {/* Cyber Pulse Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Digital Icon Container */}
                      <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 border shadow-[0_0_20px_rgba(6,182,212,0.1)] ${theme === 'dark'
                        ? 'bg-cyan-500/10 border-cyan-500/30 group-hover:border-cyan-400 group-hover:bg-cyan-500/20'
                        : 'bg-cyan-50 border-cyan-200 group-hover:border-cyan-400 group-hover:bg-cyan-100'
                        }`}>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-400/20 blur-xl rounded-full" />
                        <span className={`transition-colors drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] ${theme === 'dark' ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-cyan-600 group-hover:text-cyan-700'
                          }`}>
                          {step.icon}
                        </span>
                      </div>

                      <div className="relative z-10">
                        <p className={`text-[11px] font-black uppercase tracking-[0.25em] transition-colors ${theme === 'dark' ? 'text-cyan-100/60 group-hover:text-cyan-50' : 'text-slate-600 group-hover:text-cyan-700'
                          }`}>
                          {t(step.label as any)}
                        </p>
                        <div className={`mt-3 h-[2px] w-6 rounded-full group-hover:w-full transition-all duration-700 ease-out ${theme === 'dark' ? 'bg-cyan-500/40' : 'bg-cyan-500'
                          }`} />
                      </div>

                      {/* Holographic Data Tag */}
                      <div className="absolute top-4 right-4 text-[9px] font-mono text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors tracking-widest" style={{ transform: "translateZ(50px)" }}>
                        ID_{idx + 1}
                      </div>

                      {/* Matrix Scan Effect */}
                      <motion.div
                        animate={{ top: ["-100%", "200%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none"
                      />
                    </motion.div>

                    {idx < arr.length - 1 && (
                      <div className="flex items-center justify-center w-8 lg:w-14 h-10 relative">
                        <motion.div
                          animate={{
                            x: [-10, 10],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="flex items-center -space-x-3 lg:-space-x-4"
                        >
                          <ChevronRight size={14} className={`lg:block hidden ${theme === 'dark' ? 'text-cyan-400/30' : 'text-cyan-300'}`} />
                          <div className="relative">
                            <ChevronRight size={24} className={`lg:size-32 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                            <div className={`absolute inset-0 blur-md opacity-40 animate-pulse ${theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-500'}`} />
                          </div>
                          <ChevronRight size={14} className={`lg:block hidden ${theme === 'dark' ? 'text-cyan-400/30' : 'text-cyan-300'}`} />
                        </motion.div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="absolute -left-10 top-20 bottom-10 w-[1px] bg-gradient-to-b from-indigo-500/50 to-transparent hidden lg:block" />
            </div>

            {/* Admin Flow */}
            <div className="relative">
              <div className="flex items-center gap-4 mb-12">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${theme === 'dark' ? 'bg-blue-600/20 border-blue-600/30' : 'bg-blue-50 border-blue-200'
                  }`}>
                  <Building2 className="text-blue-500 w-5 h-5" />
                </div>
                <h3 className={`text-2xl font-black uppercase italic tracking-tight transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('adminFlowLabel')}</h3>
              </div>

              <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-2">
                {[
                  { label: 'flow_employee', icon: <Users size={20} /> },
                  { label: 'flow_tl', icon: <Zap size={20} /> },
                  { label: 'flow_md', icon: <Building2 size={20} /> },
                  { label: 'flow_gs', icon: <Layers size={20} /> },
                  { label: 'flow_pmt', icon: <Package size={20} /> },
                  { label: 'flow_clerk', icon: <MousePointer2 size={20} /> },
                  { label: 'flow_keeper', icon: <Lock size={20} /> }
                ].map((step, idx, arr) => (
                  <div key={idx} className="flex flex-1 items-center gap-2 min-w-[160px] lg:min-w-0" style={{ perspective: "1200px" }}>
                    <motion.div
                      initial={{ opacity: 0, y: 30, rotateX: 25 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      whileHover={{
                        rotateY: -20,
                        rotateX: -15,
                        scale: 1.08,
                        translateZ: 40,
                        boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.3)"
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        delay: idx * 0.05
                      }}
                      viewport={{ once: true }}
                      className={`flex-1 group relative rounded-[2rem] backdrop-blur-3xl border transition-all cursor-default overflow-hidden ${theme === 'dark'
                        ? 'bg-indigo-950/20 border-indigo-500/20 hover:border-indigo-400'
                        : 'bg-white border-indigo-200 hover:border-indigo-500 shadow-lg shadow-indigo-100/50'
                        }`}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Holographic Edge Glow */}
                      <div className="absolute inset-0 border-[0.5px] border-white/10 rounded-[2rem] pointer-events-none" />

                      {/* Pulse Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Digital Icon Container */}
                      <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border shadow-[0_0_20px_rgba(79,70,229,0.1)] ${theme === 'dark'
                        ? 'bg-indigo-500/10 border-indigo-500/30 group-hover:border-indigo-400 group-hover:bg-indigo-500/20'
                        : 'bg-indigo-50 border-indigo-200 group-hover:border-indigo-400 group-hover:bg-indigo-100'
                        }`}>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-400/20 blur-xl rounded-full" />
                        <span className={`transition-colors drop-shadow-[0_0_10px_rgba(129,140,248,0.5)] ${theme === 'dark' ? 'text-indigo-400 group-hover:text-indigo-300' : 'text-indigo-600 group-hover:text-indigo-700'
                          }`}>
                          {step.icon}
                        </span>
                      </div>

                      <div className="relative z-10">
                        <p className={`text-[11px] font-black uppercase tracking-[0.25em] transition-colors ${theme === 'dark' ? 'text-indigo-100/60 group-hover:text-indigo-50' : 'text-slate-600 group-hover:text-indigo-700'
                          }`}>
                          {t(step.label as any)}
                        </p>
                        <div className={`mt-3 h-[2px] w-6 rounded-full group-hover:w-full transition-all duration-700 ease-out ${theme === 'dark' ? 'bg-indigo-500/40' : 'bg-indigo-500'
                          }`} />
                      </div>

                      {/* Data Tag */}
                      <div className="absolute top-4 right-4 text-[9px] font-mono text-indigo-500/20 group-hover:text-indigo-400/40 transition-colors tracking-widest" style={{ transform: "translateZ(50px)" }}>
                        SYS_{idx + 1}
                      </div>

                      {/* Matrix Scan Effect */}
                      <motion.div
                        animate={{ top: ["-100%", "200%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-indigo-400/5 to-transparent pointer-events-none"
                      />
                    </motion.div>

                    {idx < arr.length - 1 && (
                      <div className="flex items-center justify-center w-8 lg:w-14 h-10 relative">
                        <motion.div
                          animate={{
                            x: [-10, 10],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="flex items-center -space-x-3 lg:-space-x-4"
                        >
                          <ChevronRight size={14} className={`lg:block hidden ${theme === 'dark' ? 'text-indigo-400/30' : 'text-indigo-300'}`} />
                          <div className="relative">
                            <ChevronRight size={24} className={`lg:size-32 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            <div className={`absolute inset-0 blur-md opacity-40 animate-pulse ${theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'}`} />
                          </div>
                          <ChevronRight size={14} className={`lg:block hidden ${theme === 'dark' ? 'text-indigo-400/30' : 'text-indigo-300'}`} />
                        </motion.div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="absolute -left-10 top-20 bottom-10 w-[1px] bg-gradient-to-b from-blue-500/50 to-transparent hidden lg:block" />
            </div>
          </div>
        </div>
      </section >


      <section className={`py-40 relative z-10 px-6 lg:px-8 overflow-hidden transition-colors duration-700 ${theme === 'dark' ? 'bg-[#050510]' : 'bg-white'
        }`}>
        {/* Design Accents for Sun Theme */}
        {theme === 'light' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/50 blur-[100px] rounded-full" />
          </div>
        )}

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full border text-[11px] font-black uppercase tracking-[0.3em] transition-all ${theme === 'dark'
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                : 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm shadow-indigo-100'
                }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                {t('impactTag')}
              </div>
              <h2 className={`text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.82] italic transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('impactTitle_1')} <br />
                <span className="text-indigo-600 not-italic">{t('impactTitle_2')}</span>
              </h2>
              <p className={`text-xl md:text-2xl font-medium leading-relaxed max-w-xl transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('impactDesc')}
              </p>

              <div className="grid grid-cols-2 gap-12 pt-10">
                {[
                  { label: 'impactStat_1_Label', val: 'impactStat_1_Val' },
                  { label: 'impactStat_2_Label', val: 'impactStat_2_Val' }
                ].map((stat, idx) => (
                  <div key={idx} className="space-y-3 group/stat">
                    <div className="text-5xl md:text-6xl font-black text-indigo-600 tracking-tighter italic group-hover/stat:scale-110 transition-transform origin-left duration-500">{t(stat.val as any)}</div>
                    <div className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${theme === 'dark' ? 'text-slate-500 group-hover/stat:text-indigo-400' : 'text-slate-400 group-hover/stat:text-indigo-600'}`}>{t(stat.label as any)}</div>
                    <div className="w-10 h-1 bg-indigo-600/20 rounded-full group-hover/stat:w-full group-hover/stat:bg-indigo-600 transition-all duration-700" />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group lg:h-[700px] flex items-center justify-center p-12"
            >
              <div className={`absolute inset-0 rounded-[4rem] transition-colors duration-700 pointer-events-none ${theme === 'dark' ? 'bg-indigo-600/20 blur-[150px]' : 'bg-indigo-100/50 blur-[120px]'
                }`} />

              <div className="relative w-full h-full flex items-center justify-center">
                {/* Glowing Background */}
                <div className={`absolute inset-0 rounded-full blur-[100px] transition-colors duration-700 ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-100/40'}`} />

                {/* Rotating Rings with Enhanced Glow */}
                <div className="w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] relative flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-0 border-2 border-dashed rounded-full transition-colors box-shadow-[0_0_50px_rgba(6,182,212,0.2)] ${theme === 'dark' ? 'border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                      }`}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-12 border border-dashed rounded-full transition-colors ${theme === 'dark' ? 'border-indigo-500/40 shadow-[0_0_30px_rgba(79,70,229,0.1)]' : 'border-indigo-300 shadow-[0_0_30px_rgba(79,70,229,0.2)]'
                      }`}
                  />

                  {/* Central Lock with Intense Glow */}
                  <div className={`w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center border-2 backdrop-blur-md relative z-10 shadow-[0_0_60px_rgba(79,70,229,0.6)] ${theme === 'dark' ? 'bg-[#050510]/80 border-indigo-500/50' : 'bg-white/50 border-indigo-300'
                    }`}>
                    <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full animate-pulse" />
                    <Lock className={`w-16 h-16 lg:w-20 lg:h-20 transition-colors drop-shadow-[0_0_20px_rgba(99,102,241,1)] ${theme === 'dark' ? 'text-cyan-400' : 'text-indigo-600'
                      }`} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section >

      {/* Meet Our Team Section */}
      < section id="team" className={`py-32 relative z-10 px-6 lg:px-8 border-t transition-colors duration-700 overflow-hidden ${theme === 'dark' ? 'bg-[#020205] border-white/5' : 'bg-slate-50 border-slate-200'
        }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-cyan-500 font-black tracking-[0.5em] uppercase text-[10px] block mb-4"
            >
              {t('teamTag')}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-8 italics transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              {t('teamTitle')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`max-w-2xl mx-auto font-medium mb-8 transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
            >
              {t('teamDesc')}
            </motion.p>
            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest bg-cyan-500/5 py-2 px-4 rounded-full border border-cyan-500/10 w-fit mx-auto cursor-help group">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse group-hover:scale-150 transition-transform" />
              {t('teamAction')}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                group: 'implementationGroup',
                team: 'Implementation Team',
                label: 'Implementation',
                members: ['Shikure', 'Woldemariam'],
                color: 'cyan',
                glow: 'rgba(6,182,212,0.3)',
                bgImage: '/implementation.png'
              },
              {
                group: 'documentationGroup',
                team: 'Documentation Team',
                label: 'Documentation',
                members: ['Lamenew', 'Samuel', 'Nurye', 'samson'],
                color: 'indigo',
                glow: 'rgba(79,70,229,0.3)',
                bgImage: '/documentation.png'
              },
              {
                group: 'supporterGroup',
                team: 'Supporter',
                label: 'Supporter',
                members: ['Yeshimebet'],
                color: 'blue',
                glow: 'rgba(59,130,246,0.3)',
                bgImage: '/supporter.png'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.08}
                whileHover={{
                  scale: 1.05,
                  rotateY: 10,
                  rotateX: -10,
                  boxShadow: `0 30px 60px -12px ${item.glow}`
                }}
                className={`group relative p-10 rounded-[3rem] backdrop-blur-3xl border transition-all cursor-grab active:cursor-grabbing overflow-hidden ${theme === 'dark'
                  ? `bg-[#050510]/80 ${item.color === 'cyan' ? 'border-cyan-500/30 hover:border-cyan-400' : item.color === 'indigo' ? 'border-indigo-500/30 hover:border-indigo-400' : 'border-blue-500/30 hover:border-blue-400'}`
                  : `bg-white border-slate-200 hover:border-indigo-400 shadow-xl shadow-slate-200/50`
                  }`}
                style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
              >
                {/* Background Image Layer - 100% Visibility Professionals */}
                <div
                  className="absolute inset-0 transition-opacity duration-700 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${item.bgImage})`,
                    opacity: 1,
                  }}
                />

                {/* Bottom Shadow Gradient for Text Legibility */}
                <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-black/95 via-black/40 to-transparent z-[5]" />

                {/* Holographic Border Highlight */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity z-10 ${item.color === 'cyan' ? 'from-cyan-500/20' :
                  item.color === 'indigo' ? 'from-indigo-500/20' :
                    'from-blue-500/20'
                  } to-transparent pointer-events-none`} />

                <div className="relative z-20 space-y-10">
                  <div style={{ transform: "translateZ(50px)" }}>
                    <span className={`text-[10px] font-black uppercase tracking-[0.4em] block mb-3 drop-shadow-md ${item.color === 'cyan' ? 'text-cyan-400' :
                      item.color === 'indigo' ? 'text-indigo-300' :
                        'text-blue-300'
                      }`}>
                      {t(item.group as any)}
                    </span>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-[0.85] drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">
                      {item.team}
                    </h3>
                    <div className="mt-2 h-[2px] w-12 bg-white/40 group-hover:w-20 group-hover:bg-cyan-500 transition-all duration-500" />
                    <p className={`text-[9px] font-mono mt-2 uppercase tracking-widest drop-shadow-md ${item.color === 'cyan' ? 'text-cyan-200' :
                      item.color === 'indigo' ? 'text-indigo-200' :
                        'text-blue-200'
                      }`}>{item.label}</p>
                  </div>

                  <div className="space-y-6" style={{ transform: "translateZ(30px)" }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 flex items-center gap-3 drop-shadow-lg">
                      <span className={`w-8 h-[1px] ${item.color === 'cyan' ? 'bg-cyan-500' :
                        item.color === 'indigo' ? 'bg-indigo-500' :
                          'bg-blue-500'
                        }`} />
                      {t('members')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {item.members.map((member, mIdx) => (
                        <div
                          key={mIdx}
                          className={`px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 text-[11px] font-black text-white group-hover:bg-opacity-100 transition-all shadow-2xl ${item.color === 'cyan' ? 'group-hover:border-cyan-500' :
                            item.color === 'indigo' ? 'group-hover:border-indigo-500' :
                              'group-hover:border-blue-500'
                            }`}
                          style={{ transform: "translateZ(40px)" }}
                        >
                          {member}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cyber Data Flow */}
                  <div className="pt-4" style={{ transform: "translateZ(20px)" }}>
                    <div className={`h-1 w-full bg-opacity-5 rounded-full overflow-hidden relative ${item.color === 'cyan' ? 'bg-cyan-500' :
                      item.color === 'indigo' ? 'bg-indigo-500' :
                        'bg-blue-500'
                      }`}>
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: idx * 0.7 }}
                        className={`absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-opacity-40 to-transparent ${item.color === 'cyan' ? 'via-cyan-400' :
                          item.color === 'indigo' ? 'via-indigo-400' :
                            'via-blue-400'
                          }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Vertical Cyber Line */}
                <div className={`absolute left-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-opacity-40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${item.color === 'cyan' ? 'via-cyan-500' :
                  item.color === 'indigo' ? 'via-indigo-500' :
                    'via-blue-500'
                  }`} />

                {/* 3D Reflection */}
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ transform: "rotateX(90deg) translateZ(-50px)" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Ultra Footer */}
      < footer className={`pt-32 pb-16 relative z-10 border-t transition-colors duration-700 ${theme === 'dark' ? 'bg-[#020205] border-white/5' : 'bg-white border-slate-100'
        }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
            <div className="col-span-1 md:col-span-2 space-y-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center text-2xl font-black shadow-2xl">PH</div>
                <div className="flex flex-col">
                  <h5 className={`text-2xl font-black tracking-tighter uppercase italic transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Property <span className="text-indigo-600 font-normal">Hub</span>
                  </h5>
                  <p className={`text-[10px] font-black tracking-[0.4em] uppercase mt-1 transition-colors ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Debremarkos University
                  </p>
                </div>
              </div>
              <p className={`text-lg font-medium leading-relaxed max-w-sm transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Leading the digital transformation of Burie Campus. A vision of excellence in resource management and institutional integrity.
              </p>
              <div className="flex gap-6">
                {[FaFacebook, FaTwitter, FaLinkedin, FaYoutube].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center text-slate-500 hover:bg-indigo-600 hover:text-white transition-all hover:-translate-y-2 shadow-xl">
                    <Icon size={22} />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 col-span-1 md:col-span-2 gap-12">
              <div className="space-y-8">
                <h6 className={`text-[11px] font-black tracking-[0.4em] uppercase transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  SYSTEM UNITS
                </h6>
                <ul className="space-y-6">
                  {['Procurement', 'Academic', 'Inventory', 'Executive'].map(item => (
                    <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-black uppercase tracking-widest">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div className="space-y-8">
                <h6 className={`text-[11px] font-black tracking-[0.4em] uppercase transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  RESOURCES
                </h6>
                <ul className="space-y-6">
                  {['User Guides', 'IT Support', 'Privacy Policy', 'Security'].map(item => (
                    <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-black uppercase tracking-widest">{item}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-600">
            <p className="text-[10px] font-black tracking-[0.5em] uppercase text-center md:text-left">
              &copy; 2025 Debremarkos University Burie Campus. <br className="md:hidden" /> Crafted with Precision by DMU Tech.
            </p>
            <div className="flex gap-10 items-center">
              <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-indigo-400">
                <ShieldCheck size={14} /> SECURITY AUDITED
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-blue-400">
                <Globe2 size={14} /> GLOBAL ACCESSIBLE
              </span>
            </div>
          </div>
        </div>
      </footer >

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {
          isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className={`fixed inset-0 z-[150] flex items-center justify-center p-10 transition-colors duration-500 ${theme === 'dark' ? 'bg-black/90' : 'bg-white/95'
                }`}
            >
              <button
                onClick={() => setIsMenuOpen(false)}
                className={`absolute top-10 right-10 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${theme === 'dark' ? 'bg-white/10 text-white border-white/20' : 'bg-slate-100 text-slate-900 border-slate-200'
                  }`}
              >
                <X />
              </button>
              <div className="flex flex-col gap-10 text-center uppercase">
                {['Home', 'Features', 'Modules', 'About'].map((item, idx) => (
                  <motion.a
                    key={item}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    href="#"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-4xl font-black italic tracking-tighter hover:text-indigo-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}
                  >
                    {item}
                  </motion.a>
                ))}

                {/* Mobile Theme & Language Toggle */}
                <div className="flex flex-col gap-4 mt-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className={`flex items-center justify-center rounded-full p-2 border transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                      }`}
                  >
                    <button
                      onClick={toggleTheme}
                      className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-sm transition-all ${theme === 'dark' ? 'text-yellow-400' : 'text-indigo-600'
                        }`}
                    >
                      {theme === 'dark' ? <Sun size={18} fill="currentColor" /> : <Moon size={18} fill="currentColor" />}
                      {theme === 'dark' ? 'SUN THEME' : 'DARK THEME'}
                    </button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`flex items-center justify-center rounded-full p-2 border transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                      }`}
                  >
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-6 py-2 rounded-full font-black text-sm transition-all ${language === 'en' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                    >
                      ENGLISH
                    </button>
                    <button
                      onClick={() => setLanguage('am')}
                      className={`px-6 py-2 rounded-full font-black text-sm transition-all ${language === 'am' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      አማርኛ
                    </button>
                  </motion.div>
                </div>

                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-4 px-12 py-6 bg-indigo-600 text-white font-black rounded-[2rem] text-xl shadow-2xl shadow-indigo-600/40"
                >
                  SYSTEM LOGIN
                </Link>
              </div>
            </motion.div>
          )
        }
      </AnimatePresence >

    </div >
  );
}
