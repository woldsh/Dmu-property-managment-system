'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    FiClipboard, FiBox, FiCheckCircle, FiClock, FiTrendingUp,
    FiActivity, FiFileText, FiArrowRight, FiCalendar, FiUser,
    FiPackage, FiAlertCircle, FiZap, FiAward
} from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

interface RequestStats {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}

interface RecentActivity {
    id: string;
    action: string;
    material: string;
    status: string;
    time: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<RequestStats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserRole(userData.userRole);
                    setUserName(userData.displayName || 'User');
                }

                // Fetch request statistics
                const requestsRef = collection(db, 'Request_materials');
                const pendingQuery = query(requestsRef, where('requesterId', '==', user.uid), where('status', '==', 'pending'));
                const approvedQuery = query(requestsRef, where('requesterId', '==', user.uid), where('status', 'in', ['approved_by_head', 'approved_by_coordinator', 'approved_by_md']));

                const [pendingSnap, approvedSnap] = await Promise.all([
                    getDocs(pendingQuery),
                    getDocs(approvedQuery)
                ]);

                setStats({
                    pending: pendingSnap.size,
                    approved: approvedSnap.size,
                    rejected: 0,
                    total: pendingSnap.size + approvedSnap.size
                });

            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-lime-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading Dashboard...
                    </p>
                </div>
            </div>
        );
    }

    const greeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-lime-50/30">
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-600/5 via-emerald-600/5 to-teal-600/5" />
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

                    <div className="relative px-8 py-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-lime-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-black text-lime-600 uppercase tracking-[0.2em]">
                                        Live Dashboard
                                    </span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                                    {greeting()}, <span className="bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent">{userName.split(' ')[0]}</span>
                                </h1>
                                <p className="text-slate-500 font-medium text-lg">
                                    Here's your academic overview for today
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl px-6 py-4 shadow-lg shadow-slate-200/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-lime-500/30">
                                            <FiCalendar className="text-2xl text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today</p>
                                            <p className="text-2xl font-black text-slate-800">
                                                {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-sm font-bold text-lime-600">
                                                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Pending Requests Card */}
                        <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-lime-500/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                                        <FiClock className="text-2xl text-white" />
                                    </div>
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black rounded-full uppercase tracking-wider">
                                        Pending
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-4xl font-black text-slate-900">{stats.pending}</p>
                                    <p className="text-sm font-bold text-slate-500">Awaiting Approval</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-amber-600">
                                    <FiActivity className="text-sm animate-pulse" />
                                    <span className="text-xs font-bold">In Progress</span>
                                </div>
                            </div>
                        </div>

                        {/* Approved Card */}
                        <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                                        <FiCheckCircle className="text-2xl text-white" />
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-wider">
                                        Approved
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-4xl font-black text-slate-900">{stats.approved}</p>
                                    <p className="text-sm font-bold text-slate-500">Successfully Processed</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-emerald-600">
                                    <FiTrendingUp className="text-sm" />
                                    <span className="text-xs font-bold">+12% this week</span>
                                </div>
                            </div>
                        </div>

                        {/* Equipment Card */}
                        <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                        <FiPackage className="text-2xl text-white" />
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-full uppercase tracking-wider">
                                        Assets
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-4xl font-black text-slate-900">7</p>
                                    <p className="text-sm font-bold text-slate-500">Assigned Equipment</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-blue-600">
                                    <FiBox className="text-sm" />
                                    <span className="text-xs font-bold">All Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Performance Card */}
                        <div className="group relative bg-gradient-to-br from-lime-500 to-emerald-600 rounded-3xl p-6 shadow-lg shadow-lime-500/30 hover:shadow-xl hover:shadow-lime-500/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <FiAward className="text-2xl text-white" />
                                    </div>
                                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-black rounded-full uppercase tracking-wider backdrop-blur-sm">
                                        Performance
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-4xl font-black text-white">98%</p>
                                    <p className="text-sm font-bold text-white/80">Request Success Rate</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-white/90">
                                    <FiZap className="text-sm" />
                                    <span className="text-xs font-bold">Excellent Standing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Quick Actions */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-8 shadow-lg shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Quick Actions</h2>
                                    <p className="text-slate-500 font-medium">Frequently used operations</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-lime-100 flex items-center justify-center">
                                    <FiZap className="text-xl text-lime-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <a href="/dashboard/request-material" className="group flex items-center gap-4 p-5 bg-gradient-to-r from-lime-50 to-emerald-50 rounded-2xl border-2 border-lime-100 hover:border-lime-300 hover:shadow-lg hover:shadow-lime-500/10 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-lime-500 flex items-center justify-center shadow-lg shadow-lime-500/30 group-hover:scale-110 transition-transform">
                                        <FiFileText className="text-xl text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 group-hover:text-lime-700 transition-colors">Request Material</h3>
                                        <p className="text-sm text-slate-500">Submit new requisition</p>
                                    </div>
                                    <FiArrowRight className="text-xl text-lime-500 group-hover:translate-x-2 transition-transform" />
                                </a>

                                <a href="/dashboard/view-requests" className="group flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                        <FiClipboard className="text-xl text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">View Requests</h3>
                                        <p className="text-sm text-slate-500">Track your submissions</p>
                                    </div>
                                    <FiArrowRight className="text-xl text-blue-500 group-hover:translate-x-2 transition-transform" />
                                </a>

                                <a href="/dashboard/clerk-report" className="group flex items-center gap-4 p-5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                                        <FiFileText className="text-xl text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">View Reports</h3>
                                        <p className="text-sm text-slate-500">Access clerk reports</p>
                                    </div>
                                    <FiArrowRight className="text-xl text-purple-500 group-hover:translate-x-2 transition-transform" />
                                </a>

                                <a href="/dashboard/ac-decision" className="group flex items-center gap-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-100 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                                        <FiAlertCircle className="text-xl text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 group-hover:text-orange-700 transition-colors">AC Decisions</h3>
                                        <p className="text-sm text-slate-500">Pending decisions</p>
                                    </div>
                                    <FiArrowRight className="text-xl text-orange-500 group-hover:translate-x-2 transition-transform" />
                                </a>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-lg shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Activity</h2>
                                    <p className="text-slate-500 font-medium text-sm">Recent updates</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <FiActivity className="text-lg text-slate-600" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <FiCheckCircle className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Request Approved</p>
                                        <p className="text-xs text-slate-500">Your laptop request was approved</p>
                                        <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <FiPackage className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Equipment Assigned</p>
                                        <p className="text-xs text-slate-500">Projector added to your inventory</p>
                                        <p className="text-xs text-slate-400 mt-1">Yesterday</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        <FiClock className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Request Pending</p>
                                        <p className="text-xs text-slate-500">Waiting for coordinator review</p>
                                        <p className="text-xs text-slate-400 mt-1">3 days ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
