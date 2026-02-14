'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { FiUser, FiShield, FiMail, FiMapPin, FiActivity, FiLock, FiCheckCircle, FiAlertCircle, FiEdit2 } from 'react-icons/fi';
import ChangePasswordModal from './ChangePasswordModal';
import EditProfileModal from './EditProfileModal';
import UpdateEmailModal from './UpdateEmailModal';

export default function ManageAccount() {
    const { t } = useLanguage();
    const { user, userRole, department } = useAuth();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/60 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-[100px]"></div>

                <div className="relative z-10 flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                        <FiActivity className="animate-pulse" /> {t('account_management')}
                    </div>
                    <h2 className="text-5xl font-black text-slate-800 tracking-tight leading-none italic uppercase">
                        {t('manage_account')}
                    </h2>
                    <p className="text-slate-500 font-bold mt-4 uppercase text-[10px] tracking-[0.4em] opacity-60">
                        {t('personal_security_settings')}
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-4 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative p-8 flex flex-col items-center text-center group"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black text-indigo-500">{user?.email?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-lg">
                                <FiUser className="text-indigo-600" />
                            </div>
                        </div>

                        <div className="space-y-4 w-full">
                            <div className="relative">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user?.displayName || 'User'}</h3>
                                <button
                                    onClick={() => setShowProfileModal(true)}
                                    className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    <FiEdit2 size={16} />
                                </button>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('profile_overview')}</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2">
                                <span className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <FiMapPin /> {department || 'General'}
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <FiShield /> {userRole?.replace('_', ' ') || 'Staff'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Settings Panel */}
                <div className="lg:col-span-8 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <FiLock className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t('security')}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t('password_auth')}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Password Section */}
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">{t('password')}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{t('last_changed_know')}</p>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-lg active:scale-95"
                                >
                                    {t('update_password')}
                                </button>
                            </div>

                            {/* Email Section */}
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">{t('email_address_label')}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit">
                                            <FiCheckCircle size={12} /> {t('verified')}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEmailModal(true)}
                                    className="px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-lg active:scale-95"
                                >
                                    {t('change_email')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
            <EditProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
            <UpdateEmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} />
        </div>
    );
}
