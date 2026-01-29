'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RegisterUser from '@/components/RegisterUser';
import UserManagement from '@/components/UserManagement';
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
  FiCoffee,
  FiBox
} from 'react-icons/fi';

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'registration' | 'management'>('registration');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userCount, setUserCount] = useState<number | string>('...');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!db) return;
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      setUserCount(snapshot.size);
    }, (error) => {
      console.error('Error listening to user count:', error);
      setUserCount('Error');
    });

    return () => unsubscribe();
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
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-50/50 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-50/30 blur-[80px] rounded-full" />
      </div>

      {/* Minimalism Header */}
      <header className="fixed top-0 left-0 w-full h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 z-50 flex items-center justify-between px-8 lg:px-12">
        <div className="flex items-center gap-6">
          <div className="group cursor-pointer">
            <div className="relative w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-slate-200">
              <FiShield className="text-xl" />
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          <h1 className="font-black text-slate-800 tracking-tighter text-xl uppercase italic hidden md:block">
            DMU-BURIE<span className="text-blue-600">.ADMIN</span>
          </h1>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden lg:flex flex-col items-end">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-0.5">Session ID: 0x{user.uid.slice(0, 4).toUpperCase()}</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs font-black text-slate-700 tracking-tight">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group relative flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-900 text-slate-600 hover:text-white border border-slate-200 hover:border-slate-900 rounded-[1.25rem] transition-all duration-500 text-xs font-black uppercase tracking-widest overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <FiLogOut className="group-hover:-translate-x-1 transition-transform" />
            <span>Terminate Session</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Welcome Section */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                <FiZap className="text-blue-600 text-xs" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Administrative Lead</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                Systems<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">Overview</span>
              </h2>
              <p className="text-slate-400 font-bold text-lg max-w-xl leading-relaxed">
                Management portal for institutional registry, role allocation, and centralized security control.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FiCoffee className="text-2xl text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Uptime Status</p>
                <p className="text-2xl font-black text-slate-800 italic">99.9% ACTIVE</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase mt-0.5 tracking-tighter">Production Environment</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Operational Modules */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setActiveTab('registration')}
              className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] border-2 transition-all duration-500 group ${activeTab === 'registration'
                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-200'
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${activeTab === 'registration' ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                }`}>
                <FiPlusCircle className="text-xl" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">System Module</p>
                <p className="text-sm font-black italic tracking-tight">ENROLL PERSONNEL</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('management')}
              className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] border-2 transition-all duration-500 group ${activeTab === 'management'
                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-200'
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${activeTab === 'management' ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                }`}>
                <FiUsers className="text-xl" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Control Hub</p>
                <p className="text-sm font-black italic tracking-tight">MANAGE DIRECTORY</p>
              </div>
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column - Stats & Identity */}
          <div className="lg:col-span-4 space-y-10">
            {/* Stat Cards */}
            <div className="grid gap-6">
              {[
                { label: 'Active Personnel', value: userCount.toString(), icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      <stat.icon className="text-xl" />
                    </div>
                    <FiTrendingUp className="text-slate-300" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 mt-1 italic tracking-tight">{stat.value}</p>
                </motion.div>
              ))}
            </div>

          </div>

          {/* Right Column - Registration Panel / Management */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {/* Decorative accents for the form container */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50" />

                <div className="relative bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden min-h-[600px]">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

                  <div className="p-8 md:p-12">
                    {activeTab === 'registration' ? (
                      <RegisterUser />
                    ) : (
                      <UserManagement />
                    )}
                  </div>
                </div>

                {/* Console Info Footer */}
                <div className="mt-12 flex items-center justify-between px-8">
                  <div className="flex items-center gap-4">
                    <FiLayers className="text-slate-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Institutional Command Center</p>
                  </div>
                  <div className="h-px flex-1 mx-12 bg-slate-100" />
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Burie Campus • Property Management</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
