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
    FiTarget, FiLayers, FiCpu
} from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

export default function PortalPage() {
    const { user } = useAuth();
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
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setUserName(userDoc.data().displayName || 'Director');
                }

                // Fetch pending requests for MD approval
                const requestsRef = collection(db, 'Request_materials');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading Executive Portal...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10">
                    {/* Hero Section */}
                    <div className="px-8 py-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">
                                        Executive Command Center
                                    </span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                                    Welcome, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{userName.split(' ')[0]}</span>
                                </h1>
                                <p className="text-slate-400 font-medium text-lg">
                                    Your executive overview and control panel
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                            <FiCalendar className="text-2xl text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today</p>
                                            <p className="text-2xl font-black text-white">
                                                {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-sm font-bold text-indigo-400">
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
                            {/* Pending Approval */}
                            <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                            <FiClipboard className="text-2xl text-white" />
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full">
                                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                            <span className="text-xs font-black text-amber-400 uppercase">Live</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-white">{stats.pendingApproval}</p>
                                        <p className="text-sm font-bold text-slate-400">Pending Approval</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-amber-400">
                                        <FiActivity className="text-sm animate-pulse" />
                                        <span className="text-xs font-bold">Requires Attention</span>
                                    </div>
                                </div>
                            </div>

                            {/* Departments */}
                            <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <FiUsers className="text-2xl text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-white">{stats.totalDepartments}</p>
                                        <p className="text-sm font-bold text-slate-400">Active Departments</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-blue-400">
                                        <FiGlobe className="text-sm" />
                                        <span className="text-xs font-bold">All Systems Active</span>
                                    </div>
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                            <FiPieChart className="text-2xl text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-white">245K</p>
                                        <p className="text-sm font-bold text-slate-400">Budget Allocation</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-emerald-400">
                                        <FiTrendingUp className="text-sm" />
                                        <span className="text-xs font-bold">68% Utilized</span>
                                    </div>
                                </div>
                            </div>

                            {/* Performance */}
                            <div className="group relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-lg shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <FiTarget className="text-2xl text-white" />
                                        </div>
                                        <span className="px-3 py-1 bg-white/20 text-white text-xs font-black rounded-full uppercase tracking-wider backdrop-blur-sm">
                                            KPI
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-white">94%</p>
                                        <p className="text-sm font-bold text-white/80">Efficiency Score</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-white/90">
                                        <FiAward className="text-sm" />
                                        <span className="text-xs font-bold">Top Performer</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Quick Actions */}
                            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">Executive Actions</h2>
                                        <p className="text-slate-400 font-medium">Critical operations at your fingertips</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                        <FiCpu className="text-xl text-indigo-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a href="/portal/view-requests" className="group flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                            <FiClipboard className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">Review Requests</h3>
                                            <p className="text-sm text-slate-500">Approve or reject submissions</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-indigo-400 group-hover:translate-x-2 transition-transform" />
                                    </a>

                                    <a href="/portal/reports" className="group flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                            <FiBarChart2 className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">View Reports</h3>
                                            <p className="text-sm text-slate-500">Analytics & insights</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-emerald-400 group-hover:translate-x-2 transition-transform" />
                                    </a>

                                    <a href="/portal/messages" className="group flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                            <FiFileText className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Messages</h3>
                                            <p className="text-sm text-slate-500">Communications hub</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-blue-400 group-hover:translate-x-2 transition-transform" />
                                    </a>

                                    <a href="/portal/settings" className="group flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                                            <FiShield className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors">System Settings</h3>
                                            <p className="text-sm text-slate-500">Configure policies</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-violet-400 group-hover:translate-x-2 transition-transform" />
                                    </a>
                                </div>
                            </div>

                            {/* Department Overview */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-black text-white">Departments</h2>
                                        <p className="text-slate-400 font-medium text-sm">Request distribution</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <FiLayers className="text-lg text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'IT'].map((dept, idx) => (
                                        <div key={dept} className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-slate-300">{dept}</span>
                                                    <span className="text-xs font-bold text-slate-500">{[45, 32, 28, 22, 18][idx]}%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${[45, 32, 28, 22, 18][idx]}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
