'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import {
    FiClipboard, FiCheckCircle, FiClock, FiArrowRight,
    FiCalendar, FiBox, FiDatabase, FiSearch,
    FiPlusCircle, FiLayers, FiAlertCircle, FiBarChart2,
    FiPackage, FiTruck
} from 'react-icons/fi';

export default function WorkspacePage() {
    const { user } = useAuth();
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingRequests: 0,
        totalInventory: 0,
        lowStock: 0,
        processedToday: 0,
    });
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !db) { setLoading(false); return; }

            try {
                const userDoc = await getDoc(doc(db!, 'users', user.uid));
                if (userDoc.exists()) {
                    const d = userDoc.data();
                    setUserRole(d.userRole);
                    setUserName(d.displayName || 'User');
                }

                // Pending requests
                const requestsRef = collection(db!, 'Request_materials');
                const pendingSnap = await getDocs(
                    query(requestsRef, where('status', 'in', [
                        'forwarded_to_team_leader',
                        'approved_by_procurement_team_leader',
                        'approved_by_clerk'
                    ]))
                );

                // Inventory stats
                const materialsSnap = await getDocs(collection(db!, 'materials'));
                let lowCount = 0;
                materialsSnap.docs.forEach(doc => {
                    const qty = Number(doc.data().quantity) || 0;
                    if (qty <= 10) lowCount++;
                });

                setStats({
                    pendingRequests: pendingSnap.size,
                    totalInventory: materialsSnap.size,
                    lowStock: lowCount,
                    processedToday: 0,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const getRoleTitle = () => {
        if (!userRole) return 'Procurement';
        if (userRole === 'procurement_team_leader') return 'Team Leader';
        if (userRole.includes('stock_clerk')) return 'Stock Clerk';
        if (userRole.includes('store_keeper')) return 'Store Keeper';
        return 'Procurement';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-400"></div>
            </div>
        );
    }

    const quickActions = [
        { label: 'View Requests', desc: 'Process material requests', href: '/workspace/view-requests', icon: FiClipboard, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Full Inventory', desc: 'Browse all items', href: '/workspace/full-inventory', icon: FiLayers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Low Stock', desc: 'Items needing restock', href: '/workspace/low-stock', icon: FiAlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Analytics', desc: 'Charts & reports', href: '/workspace/analytics', icon: FiBarChart2, color: 'text-sky-600', bg: 'bg-sky-50' },
        { label: 'Search Material', desc: 'Find specific items', href: '/workspace/search-material', icon: FiSearch, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Receive Goods', desc: 'Log incoming shipments', href: '/workspace/receive-goods', icon: FiTruck, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em] mb-2">
                                {getRoleTitle()} &bull; {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}, {userName.split(' ')[0]}
                            </h1>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <FiClock className="text-lg text-amber-600" />
                                </div>
                                {stats.pendingRequests > 0 && (
                                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                                )}
                            </div>
                            <p className="text-3xl font-black text-slate-900">{stats.pendingRequests}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Pending</p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                                <FiDatabase className="text-lg text-slate-600" />
                            </div>
                            <p className="text-3xl font-black text-slate-900">{stats.totalInventory}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Items</p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                                <FiAlertCircle className="text-lg text-orange-600" />
                            </div>
                            <p className="text-3xl font-black text-slate-900">{stats.lowStock}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Low Stock</p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                                <FiCheckCircle className="text-lg text-blue-600" />
                            </div>
                            <p className="text-3xl font-black text-slate-900">{stats.processedToday}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Processed Today</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-lg font-black text-slate-900 mb-5">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="group flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all"
                                >
                                    <div className={`w-11 h-11 rounded-xl ${action.bg} flex items-center justify-center flex-shrink-0`}>
                                        <action.icon className={`text-xl ${action.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-sm">{action.label}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
                                    </div>
                                    <FiArrowRight className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </ProtectedRoute>
    );
}
