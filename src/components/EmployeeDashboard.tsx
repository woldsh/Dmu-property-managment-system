'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, Variants } from 'framer-motion';
import {
    FiClipboard, FiCheckCircle, FiClock, FiActivity,
    FiPlusCircle, FiSearch, FiArrowRight, FiBox,
    FiUser, FiCalendar, FiShield, FiTrendingUp
} from 'react-icons/fi';
import Link from 'next/link';

// Animation Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export default function EmployeeDashboard({ userName }: { userName: string }) {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalRequests: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [recentRequests, setRecentRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            if (!user || !db) return;

            try {
                const requestsRef = collection(db, 'Request_materials');
                const q = query(
                    requestsRef,
                    where('requesterId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );

                const snapshot = await getDocs(q);
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Calculate Stats
                const total = docs.length;
                const pending = docs.filter((d: any) =>
                    ['pending', 'forwarded_to_team_leader', 'approved_by_team_leader'].includes(d.status)
                ).length;
                const approved = docs.filter((d: any) =>
                    ['approved', 'completed', 'received'].includes(d.status)
                ).length;
                const rejected = docs.filter((d: any) => d.status === 'rejected').length;

                setStats({ totalRequests: total, pending, approved, rejected });
                setRecentRequests(docs.slice(0, 4)); // Get last 4 requests

            } catch (error) {
                console.error("Error fetching employee data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [user]);

    if (loading) return null; // Parent handles loading or show skeleton here

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen pb-20"
        >
            {/* --- Hero Section --- */}
            <div className="px-8 py-10 relative">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                            </span>
                            <span className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] backdrop-blur-md bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                                Verified Employee
                            </span>
                        </div>

                        <div>
                            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                                WELCOME<span className="text-orange-500">.</span> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-white to-slate-400">
                                    {userName.split(' ')[0]}
                                </span>
                            </h1>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="flex items-center gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-colors duration-500 group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform duration-500">
                            <FiCalendar className="text-3xl text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">Current Session</p>
                            <p className="text-2xl font-black text-white italic">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs font-bold text-slate-500">
                                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="px-8 space-y-10">

                {/* --- Quick Stats Row --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: 'Active Requests', value: stats.pending, icon: FiClock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
                        { label: 'Total Approved', value: stats.approved, icon: FiCheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
                        { label: 'Needs Action', value: stats.rejected, icon: FiActivity, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
                        { label: 'Lifetime Requests', value: stats.totalRequests, icon: FiTrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className={`relative overflow-hidden rounded-3xl p-6 border ${stat.border} ${stat.bg} backdrop-blur-sm transition-all duration-300 group`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className={`text-4xl font-black ${stat.color} mb-1`}>{stat.value}</p>
                                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider">{stat.label}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* --- Quick Actions Grid --- */}
                <div>
                    <motion.h2 variants={itemVariants} className="text-2xl font-black text-white italic uppercase tracking-tight mb-6 flex items-center gap-3">
                        <span className="w-8 h-1 bg-orange-500 rounded-full"></span>
                        Quick Access
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Request Material */}
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="h-full">
                            <Link href="/admin-panel/request-material" className="block h-full relative group overflow-hidden rounded-[2.5rem] bg-[#0F0F16] border border-white/5 p-8 transition-all hover:border-orange-500/50">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/20 rounded-full blur-[50px] group-hover:bg-orange-500/30 transition-colors" />

                                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                    <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-3xl shadow-[0_10px_30px_rgba(249,115,22,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <FiPlusCircle />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white italic uppercase mb-2">New Request</h3>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed">Initiate a new material requisition workflow for approval.</p>
                                    </div>
                                    <div className="flex items-center text-orange-500 font-bold uppercase text-xs tracking-widest gap-2 group-hover:gap-4 transition-all">
                                        Start Now <FiArrowRight />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>

                        {/* View Request History */}
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="h-full">
                            <Link href="/admin-panel/view-requests" className="block h-full relative group overflow-hidden rounded-[2.5rem] bg-[#0F0F16] border border-white/5 p-8 transition-all hover:border-blue-500/50">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[50px] group-hover:bg-blue-500/30 transition-colors" />

                                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                        <FiClipboard />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white italic uppercase mb-2">Track Activity</h3>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed">Monitor the status of your submitted requests in real-time.</p>
                                    </div>
                                    <div className="flex items-center text-blue-500 font-bold uppercase text-xs tracking-widest gap-2 group-hover:gap-4 transition-all">
                                        View History <FiArrowRight />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Inventory/Search Placeholder */}
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="h-full">
                            <Link href="/admin-panel/clerk-report" className="block h-full relative group overflow-hidden rounded-[2.5rem] bg-[#0F0F16] border border-white/5 p-8 transition-all hover:border-emerald-500/50">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-[50px] group-hover:bg-emerald-500/30 transition-colors" />

                                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-[0_10px_30px_rgba(5,150,105,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <FiBox />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white italic uppercase mb-2">My Inventory</h3>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed">Check items currently assigned to your custody.</p>
                                    </div>
                                    <div className="flex items-center text-emerald-500 font-bold uppercase text-xs tracking-widest gap-2 group-hover:gap-4 transition-all">
                                        Check Assets <FiArrowRight />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* --- Recent Activity Feed --- */}
                <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-3">
                            <FiActivity className="text-orange-500" />
                            Recent Activity
                        </h2>
                        <Link href="/admin-panel/view-requests" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {recentRequests.length === 0 ? (
                            <div className="text-center py-10 text-slate-600 italic">No recent activity found.</div>
                        ) : (
                            recentRequests.map((req, i) => (
                                <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 hover:bg-white/5 border border-white/5 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black
                                            ${req.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' :
                                                req.status.includes('rejected') ? 'bg-rose-500/20 text-rose-500' :
                                                    'bg-amber-500/20 text-amber-500'}
                                        `}>
                                            {req.status === 'completed' ? <FiCheckCircle /> : req.status.includes('rejected') ? <FiActivity /> : <FiClock />}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">Request #{req.id.slice(-6).toUpperCase()}</p>
                                            <p className="text-slate-500 text-xs">
                                                {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border
                                            ${req.status === 'completed' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' :
                                                req.status.includes('rejected') ? 'border-rose-500/20 bg-rose-500/10 text-rose-500' :
                                                    'border-amber-500/20 bg-amber-500/10 text-amber-500'}
                                        `}>
                                            {req.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
}
