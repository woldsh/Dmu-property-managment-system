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
            <div className="min-h-screen bg-slate-50">
                <div className="relative z-10">
                    {/* Hero Section */}
                    <div className="px-8 py-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-teal-500 rounded-full" />
                                    <span className="text-xs font-black text-teal-600 uppercase tracking-[0.3em]">
                                        {getRoleTitle()} Control Center
                                    </span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                                    Welcome, {userName.split(' ')[0]}
                                </h1>
                                <p className="text-slate-500 font-medium text-lg">
                                    Manage inventory and process material requests
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg">
                                            <FiCalendar className="text-2xl text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today</p>
                                            <p className="text-2xl font-black text-slate-900">
                                                {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-sm font-bold text-teal-600">
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
                            <div className="relative bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg">
                                            <FiClipboard className="text-2xl text-white" />
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                            <span className="text-xs font-black text-amber-600 uppercase">Live</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-slate-900">{stats.pendingRequests}</p>
                                        <p className="text-sm font-bold text-slate-500">Pending Requests</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-amber-600">
                                        <FiClock className="text-sm" />
                                        <span className="text-xs font-bold">Needs Processing</span>
                                    </div>
                                </div>
                            </div>

                            {/* Processed Today */}
                            <div className="relative bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
                                            <FiCheckCircle className="text-2xl text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-slate-900">8</p>
                                        <p className="text-sm font-bold text-slate-500">Processed Today</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-emerald-600">
                                        <FiTrendingUp className="text-sm" />
                                        <span className="text-xs font-bold">+23% efficiency</span>
                                    </div>
                                </div>
                            </div>

                            {/* Total Inventory */}
                            <div className="relative bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-lg">
                                            <FiDatabase className="text-2xl text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-slate-900">{stats.totalInventory}</p>
                                        <p className="text-sm font-bold text-slate-500">Total Items</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-cyan-600">
                                        <FiBox className="text-sm" />
                                        <span className="text-xs font-bold">In Stock</span>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Card */}
                            <div className="relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center">
                                            <FiTarget className="text-2xl text-white" />
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-900 text-xs font-black rounded-full uppercase tracking-wider">
                                            KPI
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-slate-900">97%</p>
                                        <p className="text-sm font-bold text-slate-500">Fulfillment Rate</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-teal-600">
                                        <FiZap className="text-sm" />
                                        <span className="text-xs font-bold">Excellent</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Quick Actions */}
                            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Quick Actions</h2>
                                        <p className="text-slate-500 font-medium">Frequently used operations</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
                                        <FiZap className="text-xl text-teal-600" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a href="/workspace/view-requests" className="group flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-500 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                                            <FiClipboard className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">View Requests</h3>
                                            <p className="text-sm text-slate-500">Process material requests</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-teal-600 group-hover:translate-x-1 transition-transform" />
                                    </a>

                                    <a href="/workspace/add-items" className="group flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-500 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                                            <FiPlusCircle className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Add Items</h3>
                                            <p className="text-sm text-slate-500">Register new materials</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-emerald-600 group-hover:translate-x-1 transition-transform" />
                                    </a>

                                    <a href="/workspace/materials-list" className="group flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-cyan-500 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                                            <FiLayers className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">Materials List</h3>
                                            <p className="text-sm text-slate-500">View all inventory</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-cyan-600 group-hover:translate-x-1 transition-transform" />
                                    </a>

                                    <a href="/workspace/search-material" className="group flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-500 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                                            <FiSearch className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">Search Material</h3>
                                            <p className="text-sm text-slate-500">Find specific items</p>
                                        </div>
                                        <FiArrowRight className="text-xl text-violet-600 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>

                            {/* Inventory Overview */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Inventory</h2>
                                        <p className="text-slate-500 font-medium text-sm">Stock levels</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <FiPackage className="text-lg text-slate-600" />
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
                                            <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                                                    <span className="text-sm font-black text-slate-900">{item.count}</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-${item.color}-500 rounded-full`}
                                                        style={{ width: `${(item.count / 150) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-500">Low Stock Alert</span>
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-black rounded-full">3 Items</span>
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
