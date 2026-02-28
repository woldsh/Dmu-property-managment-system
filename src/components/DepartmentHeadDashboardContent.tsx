'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, CheckCircle2, FileText, ClipboardList, ArrowRight, LayoutDashboard, Box, Truck, RotateCcw, Car } from 'lucide-react';
import Link from 'next/link';

export default function DepartmentHeadDashboardContent({ userName }: { userName: string }) {
    const { user, userRole, department } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        pendingApproval: 0,
        myRequests: 0,
        completed: 0
    });
    const [recentRequests, setRecentRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid || !userRole || !db) return;

        const fetchData = async () => {
            if (!db) return;
            try {
                // 1. My Requests
                const myRequestsQuery = query(
                    collection(db, 'Request_materials'),
                    where('requesterId', '==', user.uid)
                );

                // 2. Pending Approval (Department Head logic: Needs AC Decision or Approved by Team Leader)
                // Adjust logic as per actual department head responsibilities
                const pendingQuery = query(
                    collection(db, 'Request_materials'),
                    where('status', 'in', ['pending', 'pending_department_leader', 'approved_by_team_leader', 'pending_ac_decision'])
                    // Filter by department if needed: where('department', '==', department)
                );

                const [myRequestsSnap, pendingSnap] = await Promise.all([
                    getDocs(myRequestsQuery),
                    getDocs(pendingQuery)
                ]);

                // Client-side filtering for department if not indexed
                const pendingDocs = pendingSnap.docs.filter(doc => !department || doc.data().department === department);
                const myDocs = myRequestsSnap.docs;

                setStats({
                    pendingApproval: pendingDocs.length,
                    myRequests: myDocs.length,
                    completed: myDocs.filter(d => d.data().status === 'completed').length
                });

                // Recent Requests (My Own + Incoming)
                // For simplicity, showing incoming pending requests as key activity
                const recent = pendingDocs
                    .sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0))
                    .slice(0, 5)
                    .map(d => ({ id: d.id, ...d.data() }));

                setRecentRequests(recent);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Setup real-time listeners for updates (simplified for now)
        const unsubscribe = onSnapshot(collection(db, 'Request_materials'), () => {
            // In a real app, re-run fetch or setup specific listeners
            fetchData();
        });

        return () => unsubscribe();

    }, [user?.uid, userRole, department]);

    if (loading) {
        return (
            <div className="p-8 flex justify-center min-h-screen items-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 bg-slate-50 min-h-screen">
            {/* Header (Sport Leader Style - Clean & Light) */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {t('dashboard')}
                </h1>
                <p className="text-slate-500 mt-2">
                    {department ? `${department} Department Overview` : 'Department Management'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title={t('pending') || 'Pending Operations'}
                    value={stats.pendingApproval}
                    icon={ClipboardList}
                    color="text-amber-600"
                    bg="bg-amber-50"
                    href="/dashboard/view-requests"
                />
                <StatCard
                    title={t('my_submissions') || 'Staff Requests'}
                    value={stats.myRequests}
                    icon={FileText}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    href="/dashboard/request-material"
                />
                <StatCard
                    title={t('fully_handed_out') || 'Completed Actions'}
                    value={stats.completed}
                    icon={CheckCircle2}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                    href="#"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800">{t('activity_label') || 'Incoming Requests'}</h2>
                    <Link href="/dashboard/view-requests" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="divide-y divide-slate-100">
                    {recentRequests.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClipboardList className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">No pending requests requiring attention.</p>
                        </div>
                    ) : (
                        recentRequests.map((req) => (
                            <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-900">
                                            {req.materialName || 'Material Request'}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            ID: {req.id?.slice(0, 8).toUpperCase()} • {req.createdAt?.toDate ? new Date(req.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                    ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                        req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'}`}>
                                    {req.status?.replace(/_/g, ' ') || 'Pending'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Actions Grid (Extra for Dept Heads) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <Link href="/dashboard/request-material" className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group text-center">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Box className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{t('request_materials')}</span>
                </Link>
                <Link href="/dashboard/ac-decision" className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group text-center">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{t('ac_decisions')}</span>
                </Link>
                <Link href="/dashboard/receive-goods" className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group text-center">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Truck className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{t('receive_goods')}</span>
                </Link>
                <Link href="/dashboard/return-goods" className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group text-center">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <RotateCcw className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{t('return_goods')}</span>
                </Link>
            </div>
        </div>
    );
}

// Simple Stat Card Component
function StatCard({ title, value, icon: Icon, color, bg, href }: any) {
    return (
        <Link href={href || '#'} className="block">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${bg} ${color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
