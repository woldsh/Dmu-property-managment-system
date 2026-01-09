'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardStats from '@/components/DashboardStats';
import { Clock, CheckCircle2, Inbox, ClipboardList, Activity, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminTeamLeaderPage() {
    const { user, userRole } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        pendingApproval: 0,
        myRequests: 0,
        completed: 0
    });
    const [recentRequests, setRecentRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid || !userRole || !db) return;

        // 1. Snapshot for My Own Requests
        const myRequestsQuery = query(
            collection(db, 'Request_materials'),
            where('requester_id', '==', user.uid)
        );

        // 2. Snapshot for Requests Pending My Approval (Leader Role)
        const pendingForMeQuery = query(
            collection(db, 'Request_materials'),
            where('currentApproverRole', '==', userRole),
            where('status', 'in', ['pending', 'pending_department_leader']) // Adjust as per your logic
        );

        const unsub1 = onSnapshot(myRequestsQuery, (snapshot) => {
            const docs = snapshot.docs.map(doc => doc.data());
            const myCount = docs.length;
            const completedCount = docs.filter((d: any) => d.status === 'completed').length;

            setStats(prev => ({
                ...prev,
                myRequests: myCount,
                completed: completedCount
            }));
            setRecentRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 5));
            setLoading(false);
        });

        const unsub2 = onSnapshot(pendingForMeQuery, (snapshot) => {
            setStats(prev => ({ ...prev, pendingApproval: snapshot.docs.length }));
        });

        return () => {
            unsub1();
            unsub2();
        };
    }, [user?.uid, userRole]);

    return (
        <div className="min-h-full bg-[#020617] p-8 selection:bg-indigo-500/30">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-teal-500/5 blur-[100px] rounded-full" />
            </div>

            <main className="relative z-10 w-full max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
                        {t('leader_dashboard').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-black">{t('leader_dashboard').split(' ')[1] || 'Dashboard'}</span>
                    </h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">{t('operational_command_center')}</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <DashboardStats
                        title={t('pending_for_me')}
                        value={stats.pendingApproval}
                        subtitle={t('staff_approvals')}
                        icon={ClipboardList}
                        color="emerald"
                        delay={0.1}
                    />
                    <DashboardStats
                        title={t('my_submissions')}
                        value={stats.myRequests}
                        subtitle={t('own_supply_needs')}
                        icon={Clock}
                        color="solar"
                        delay={0.2}
                    />
                    <DashboardStats
                        title={t('fully_handed_out')}
                        value={stats.completed}
                        subtitle={t('cycle_complete')}
                        icon={CheckCircle2}
                        color="blue"
                        delay={0.3}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-xl font-black text-white tracking-tight">{t('system_live_stream')}</h3>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">{t('audit_log')}</button>
                        </div>
                        <div className="p-8">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t('tracking_assets')}</p>
                                </div>
                            ) : recentRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t('command_log_empty')}</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {recentRequests.map((req, idx) => (
                                        <div key={req.id || idx} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                                    <ClipboardList className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold group-hover:text-emerald-400 transition-colors">{req.material_details?.[0]?.materialName || t('resource_allocation')}</h4>
                                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{req.status?.replace(/_/g, ' ')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-black text-sm">{req.material_details?.length || 0} {t('sku_label')}</p>
                                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                                                    {req.created_at?.toDate ? new Date(req.created_at.toDate()).toLocaleTimeString() : t('recent')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-4 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-3xl rounded-[2.5rem] border border-emerald-500/20 p-8 shadow-2xl flex flex-col justify-center text-center"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                            <Activity className="w-10 h-10 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">{t('live_efficiency')}</h3>
                        <p className="text-slate-400 font-medium mb-8">{t('peak_performance_msg')}</p>
                        <div className="space-y-4">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '94%' }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/50"
                                />
                            </div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest text-right">94% {t('fulfillment_rate')}</p>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
