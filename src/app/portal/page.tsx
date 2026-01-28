'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    FiClipboard, FiUsers, FiCheckCircle, FiTrendingUp,
    FiActivity, FiFileText, FiArrowRight, FiCalendar,
    FiPieChart, FiBarChart2, FiGlobe, FiShield, FiZap, FiAward,
    FiTarget, FiLayers, FiCpu, FiTrendingDown, FiClock, FiCheckSquare, FiGrid
} from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { RequestTrendChart, DepartmentPieChart, StatusBarChart } from '@/components/DashboardCharts';

export default function PortalPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingApproval: 0,
        totalDepartments: 5,
        approvedThisMonth: 0,
        totalBudget: 245000
    });
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                if (!db) return;
                const userDocRef = doc(db!, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setUserName(userDoc.data().displayName || 'Director');
                }

                // Fetch pending requests for MD approval
                const requestsRef = collection(db!, 'Request_materials');
                const pendingQuery = query(requestsRef, where('status', '==', 'approved_by_coordinator'));
                const pendingSnap = await getDocs(pendingQuery);

                setStats(prev => ({
                    ...prev,
                    pendingApproval: pendingSnap.size
                }));

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const dashboardStats = [
        { label: t('total_requests'), value: '1,280', sub: t('updated_just_now'), icon: FiGrid, color: 'bg-blue-600' },
        { label: t('pending_requests'), value: '42', sub: t('awaiting_approval_sub'), icon: FiClock, color: 'bg-amber-500' },
        { label: t('accepted_requests'), value: '1,120', sub: t('successfully_processed'), icon: FiCheckSquare, color: 'bg-emerald-600' },
        { label: t('system_health'), value: '98%', sub: t('good'), icon: FiZap, color: 'bg-indigo-600' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
                        Loading Executive Portal...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white">
                <div className="relative z-10">
                    {/* Hero Section */}
                    <div className="px-8 py-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                                    <span className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">
                                        Executive Command Center
                                    </span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                                    Welcome, <span className="text-blue-600">{userName.split(' ')[0]}</span>
                                </h1>
                                <p className="text-slate-500 font-medium text-lg">
                                    Your executive overview and control panel
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-white border border-slate-100 rounded-3xl px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                                            <FiCalendar className="text-2xl text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today</p>
                                            <p className="text-2xl font-black text-slate-900 leading-none mt-1">
                                                {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-sm font-bold text-blue-600 mt-1">
                                                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 space-y-8">
                        {/* Executive Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {dashboardStats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative bg-white rounded-2xl border border-slate-100 p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`w-14 h-14 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                                            <stat.icon className={`text-2xl ${stat.color.replace('bg-', 'text-')}`} />
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className={`w-2 h-2 ${stat.color} rounded-full animate-pulse`} />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Live</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{stat.sub}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Analytical Performance Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Line Chart Card */}
                            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Material Requisition <span className="text-blue-600">Velocity</span></h2>
                                        <p className="text-slate-400 font-medium tracking-tight">Live tracking of request volume trends</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <FiTrendingUp className="text-xl text-blue-600" />
                                    </div>
                                </div>
                                <RequestTrendChart />
                            </div>

                            {/* Status Analysis Card */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Approval <span className="text-emerald-600">Ratio</span></h2>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Current processing status</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                        <FiCheckSquare className="text-lg text-emerald-600" />
                                    </div>
                                </div>
                                <StatusBarChart />
                            </div>
                        </div>

                        {/* Traditional Dashboard Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Executive Actions - Re-styled as part of the grid */}
                            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive <span className="text-indigo-600">Commands</span></h2>
                                        <p className="text-slate-500 font-medium tracking-tight">System control protocols</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                                        <FiCpu className="text-xl text-indigo-600" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a href="/portal/view-requests" className="group flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <FiClipboard className="text-xl text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Review Requests</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">MD Approval</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-slate-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                                    </a>

                                    <a href="/portal/reports" className="group flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <FiBarChart2 className="text-xl text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">View Reports</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Analytics</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-2 transition-all" />
                                    </a>
                                </div>
                            </div>

                            {/* Department Pie Chart Card */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Resource <span className="text-blue-600">Matrix</span></h2>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Departmental allocation</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <FiPieChart className="text-lg text-blue-600" />
                                    </div>
                                </div>
                                <DepartmentPieChart />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
