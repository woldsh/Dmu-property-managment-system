'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import TeacherSidebar from '@/components/TeacherSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import DashboardStats from '@/components/DashboardStats';
import { LayoutGrid, Clock, CheckCircle2, Package, Activity, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeachersPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        completed: 0,
        total: 0
    });
    const [recentRequests, setRecentRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid || !db) return;

        const q = query(
            collection(db, 'Request_materials'),
            where('requester_id', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const pending = docs.filter((d: any) => d.status !== 'completed' && !d.status?.includes('rejected')).length;
            const completed = docs.filter((d: any) => d.status === 'completed').length;
            const approved = docs.filter((d: any) => d.status?.includes('approved') && d.status !== 'completed').length;

            setStats({
                pending,
                approved,
                completed,
                total: docs.length
            });

            setRecentRequests(docs.slice(0, 5));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-[#020617] flex selection:bg-indigo-500/30">
                {/* Background Decoration */}
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-solar-pulse" />
                    <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full" />
                    <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full" />
                </div>

                <TeacherSidebar />

                <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
                    <Header title={t('employee_portal')} subtitle={t('system_oversight')} isDark />

                    <main className="flex-1 px-4 lg:px-8 pb-12 w-full max-w-7xl mx-auto custom-scrollbar overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12"
                        >
                            <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
                                {t('welcome_back')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.displayName?.split(' ')[0]}</span>
                            </h2>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">{t('real_time_inventory_msg')}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            <DashboardStats
                                title={t('active_requests')}
                                value={stats.pending}
                                subtitle={t('awaiting_approval_sub')}
                                icon={Clock}
                                color="purple"
                                delay={0.1}
                            />
                            <DashboardStats
                                title={t('ready_for_pickup')}
                                value={stats.approved}
                                subtitle={t('verified_by_clerk')}
                                icon={Inbox}
                                color="solar"
                                delay={0.2}
                            />
                            <DashboardStats
                                title={t('completed')}
                                value={stats.completed}
                                subtitle={t('items_handed_out')}
                                icon={CheckCircle2}
                                color="emerald"
                                delay={0.3}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Recent Activity Section */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="lg:col-span-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden"
                            >
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-indigo-400" />
                                        <h3 className="text-xl font-black text-white tracking-tight">{t('recent_live_activity')}</h3>
                                    </div>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">{t('view_all_history')}</button>
                                </div>
                                <div className="p-8">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                                            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t('streaming_live_data')}</p>
                                        </div>
                                    ) : recentRequests.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Package className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t('no_recent_requests')}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {recentRequests.map((req, idx) => (
                                                <div key={req.id || idx} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                            <LayoutGrid className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-white font-bold group-hover:text-indigo-400 transition-colors">{req.material_details?.[0]?.materialName || t('material_request')}</h4>
                                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{req.status?.replace(/_/g, ' ')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white font-black text-sm">{req.material_details?.length || 0} {t('items_label')}</p>
                                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                                                            {req.created_at?.toDate ? new Date(req.created_at.toDate()).toLocaleDateString() : t('recent')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Info Card Section */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="lg:col-span-4 space-y-8"
                            >
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                                    <h3 className="text-2xl font-black tracking-tight mb-2">{t('need_help')}</h3>
                                    <p className="text-indigo-100/80 text-sm font-medium leading-relaxed mb-6">{t('support_msg')}</p>
                                    <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-lg">{t('contact_logistics')}</button>
                                </div>

                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8">
                                    <h3 className="text-white font-black tracking-tight mb-6">{t('service_health')}</h3>
                                    <div className="space-y-6">
                                        {[
                                            { label: t('procurement'), status: t('optimal'), color: 'bg-emerald-500' },
                                            { label: t('store_access'), status: t('online'), color: 'bg-emerald-500' },
                                            { label: t('approval_queue'), status: t('moderate'), color: 'bg-amber-500' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{item.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${item.color} shadow-lg shadow-${item.color.split('-')[1]}-500/50`} />
                                                    <span className="text-white text-[10px] font-black uppercase tracking-wider">{item.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
