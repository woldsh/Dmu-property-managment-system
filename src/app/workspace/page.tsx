'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    FiPackage, FiTruck, FiCheckCircle, FiClock, FiTrendingUp,
    FiActivity, FiArrowRight, FiCalendar, FiBox,
    FiDatabase, FiLayers, FiZap, FiTarget, FiRefreshCw,
    FiClipboard, FiSearch, FiPlusCircle
} from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

export default function WorkspacePage() {
    const { user } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingRequests: 0,
        processedToday: 0,
        totalInventory: 256,
        pendingReturns: 12
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
                    const userData = userDoc.data();
                    setUserRole(userData.userRole);
                    setUserName(userData.displayName || 'User');
                }

                // Fetch statistics based on role
                const requestsRef = collection(db!, 'Request_materials');
                const pendingQuery = query(requestsRef, where('status', 'in', ['forwarded_to_team_leader', 'approved_by_procurement_team_leader', 'approved_by_clerk']));
                const pendingSnap = await getDocs(pendingQuery);

                setStats(prev => ({
                    ...prev,
                    pendingRequests: pendingSnap.size
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
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading Workspace...
                    </p>
                </div>
            </div>
        );
    }

    const getRoleTitle = () => {
        if (!userRole) return 'Procurement';
        if (userRole === 'procurement_team_leader') return 'Team Leader';
        if (userRole.includes('stock_clerk')) return 'Stock Clerk';
        if (userRole.includes('store_keeper')) return 'Store Keeper';
        return 'Procurement';
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-cyan-950">
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10">
                    {/* Hero Section */}
                    <div className="px-8 py-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-black text-teal-400 uppercase tracking-[0.3em]">
                                        {getRoleTitle()} Control Center
                                    </span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                                    Welcome, <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">{userName.split(' ')[0]}</span>
                                </h1>
                                <p className="text-slate-400 font-medium text-lg">
                                    Manage inventory and process material requests
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                                            <FiCalendar className="text-2xl text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today</p>
                                            <p className="text-2xl font-black text-white">
                                                {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-sm font-bold text-teal-400">
                                                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Pending Requests */}
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
                                        <p className="text-4xl font-black text-white">{stats.pendingRequests}</p>
                                        <p className="text-sm font-bold text-slate-400">Pending Requests</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-amber-400">
                                        <FiClock className="text-sm animate-pulse" />
                                        <span className="text-xs font-bold">Needs Processing</span>
                                    </div>
                                </div>
                            </div>

                            {/* Processed Today */}
                            <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                            <FiCheckCircle className="text-2xl text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-white">8</p>
                                        <p className="text-sm font-bold text-slate-400">Processed Today</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-emerald-400">
                                        <FiTrendingUp className="text-sm" />
                                        <span className="text-xs font-bold">+23% efficiency</span>
                                    </div>
                                </div>
                            </div>

                            {/* Total Inventory */}
                            <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                            <FiDatabase className="text-2xl text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-white">{stats.totalInventory}</p>
                                        <p className="text-sm font-bold text-slate-400">Total Items</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-cyan-400">
                                        <FiBox className="text-sm" />
                                        <span className="text-xs font-bold">In Stock</span>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Card */}
                            <div className="group relative bg-gradient-to-br from-teal-600 to-cyan-700 rounded-3xl p-6 shadow-lg shadow-teal-500/30 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
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
                                        <p className="text-4xl font-black text-white">97%</p>
                                        <p className="text-sm font-bold text-white/80">Fulfillment Rate</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-white/90">
                                        <FiZap className="text-sm" />
                                        <span className="text-xs font-bold">Excellent</span>
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
                                        <h2 className="text-2xl font-black text-white">Quick Actions</h2>
                                        <p className="text-slate-400 font-medium">Frequently used operations</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                                        <FiZap className="text-xl text-teal-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a href="/workspace/view-requests" className="group flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-teal-500/50 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                                            <FiClipboard className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors">View Requests</h3>
                                            <p className="text-sm text-slate-500">Process material requests</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-teal-400 group-hover:translate-x-2 transition-transform" />
                                    </a>

                                    <a href="/workspace/add-items" className="group flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                            <FiPlusCircle className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">Add Items</h3>
                                            <p className="text-sm text-slate-500">Register new materials</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-emerald-400 group-hover:translate-x-2 transition-transform" />
                                    </a>

                                    <a href="/workspace/materials-list" className="group flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                                            <FiLayers className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">Materials List</h3>
                                            <p className="text-sm text-slate-500">View all inventory</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-cyan-400 group-hover:translate-x-2 transition-transform" />
                                    </a>

                                    <a href="/workspace/search-material" className="group flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                                            <FiSearch className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors">Search Material</h3>
                                            <p className="text-sm text-slate-500">Find specific items</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-violet-400 group-hover:translate-x-2 transition-transform" />
                                    </a>
                                </div>
                            </div>

                            {/* Inventory Overview */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-black text-white">Inventory</h2>
                                        <p className="text-slate-400 font-medium text-sm">Stock levels</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <FiPackage className="text-lg text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { name: 'Fixed Assets', count: 128, color: 'teal' },
                                        { name: 'Consumables', count: 89, color: 'cyan' },
                                        { name: 'Equipment', count: 34, color: 'emerald' },
                                        { name: 'Supplies', count: 5, color: 'amber' }
                                    ].map((item) => (
                                        <div key={item.name} className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full bg-${item.color}-400`} />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-slate-300">{item.name}</span>
                                                    <span className="text-sm font-black text-white">{item.count}</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full`}
                                                        style={{ width: `${(item.count / 150) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-400">Low Stock Alert</span>
                                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-black rounded-full">3 Items</span>
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
