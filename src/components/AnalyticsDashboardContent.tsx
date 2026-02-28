'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import {
    RequestTrendChart,
    DepartmentPieChart,
    StatusBarChart
} from './DashboardCharts';
import { FiPieChart, FiActivity, FiBarChart2, FiTrendingUp } from 'react-icons/fi';

export default function AnalyticsDashboardContent() {
    const [trendData, setTrendData] = useState<any[]>([]);
    const [deptData, setDeptData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingApprovals: 0,
        completedHandouts: 0,
        totalItems: 0,
        lowStock: 0,
        outOfStock: 0,
        expired: 0,
        expiringSoon: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!db) return;

            try {
                // Fetch Requests
                const requestsRef = collection(db, 'Request_materials');
                const q = query(requestsRef, orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Process Requests Trend (Last 7 Days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return {
                        date: d.toISOString().split('T')[0],
                        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                        requests: 0
                    };
                });

                requests.forEach((req: any) => {
                    if (req.createdAt) {
                        const date = req.createdAt.split('T')[0];
                        const dayStat = last7Days.find(d => d.date === date);
                        if (dayStat) {
                            dayStat.requests++;
                        }
                    }
                });
                setTrendData(last7Days);

                // Process Department Data
                const deptMap: { [key: string]: number } = {};
                requests.forEach((req: any) => {
                    const dept = req.department || 'Unknown';
                    deptMap[dept] = (deptMap[dept] || 0) + 1;
                });
                const colors = ['#2563eb', '#4f46e5', '#0ea5e9', '#06b6d4', '#3b82f6'];
                const processedDeptData = Object.entries(deptMap)
                    .map(([name, value], index) => ({
                        name,
                        value: Math.round((value / requests.length) * 100),
                        color: colors[index % colors.length]
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);
                setDeptData(processedDeptData);

                // Process Status Data
                const statusMap: { [key: string]: number } = {
                    'Completed': 0,
                    'Approved': 0,
                    'Pending': 0,
                    'Rejected': 0
                };
                requests.forEach((req: any) => {
                    const s = req.status || '';
                    if (s === 'completed' || s === 'delivered' || s.includes('handout')) statusMap['Completed']++;
                    else if (s.includes('approved')) statusMap['Approved']++;
                    else if (s.includes('rejected')) statusMap['Rejected']++;
                    else statusMap['Pending']++;
                });
                const total = requests.length || 1;
                const processedStatusData = [
                    { name: 'Completed', value: Math.round((statusMap.Completed / total) * 100), color: '#10b981' },
                    { name: 'Approved', value: Math.round((statusMap.Approved / total) * 100), color: '#3b82f6' },
                    { name: 'Pending', value: Math.round((statusMap.Pending / total) * 100), color: '#f59e0b' },
                    { name: 'Rejected', value: Math.round((statusMap.Rejected / total) * 100), color: '#ef4444' }
                ].filter(d => d.value > 0);
                setStatusData(processedStatusData);


                // Fetch Materials (for total items count and stock analysis)
                const materialsRef = collection(db, 'materials');
                const materialsSnap = await getDocs(materialsRef);
                const materials = materialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

                let lowStockCount = 0;
                let outOfStockCount = 0;
                let expiredCount = 0;
                let expiringSoonCount = 0;

                const now = new Date();
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(now.getDate() + 30);

                materials.forEach(m => {
                    const quantity = Number(m.quantity) || 0;
                    const expiryDate = m.expiryDate ? new Date(m.expiryDate) : null;

                    // Stock Levels
                    if (quantity === 0) {
                        outOfStockCount++;
                    } else if (quantity <= 10) {
                        lowStockCount++;
                    }

                    // Expiry Analysis
                    if (expiryDate) {
                        if (expiryDate < now) {
                            expiredCount++;
                        } else if (expiryDate <= thirtyDaysFromNow) {
                            expiringSoonCount++;
                        }
                    }
                });

                // Calculate KPI Stats
                setStats({
                    totalRequests: requests.length,
                    pendingApprovals: requests.filter((r: any) => r.status && r.status.includes('pending')).length,
                    completedHandouts: requests.filter((r: any) => r.status === 'completed').length,
                    totalItems: materialsSnap.size,
                    lowStock: lowStockCount,
                    outOfStock: outOfStockCount,
                    expired: expiredCount,
                    expiringSoon: expiringSoonCount
                });

                setLoading(false);
            } catch (error) {
                console.error("Error fetching analytics data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Institutional Analytics</h1>
                <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">Real-time Performance Metrics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-600">
                        <FiActivity className="text-8xl" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4">
                        <FiActivity />
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalRequests}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Requests</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-amber-600">
                        <FiActivity className="text-8xl" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-4">
                        <FiActivity />
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.pendingApprovals}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Action</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-600">
                        <FiActivity className="text-8xl" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4">
                        <FiActivity />
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.completedHandouts}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Completed Handouts</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-indigo-600">
                        <FiActivity className="text-8xl" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4">
                        <FiActivity />
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalItems}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total SKU Items</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border-l-4 border-l-orange-400">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-orange-600">
                        <FiTrendingUp className="text-8xl" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl mb-4">
                        <FiTrendingUp />
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.lowStock}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Low Stock Alerts</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border-l-4 border-l-red-500">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-red-600">
                        <FiActivity className="text-8xl" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl mb-4">
                        <FiActivity />
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.outOfStock}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Out of Stock</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border-l-4 border-l-rose-600">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-rose-600">
                        <FiActivity className="text-8xl" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-4">
                        <FiActivity />
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.expired}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Expired Items</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border-l-4 border-l-yellow-400">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-yellow-600">
                        <FiActivity className="text-8xl" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center text-xl mb-4">
                        <FiActivity />
                    </div>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stats.expiringSoon}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Expiring Soon (30d)</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Request Trend */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <FiTrendingUp className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Request Velocity</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Past 7 Days</p>
                        </div>
                    </div>
                    <RequestTrendChart data={trendData} />
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <FiBarChart2 className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Workflow Efficiency</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Request Status Breakdown</p>
                        </div>
                    </div>
                    <StatusBarChart data={statusData} />
                </div>

                {/* Department Distribution */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <FiPieChart className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Departmental Usage</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Top Active Departments</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <DepartmentPieChart data={deptData} />
                        <div className="grid grid-cols-2 gap-4">
                            {deptData.map((d, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{d.name}</p>
                                        <p className="text-xs font-medium text-slate-400">{d.value}% of total</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
