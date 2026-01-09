'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FiUsers, FiClipboard, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight, FiCalendar, FiZap, FiTarget, FiFileText, FiSettings, FiMessageSquare } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import { isEmployeeRole } from '@/utils/routeConfig';

export default function AdminPanelPage() {
    const { user, userRole } = useAuth();
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ teamRequests: 9, teamMembers: 12, approved: 18, pendingReview: 5, personalRequests: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());

    const isEmployee = isEmployeeRole(userRole);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !db) { setLoading(false); return; }
            try {
                if (!db) return;
                const userDoc = await getDoc(doc(db!, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserName(userData.displayName || 'User');
                }

                // If employee, fetch personal stats
                if (isEmployee) {
                    const requestsRef = collection(db!, 'Request_materials');
                    const q = query(requestsRef, where('requesterId', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    setStats(prev => ({ ...prev, personalRequests: querySnapshot.size }));
                }
            } catch (error) { console.error('Error:', error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user]);

    if (loading) return (
        <div className="flex items-center justify-center p-12 min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 relative">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 px-8 py-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" />
                                <span className="text-xs font-black text-teal-600 uppercase tracking-[0.2em]">
                                    {isEmployee ? 'Staff Portal' : 'Admin Control Panel'}
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                                {isEmployee ? 'Welcome Back' : 'Welcome'}, <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">{userName.split(' ')[0]}</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg">
                                {isEmployee ? 'Access your personal workspace and requisitions' : 'Manage team operations and administrative tasks'}
                            </p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl px-6 py-4 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                    <FiCalendar className="text-2xl text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Today</p>
                                    <p className="text-2xl font-black text-slate-800">{currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                    <p className="text-sm font-bold text-teal-600">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 px-8 pb-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="group bg-white rounded-3xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                                    <FiClipboard className="text-2xl text-white" />
                                </div>
                                <p className="text-4xl font-black text-slate-900">{isEmployee ? stats.personalRequests : stats.teamRequests}</p>
                                <p className="text-sm font-bold text-slate-500">{isEmployee ? 'My Requests' : 'Team Requests'}</p>
                                <div className="mt-4 flex items-center gap-2 text-amber-600">
                                    <FiClock className="text-sm animate-pulse" />
                                    <span className="text-xs font-bold">{isEmployee ? 'Track Status' : 'Pending Review'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="group bg-white rounded-3xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                                    <FiUsers className="text-2xl text-white" />
                                </div>
                                <p className="text-4xl font-black text-slate-900">{isEmployee ? 'Active' : stats.teamMembers}</p>
                                <p className="text-sm font-bold text-slate-500">{isEmployee ? 'Staff Status' : 'Team Members'}</p>
                                <div className="mt-4 flex items-center gap-2 text-blue-600">
                                    <FiTrendingUp className="text-sm" />
                                    <span className="text-xs font-bold">{isEmployee ? 'System Online' : 'All Active'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="group bg-white rounded-3xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                                    <FiCheckCircle className="text-2xl text-white" />
                                </div>
                                <p className="text-4xl font-black text-slate-900">{stats.approved}</p>
                                <p className="text-sm font-bold text-slate-500">Approved This Month</p>
                                <div className="mt-4 flex items-center gap-2 text-emerald-600">
                                    <FiTrendingUp className="text-sm" />
                                    <span className="text-xs font-bold">+8% increase</span>
                                </div>
                            </div>
                        </div>
                        <div className="group bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-6 shadow-lg shadow-teal-500/30 hover:-translate-y-1 transition-all overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <FiTarget className="text-2xl text-white" />
                                </div>
                                <p className="text-4xl font-black text-white">95%</p>
                                <p className="text-sm font-bold text-white/80">Team Efficiency</p>
                                <div className="mt-4 flex items-center gap-2 text-white/90">
                                    <FiZap className="text-sm" />
                                    <span className="text-xs font-bold">Excellent</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">{isEmployee ? 'Quick Actions' : 'Admin Actions'}</h2>
                                <p className="text-slate-500 font-medium">{isEmployee ? 'Manage your resources' : 'Team management operations'}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
                                <FiZap className="text-xl text-teal-600" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {isEmployee ? (
                                <a href="/admin-panel/view-requests" className="group flex items-center gap-4 p-5 bg-teal-50 rounded-2xl border-2 border-teal-100 hover:border-teal-300 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <FiClock className="text-xl text-white" />
                                    </div>
                                    <div className="flex-1"><h3 className="font-bold text-slate-900">Track My Requests</h3><p className="text-sm text-slate-500">View status updates</p></div>
                                    <FiArrowRight className="text-xl text-teal-500 group-hover:translate-x-2 transition-transform" />
                                </a>
                            ) : (
                                <a href="/admin-panel/view-requests" className="group flex items-center gap-4 p-5 bg-teal-50 rounded-2xl border-2 border-teal-100 hover:border-teal-300 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <FiClipboard className="text-xl text-white" />
                                    </div>
                                    <div className="flex-1"><h3 className="font-bold text-slate-900">View Team Requests</h3><p className="text-sm text-slate-500">Manage submissions</p></div>
                                    <FiArrowRight className="text-xl text-teal-500 group-hover:translate-x-2 transition-transform" />
                                </a>
                            )}
                            <a href="/admin-panel/request-material" className="group flex items-center gap-4 p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <FiFileText className="text-xl text-white" />
                                </div>
                                <div className="flex-1"><h3 className="font-bold text-slate-900">Request Material</h3><p className="text-sm text-slate-500">New requisition</p></div>
                                <FiArrowRight className="text-xl text-emerald-500 group-hover:translate-x-2 transition-transform" />
                            </a>
                            <a href="/admin-panel/messages-md" className="group flex items-center gap-4 p-5 bg-blue-50 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <FiMessageSquare className="text-xl text-white" />
                                </div>
                                <div className="flex-1"><h3 className="font-bold text-slate-900">Messages</h3><p className="text-sm text-slate-500">Communications</p></div>
                                <FiArrowRight className="text-xl text-blue-500 group-hover:translate-x-2 transition-transform" />
                            </a>
                            <a href="/admin-panel/settings" className="group flex items-center gap-4 p-5 bg-cyan-50 rounded-2xl border-2 border-cyan-100 hover:border-cyan-300 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <FiSettings className="text-xl text-white" />
                                </div>
                                <div className="flex-1"><h3 className="font-bold text-slate-900">Settings</h3><p className="text-sm text-slate-500">Configure options</p></div>
                                <FiArrowRight className="text-xl text-cyan-500 group-hover:translate-x-2 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
