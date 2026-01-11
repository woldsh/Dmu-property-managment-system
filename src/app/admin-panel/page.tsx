'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    FiUsers, FiClipboard, FiCheckCircle,
    FiZap, FiArrowRight, FiCalendar,
    FiSettings, FiMessageSquare,
    FiLayers, FiShield, FiCpu, FiFileText
} from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { isEmployeeRole } from '@/utils/routeConfig';
import { motion } from 'framer-motion';
import EmployeeDashboard from '@/components/EmployeeDashboard';

export default function AdminPanelPage() {
    const { user, userRole } = useAuth();
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        teamRequests: 9,
        teamMembers: 12,
        approved: 18,
        pendingReview: 5
    });
    const [currentTime, setCurrentTime] = useState(new Date());

    const isEmployee = isEmployeeRole(userRole);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !db) { setLoading(false); return; }
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserName(userData.displayName || 'Staff Member');
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 min-h-[60vh] space-y-6">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full"
            />
            <p className="text-orange-500 font-black tracking-[0.3em] uppercase animate-pulse">Initializing Interface</p>
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

    // --- RENDER ADMIN DASHBOARD (Legacy/Team Leader) ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    return (
        <ProtectedRoute>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="min-h-screen pb-12"
            >
                {/* Hero / Header Section */}
                <div className="px-8 py-12 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <motion.div variants={itemVariants} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                <span className="text-xs font-black text-orange-500 uppercase tracking-[0.4em]">
                                    Executive Level Access
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter italic">
                                WELCOME,<br />
                                <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 bg-clip-text text-transparent uppercase">
                                    {userName.split(' ')[0]}
                                </span>
                            </h1>
                            <p className="text-slate-400 font-bold text-lg max-w-xl leading-relaxed">
                                Command center for administrative oversight and high-level team logistics.
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="group flex items-center gap-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] px-8 py-6 shadow-2xl hover:bg-white/10 transition-colors duration-500 border-dashed">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] group-hover:rotate-6 transition-transform">
                                <FiCalendar className="text-4xl text-white" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Temporal Status</p>
                                <p className="text-3xl font-black text-white italic">
                                    {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()}
                                </p>
                                <p className="text-sm font-black text-slate-500">
                                    UTC {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="px-8 space-y-12">
                    {/* Primary Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                label: 'Team Requests',
                                value: stats.teamRequests,
                                icon: FiClipboard,
                                color: 'from-orange-500 to-amber-500',
                                status: 'PENDING'
                            },
                            {
                                label: 'Team Strength',
                                value: stats.teamMembers,
                                icon: FiUsers,
                                color: 'from-teal-400 to-emerald-500',
                                status: 'OPTIMAL'
                            },
                            {
                                label: 'Monthly Approvals',
                                value: stats.approved,
                                icon: FiCheckCircle,
                                color: 'from-blue-500 to-indigo-600',
                                status: '+12% GROWTH'
                            },
                            {
                                label: 'System Efficiency',
                                value: '98%',
                                icon: FiZap,
                                color: 'from-purple-500 to-pink-600',
                                status: 'LEGACY DATA'
                            }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group relative bg-[#0a0a14] rounded-[2rem] border border-white/5 p-8 overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                                <div className="relative z-10 space-y-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        <stat.icon className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <p className="text-4xl font-black text-white italic tracking-tighter">{stat.value}</p>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '70%' }}
                                                className={`h-full bg-gradient-to-r ${stat.color}`}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 tracking-tighter">{stat.status}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Operational Hub */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/5 p-10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-20" />

                        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                            <div className="space-y-2 text-center md:text-left">
                                <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Operational Modules</h2>
                                <p className="text-slate-500 font-bold">Access secondary administrative protocols and communication streams</p>
                            </div>
                            <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/10">
                                <FiCpu className="text-orange-500 text-xl animate-spin-slow" />
                                <span className="text-xs font-black text-white uppercase tracking-widest italic">Core V2.4 Active</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    title: 'Manage Pipeline',
                                    desc: 'Review incoming submissions',
                                    href: '/admin-panel/view-requests',
                                    icon: FiLayers,
                                    color: 'orange'
                                },
                                {
                                    title: 'Resource Order',
                                    desc: 'Initialize material requisition',
                                    href: '/admin-panel/request-material',
                                    icon: FiFileText, // Changed icon for consistency
                                    color: 'emerald'
                                },
                                {
                                    title: 'Comm-Hub',
                                    desc: 'Encrypted message relay',
                                    href: '/admin-panel/messages-md',
                                    icon: FiMessageSquare,
                                    color: 'blue'
                                },
                                {
                                    title: 'Terminal Config',
                                    desc: 'Protocol & identity settings',
                                    href: '/admin-panel/settings',
                                    icon: FiSettings,
                                    color: 'violet'
                                }
                            ].map((action, idx) => (
                                <motion.a
                                    key={idx}
                                    href={action.href}
                                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    className="group p-8 rounded-[2.5rem] bg-black/40 border border-white/5 transition-all duration-300 flex flex-col items-center text-center space-y-4"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-${action.color}-500/10 flex items-center justify-center border border-${action.color}-500/20 group-hover:bg-${action.color}-500 group-hover:scale-110 transition-all duration-500`}>
                                        <action.icon className={`text-2xl text-${action.color}-500 group-hover:text-white transition-colors`} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white uppercase tracking-tight italic group-hover:text-orange-400 transition-colors">{action.title}</h3>
                                        <p className="text-xs font-bold text-slate-500 mt-1">{action.desc}</p>
                                    </div>
                                    <FiArrowRight className="text-slate-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Integrated System Status */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white/[0.02] rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">System Integrity</h3>
                                <div className="px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase">Secure</div>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Network Throughput', val: '99.9%', color: 'from-orange-500 to-amber-500' },
                                    { label: 'Logic Processing', val: '0.4ms', color: 'from-blue-500 to-cyan-500' },
                                    { label: 'Security Protocols', val: 'Level 10', color: 'from-emerald-500 to-teal-500' }
                                ].map((sys, i) => (
                                    <div key={i} className="flex items-center gap-6">
                                        <p className="w-40 text-xs font-black text-slate-500 uppercase tracking-widest">{sys.label}</p>
                                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '90%' }}
                                                className={`h-full bg-gradient-to-r ${sys.color}`}
                                            />
                                        </div>
                                        <p className="w-16 text-right text-xs font-black text-white italic">{sys.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-600/20 to-amber-600/10 rounded-[2.5rem] p-10 border border-orange-500/20 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                            <FiShield className="text-6xl text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-pulse" />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white italic uppercase">Security Verified</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Authorized Access Only</p>
                            </div>
                            <button className="px-8 py-3 bg-white text-black font-black uppercase text-xs rounded-full hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(255,255,255,0.1)]">
                                Protocol Audit
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </ProtectedRoute>
    );
}
