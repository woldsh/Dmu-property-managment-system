'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RegisterUser from '@/components/RegisterUser';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLogOut,
  FiUser,
  FiGrid,
  FiUsers,
  FiActivity,
  FiSettings,
  FiPlusCircle,
  FiDatabase,
  FiShield,
  FiMoon,
  FiSun,
  FiZap,
  FiLock,
  FiTrendingUp,
  FiLayers,
  FiBriefcase,
  FiDollarSign,
  FiHome,
  FiCoffee
} from 'react-icons/fi';

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('registration');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-24 h-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-t-4 border-r-4 border-blue-500 rounded-full"
            />
            <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiShield className="text-3xl text-blue-500 animate-pulse" />
            </div>
          </div>
          <p className="mt-8 text-white font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">Establishing Secure Link</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Minimalism Header */}
      <header className="fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <FiShield />
          </div>
          <h1 className="font-bold text-slate-800 tracking-tight">Admin Console</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated As</p>
            <p className="text-xs font-black text-slate-700">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all text-xs font-bold"
          >
            <FiLogOut />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4 md:px-0">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">Initialize New Identity</h2>
            <p className="text-slate-500 font-medium">Create secure credentials and assign institutional roles for new staff members.</p>
          </div>

          {/* Registration Component */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-2">
            <RegisterUser />
          </div>

          {/* Minimalist Footer Info */}
          <div className="mt-12 flex flex-col items-center gap-4 opacity-40">
            <div className="flex items-center gap-3 w-full max-w-xs">
              <div className="h-px flex-1 bg-slate-300" />
              <FiLock className="text-xs text-slate-400" />
              <div className="h-px flex-1 bg-slate-300" />
            </div>
            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.3em]">
              DC-DMU • Institutional Registry v2.0
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
