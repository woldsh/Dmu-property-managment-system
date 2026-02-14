'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  FiUser,
  FiUsers,
  FiShield,
  FiZap,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiBookOpen,
  FiUserCheck
} from 'react-icons/fi';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    academic: 0,
    admin: 0
  });

  useEffect(() => {
    if (!db) return;
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      const total = snapshot.size;
      const inactive = docs.filter(d => d.status === 'inactive').length;
      const active = total - inactive;
      const academic = docs.filter(d => d.mainRole === 'academic_staff').length;
      const admin = docs.filter(d => d.mainRole === 'admin_staff').length;

      setUserStats({ total, active, inactive, academic, admin });
    }, (error) => {
      console.error('Error listening to user stats:', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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
          <p className="mt-8 text-white font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">{t('establishing_secure_link')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-full pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto space-y-12">
      {/* Welcome Section */}
      <div className="pt-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
              <FiZap className="text-blue-600 text-xs" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('administrative_lead')}</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
              {t('systems_header')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">{t('overview_header')}</span>
            </h2>
            <p className="text-slate-400 font-bold text-lg max-w-xl leading-relaxed">
              {t('admin_overview_desc')}
            </p>
          </div>

        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {[
          { label: t('total_registered'), value: userStats.total.toString(), icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('academic_staff'), value: userStats.academic.toString(), icon: FiBookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: t('admin_staff'), value: userStats.admin.toString(), icon: FiUserCheck, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: t('active_personnel'), value: userStats.active.toString(), icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('deactivated_employee'), value: userStats.inactive.toString(), icon: FiXCircle, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                <stat.icon className="text-2xl" />
              </div>
              <FiTrendingUp className="text-slate-200" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1 italic tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
