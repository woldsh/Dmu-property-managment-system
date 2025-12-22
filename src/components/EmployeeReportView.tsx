'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
    collection,
    query,
    onSnapshot,
    where,
    getDoc,
    doc,
    getDocs
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
    FiSearch,
    FiUser,
    FiCalendar,
    FiBox,
    FiPackage,
    FiInfo,
    FiActivity,
    FiMail,
    FiTrendingUp,
    FiBarChart2
} from 'react-icons/fi';

interface UserReportHistory {
    status: string;
    user: string;
    timestamp: string;
    note: string;
}

interface UserReport {
    id: string;
    requestId: string;
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    department: string;
    materialId: string;
    materialName: string;
    materialCode: string;
    materialImage?: string;
    quantity: number;
    unit: string;
    materialType: string;
    condition: string;
    withdrawalDate: any;
    status: string;
    processedBy: string;
    processedByName: string;
    createdAt: any;
    history: UserReportHistory[];
}

export default function EmployeeReportView() {
    const { user } = useAuth();
    const [reports, setReports] = useState<UserReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userData, setUserData] = useState<any>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        uniqueUsers: 0
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            }
        };
        fetchUserProfile();
    }, [user]);

    useEffect(() => {
        if (!userData) return;

        // Query all User-Report entries
        const q = query(collection(db, 'User-Report'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reportList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as UserReport[];

            // Sort by withdrawal date (newest first)
            reportList.sort((a, b) => {
                const dateA = a.withdrawalDate?.toDate?.() || new Date(0);
                const dateB = b.withdrawalDate?.toDate?.() || new Date(0);
                return dateB.getTime() - dateA.getTime();
            });

            // Calculate statistics
            const uniqueUsers = new Set(reportList.map(r => r.requesterId)).size;
            const pendingCount = reportList.filter(r => r.status === 'pending').length;
            const completedCount = reportList.filter(r => r.status !== 'pending').length;

            setStats({
                total: reportList.length,
                pending: pendingCount,
                completed: completedCount,
                uniqueUsers: uniqueUsers
            });

            setReports(reportList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData]);

    const filteredReports = reports.filter(r => {
        const matchesSearch =
            r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.requesterEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.department.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    // Group reports by user
    const reportsByUser = filteredReports.reduce((acc, report) => {
        if (!acc[report.requesterId]) {
            acc[report.requesterId] = {
                name: report.requesterName,
                email: report.requesterEmail,
                department: report.department,
                reports: []
            };
        }
        acc[report.requesterId].reports.push(report);
        return acc;
    }, {} as Record<string, { name: string; email: string; department: string; reports: UserReport[] }>);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/10 rounded-full -ml-40 -mb-40 blur-3xl"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4 backdrop-blur-sm">
                        <FiActivity className="animate-pulse" /> Material Usage Analytics
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 mb-6">
                        Employee <span className="text-cyan-200">Material Report</span>
                    </h2>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <FiBarChart2 className="text-2xl text-white" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Total Records</p>
                                    <p className="text-3xl font-black text-white">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/30 flex items-center justify-center">
                                    <FiTrendingUp className="text-2xl text-amber-200" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Pending</p>
                                    <p className="text-3xl font-black text-amber-200">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                                    <FiPackage className="text-2xl text-emerald-200" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Completed</p>
                                    <p className="text-3xl font-black text-emerald-200">{stats.completed}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                                    <FiUser className="text-2xl text-purple-200" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Unique Users</p>
                                    <p className="text-3xl font-black text-purple-200">{stats.uniqueUsers}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="relative group w-full md:w-[28rem]">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors text-xl" />
                    <input
                        type="text"
                        placeholder="Search by name, email, material, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedStatus('all')}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${selectedStatus === 'all'
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setSelectedStatus('pending')}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${selectedStatus === 'pending'
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Pending
                    </button>
                </div>
            </div>

            {/* Reports by User */}
            {Object.keys(reportsByUser).length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-32 text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border-2 border-slate-50 shadow-inner">
                        <FiPackage className="text-5xl" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">No Records Found</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No material usage records match your criteria.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(reportsByUser).map(([userId, userInfo]) => (
                        <div key={userId} className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                            {/* User Header */}
                            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-8 py-6 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                                            <FiUser className="text-3xl text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{userInfo.name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-bold">
                                                    <FiMail className="text-teal-600" />
                                                    {userInfo.email}
                                                </span>
                                                <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider">
                                                    {userInfo.department?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Materials Used</p>
                                        <p className="text-4xl font-black text-teal-600">{userInfo.reports.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Materials List */}
                            <div className="p-6 space-y-3">
                                {userInfo.reports.map((report) => (
                                    <div key={report.id} className="group flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border-2 border-slate-100 hover:bg-white hover:border-teal-200 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-5 flex-1">
                                            <div className="w-14 h-14 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:border-teal-100 transition-colors overflow-hidden">
                                                {report.materialImage ? (
                                                    <img
                                                        src={report.materialImage}
                                                        alt={report.materialName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FiBox className="text-2xl text-teal-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-slate-800 text-lg group-hover:text-teal-700 transition-colors">{report.materialName}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-mono">
                                                        {report.materialCode}
                                                    </span>
                                                    <span className="text-xs font-black bg-teal-100 text-teal-700 px-2.5 py-1 rounded-lg uppercase tracking-tight">
                                                        {report.materialType?.replace('_', ' ')}
                                                    </span>
                                                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg uppercase ${report.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="flex flex-col items-end mb-2">
                                                <span className="text-2xl font-black text-slate-800">{report.quantity}</span>
                                                <span className="text-xs text-slate-400 font-black uppercase tracking-widest">{report.unit}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                                <FiCalendar className="text-teal-500" />
                                                {report.withdrawalDate?.toDate?.()?.toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Card */}
            <div className="mt-12 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-teal-600">
                <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full -mr-60 -mt-60 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-800/20 rounded-full -ml-40 -mb-40 blur-[100px]"></div>

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
                    <div className="w-28 h-28 bg-teal-500/20 rounded-[2.5rem] flex items-center justify-center flex-shrink-0 border-2 border-teal-500/20 shadow-2xl backdrop-blur-xl">
                        <FiInfo className="text-5xl text-teal-400" />
                    </div>
                    <div className="space-y-4">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] border border-teal-500/20">
                            Usage Analytics
                        </div>
                        <h4 className="text-3xl font-black tracking-tighter italic">
                            Employee Material Usage Tracking
                        </h4>
                        <p className="text-slate-400 text-lg font-medium max-w-4xl leading-relaxed opacity-80">
                            This report displays comprehensive material usage data for all employees. Track who is using which materials, monitor pending withdrawals, and analyze usage patterns across departments. Each record includes complete user identification and material details for accurate inventory management.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
