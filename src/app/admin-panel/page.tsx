'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    Clock, CheckCircle2, Inbox, ClipboardList, Activity, Package,
    Layers, FileText, MessageSquare, Settings
} from 'lucide-react';
import { isEmployeeRole } from '@/utils/routeConfig';
import { motion } from 'framer-motion';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import DashboardStats from '@/components/DashboardStats';
import Link from 'next/link';

export default function AdminPanelPage() {
    const { user, userRole } = useAuth();
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        teamRequests: 0,
        teamMembers: 0,
        approved: 0,
        pendingReview: 0
    });
    const [recentRequests, setRecentRequests] = useState<any[]>([]);

    const isEmployee = isEmployeeRole(userRole);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !db) { setLoading(false); return; }
            try {
                // 1. User Data
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserName(userData.displayName || 'Staff Member');
                }

                // 2. Mock Stats (Replace with real queries if needed or keep existing logic)
                // For now, retaining static/mock logic but fetching if possible
                // Assuming "Team Requests" means pending requests for the team
                const requestsRef = collection(db, 'Request_materials');

                // Example Query: All requests (for demo) or filter by team if logic exists
                // Using basic counts for now to match previous "stats" state source if it was real
                // Previous code had hardcoded stats: teamRequests: 9, etc.
                // We will use real counts if possible, otherwise mock for visual consistence

                const qPending = query(requestsRef, where('status', 'in', ['pending', 'forwarded_to_team_leader']));
                const qApproved = query(requestsRef, where('status', 'in', ['approved', 'completed']));
                const qRecent = query(requestsRef, orderBy('createdAt', 'desc'), limit(5));

                const [snapPending, snapApproved, snapRecent] = await Promise.all([
                    getDocs(qPending),
                    getDocs(qApproved),
                    getDocs(qRecent)
                ]);

                setStats({
                    teamRequests: snapPending.size,
                    teamMembers: 12, // Placeholder or fetch from users collection
                    approved: snapApproved.size,
                    pendingReview: 5 // Placeholder
                });

                setRecentRequests(snapRecent.docs.map(d => ({ id: d.id, ...d.data() })));

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 min-h-screen bg-[#020617] space-y-6">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-emerald-500 font-black tracking-[0.3em] uppercase animate-pulse">Initializing Command Center</p>
        </div>
    );

    // --- RENDER EMPLOYEE DASHBOARD ---
    if (isEmployee) {
        return (
            <ProtectedRoute>
                <EmployeeDashboard userName={userName} />
            </ProtectedRoute>
        );
    }

    // --- RENDER ADMIN DASHBOARD (Team Leader Style) ---
    return (
        <ProtectedRoute>
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
                            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-black">Team Leader</span>
                        </h2>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Operational Command Center</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        <DashboardStats
                            title="Pending Requests"
                            value={stats.teamRequests}
                            subtitle="Requires Approval"
                            icon={ClipboardList}
                            color="solar"
                            delay={0.1}
                        />
                        <DashboardStats
                            title="Team Members"
                            value={stats.teamMembers}
                            subtitle="Active Personnel"
                            icon={CheckCircle2}
                            color="blue"
                            delay={0.2}
                        />
                        <DashboardStats
                            title="Approved"
                            value={stats.approved}
                            subtitle="Monthly Output"
                            icon={Inbox}
                            color="emerald"
                            delay={0.3}
                        />
                        <DashboardStats
                            title="Review Queue"
                            value={stats.pendingReview}
                            subtitle="Awaiting Action"
                            icon={Clock}
                            color="purple"
                            delay={0.4}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Recent Activity / System Live Stream */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-emerald-400" />
                                    <h3 className="text-xl font-black text-white tracking-tight">System Live Stream</h3>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Feed</span>
                            </div>
                            <div className="p-8">
                                {recentRequests.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No active commands logged</p>
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
                                                        <h4 className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                                                            {req.id ? `REQ-${req.id.slice(-6).toUpperCase()}` : 'Request'}
                                                        </h4>
                                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{req.status?.replace(/_/g, ' ')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white font-black text-sm">{req.requesterId ? 'User Request' : 'System'}</p>
                                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                                                        {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleTimeString() : 'Just now'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Operational Modules (Quick Actions Re-styled) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="lg:col-span-4 space-y-4"
                        >
                            <h3 className="text-xl font-black text-white tracking-tight px-4 mb-2">Operational Modules</h3>

                            {[
                                { title: 'Manage Pipeline', subtitle: 'Review Submissions', href: '/admin-panel/view-requests', icon: Layers, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                                { title: 'Resource Order', subtitle: 'Requisition Protocol', href: '/admin-panel/request-material', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                                { title: 'Comm-Hub', subtitle: 'Encrypted Relay', href: '/admin-panel/messages-md', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                                { title: 'Terminal Config', subtitle: 'System Settings', href: '/admin-panel/settings', icon: Settings, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                            ].map((item, idx) => (
                                <Link href={item.href} key={idx} className={`block p-4 rounded-3xl border ${item.border} ${item.bg} hover:brightness-125 transition-all group`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center ${item.color}`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm group-hover:underline decoration-white/30 underline-offset-4">{item.title}</p>
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">{item.subtitle}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </motion.div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
