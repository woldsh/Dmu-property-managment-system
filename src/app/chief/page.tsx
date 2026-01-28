'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChiefSidebar from '@/components/ChiefSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiShield,
    FiActivity,
    FiCheckCircle,
    FiClock,
    FiTrendingUp,
    FiUsers,
    FiCalendar,
    FiZap,
    FiAlertCircle,
    FiFileText,
    FiLayers,
    FiCheckSquare,
    FiGrid
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';
import { RequestTrendChart, DepartmentPieChart, StatusBarChart } from '@/components/DashboardCharts';

export default function ChiefPage() {
    const { loading: authLoading } = useAuth();
    const { t, language } = useLanguage();
    const [currentTime, setCurrentTime] = useState(new Date());

    const stats = [
        { label: t('total_requests'), value: '154', sub: t('updated_just_now'), icon: FiGrid, color: 'bg-blue-600', textColor: 'text-blue-600', lightColor: 'bg-blue-50' },
        { label: t('pending_requests'), value: '12', sub: t('critical_label'), icon: FiClock, color: 'bg-amber-600', textColor: 'text-amber-600', lightColor: 'bg-amber-50' },
        { label: t('accepted_requests'), value: '138', sub: t('successfully_processed'), icon: FiCheckSquare, color: 'bg-emerald-600', textColor: 'text-emerald-600', lightColor: 'bg-emerald-50' },
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-white flex overflow-hidden">
                {/* Visual accents - White Advanced Theme */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                </div>

                {/* Sidebar */}
                <ChiefSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen relative overflow-y-auto custom-scrollbar">
                    <Header title={t('institution_command')} subtitle={t('chief_executive_overview')} />

                    <main className="flex-1 px-10 py-8 relative z-10">
                        {/* Welcome Hero */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative mb-12"
                        >
                            <div className="relative bg-white border border-slate-100 rounded-[40px] p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 overflow-hidden shadow-sm">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rotate-45 translate-x-32 -translate-y-32" />

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">{t('strategic_control_center')}</span>
                                    </div>
                                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                                        {t('executive_terminal').split(' ')[0]} <span className="text-blue-600 italic">{t('executive_terminal').split(' ')[1]}</span>
                                    </h1>
                                    <p className="text-slate-500 text-lg max-w-xl font-medium">
                                        {t('peak_capacity_msg')}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-5 shadow-sm relative overflow-hidden group">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center transition-transform group-hover:rotate-6">
                                            <FiCalendar size={28} className="text-white" />
                                        </div>
                                        <div className="relative">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('observation_date')}</p>
                                            <p className="text-2xl font-black text-slate-900">{currentTime.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            <p className="text-sm font-black text-blue-600">{currentTime.toLocaleTimeString(language === 'am' ? 'am-ET' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Executive Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 + idx * 0.1 }}
                                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                    className={`group relative p-8 bg-white border border-slate-100 rounded-[32px] overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all shadow-sm`}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -translate-y-16 translate-x-16 rounded-full" />
                                    <div className="relative flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex-1 space-y-4">
                                                <div className={`w-16 h-16 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                                    <stat.icon className="text-3xl text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">{t('healthy')}</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(37,99,235,0.4)]" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.sub}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Executive Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                            {/* Demand Velocity */}
                            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rotate-45 translate-x-32 -translate-y-32" />
                                <div className="relative z-10 flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight lowercase"><span className="uppercase">S</span>ystem <span className="text-blue-600">Demand</span> Velocity</h2>
                                        <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest">Real-time resource flow analytics</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
                                        <FiTrendingUp size={24} />
                                    </div>
                                </div>
                                <RequestTrendChart />
                            </div>

                            {/* Resource Matrix */}
                            <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                                <div className="relative z-10 flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-slate-900 tracking-widest uppercase italic">Allocation</h2>
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <FiPieChart className="text-blue-600" />
                                    </div>
                                </div>
                                <DepartmentPieChart />
                                <div className="mt-8 pt-8 border-t border-slate-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency index</span>
                                        <span className="text-xs font-black text-emerald-600">+12.4%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 w-[94%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Operations and Infrastructure Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                            {/* Operations Feed */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-2 bg-white border border-slate-100 rounded-[40px] p-10 overflow-hidden relative shadow-sm"
                            >
                                <div className="relative z-10 flex items-center justify-between mb-10">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">{t('system_pulse')}</h2>
                                        <p className="text-slate-400 font-medium text-sm mt-1">{t('global_activity_encryption')}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
                                        <FiActivity size={24} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { title: t('secure_executive_session'), time: `12${t('minutes_ago')}`, status: t('active_status'), icon: FiZap, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                                        { title: t('governance_audit_protocol'), time: `1${t('hours_ago')}`, status: t('logged_status'), icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { title: t('cross_node_resource_sync'), time: `4${t('hours_ago')}`, status: t('queued_status'), icon: FiLayers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                    ].map((item, i) => (
                                        <div key={i} className="group flex items-center gap-6 p-6 bg-slate-50 rounded-[24px] border border-slate-100/50 hover:border-blue-100 transition-all hover:bg-white relative overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-blue-500 transition-colors" />
                                            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                                <item.icon size={22} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-slate-900 font-bold tracking-wide">{item.title}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.time}</p>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</p>
                                                </div>
                                            </div>
                                            <button className="p-3 text-slate-400 hover:text-blue-600 transition-colors bg-white rounded-xl border border-slate-100">
                                                <FiActivity size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* System Status */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white border border-slate-100 rounded-[40px] p-10 flex flex-col shadow-sm relative"
                            >
                                <div className="absolute top-0 right-0 p-10 opacity-5">
                                    <FiShield size={120} className="text-slate-900" />
                                </div>
                                <div className="flex items-center justify-between mb-10 relative z-10">
                                    <h2 className="text-xl font-black text-slate-900 tracking-widest uppercase italic">{t('infrastructure')}</h2>
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <FiShield className="text-blue-600" />
                                    </div>
                                </div>
                                <div className="space-y-8 flex-1 relative z-10">
                                    {[
                                        { label: t('strategic_assets'), score: 88, color: 'from-blue-600 to-blue-400' },
                                        { label: t('financial_matrix'), score: 94, color: 'from-indigo-600 to-indigo-400' },
                                        { label: t('core_inventory'), score: 91, color: 'from-slate-600 to-slate-400' },
                                        { label: t('security_layer'), score: 100, color: 'from-emerald-600 to-emerald-400' },
                                    ].map((node, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{node.label}</span>
                                                <span className="text-xs font-black text-slate-900">{node.score}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-[1px]">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${node.score}%` }}
                                                    transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                                                    className={`h-full bg-gradient-to-r ${node.color} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10 p-6 bg-blue-600 rounded-3xl relative group cursor-pointer overflow-hidden text-center">
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-2">{t('primary_authorization')}</p>
                                    <p className="text-white font-black text-xs leading-relaxed uppercase italic">{t('initiate_system_performance_audit')}</p>
                                </div>
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}

