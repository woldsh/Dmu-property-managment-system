'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, CheckCircle2, FileText, ClipboardList, LayoutDashboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminTeamLeaderPage() {
    const { user, userRole } = useAuth();
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

        // 1. Snapshot for My Own Requests
        const myRequestsQuery = query(
            collection(db, 'Request_materials'),
            where('requester_id', '==', user.uid)
            // Note: Composite index might be needed for orderBy, keeping generic for now
        );

        // 2. Snapshot for Requests Pending My Approval (Leader Role)
        const pendingForMeQuery = query(
            collection(db, 'Request_materials'),
            where('currentApproverRole', '==', userRole),
            where('status', 'in', ['pending', 'pending_department_leader'])
        );

        const unsub1 = onSnapshot(myRequestsQuery, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const myCount = docs.length;
            const completedCount = docs.filter((d: any) => d.status === 'completed').length;

            setStats(prev => ({
                ...prev,
                myRequests: myCount,
                completed: completedCount
            }));

            // Sort by createdAt client-side to avoid index issues if possible, or just slice
            const sorted = docs.sort((a: any, b: any) => {
                return (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0);
            });

            setRecentRequests(sorted.slice(0, 5));
            setLoading(false);
        });

        const unsub2 = onSnapshot(pendingForMeQuery, (snapshot) => {
            setStats(prev => ({ ...prev, pendingApproval: snapshot.docs.length }));
        });

        return () => {
            unsub1();
            unsub2();
        };
    }, [user?.uid, userRole]);

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {t('leader_dashboard') || 'Leader Dashboard'}
                </h1>
                <p className="text-slate-500 mt-2">
                    {t('operational_command_center') || 'Manage approvals and track your requests.'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title={t('pending_for_me') || 'Pending Approval'}
                    value={stats.pendingApproval}
                    icon={ClipboardList}
                    color="text-amber-600"
                    bg="bg-amber-50"
                    href={userRole === 'admin_leader' ? "/admin-staff/team-leader/approve-decisions" : "#"}
                />
                <StatCard
                    title={t('my_submissions') || 'My Requests'}
                    value={stats.myRequests}
                    icon={FileText}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    href="#"
                />
                <StatCard
                    title={t('fully_handed_out') || 'Completed'}
                    value={stats.completed}
                    icon={CheckCircle2}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    href="#"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800">{t('recent_activity') || 'Recent Requests'}</h2>
                    <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="divide-y divide-slate-100">
                    {recentRequests.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            No recent activity found.
                        </div>
                    ) : (
                        recentRequests.map((req) => (
                            <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-900">
                                            {req.material_details?.[0]?.materialName || 'Request Material'}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {req.requestId || req.id?.slice(0, 8)} • {req.created_at?.toDate ? new Date(req.created_at.toDate()).toLocaleDateString() : 'Just now'}
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
