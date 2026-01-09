'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FiTool, FiClipboard, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight, FiCalendar, FiZap, FiTarget, FiMessageSquare, FiFileText } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

export default function ServicePage() {
    const { user } = useAuth();
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pendingTasks: 6, completedToday: 4, activeTasks: 15 });
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) { setLoading(false); return; }
            try {
                if (!db) return;
                const userDoc = await getDoc(doc(db!, 'users', user.uid));
                if (userDoc.exists()) setUserName(userDoc.data().displayName || 'User');
                const requestsRef = collection(db!, 'Request_materials');
                const pendingSnap = await getDocs(query(requestsRef, where('status', '==', 'approved_by_md')));
                setStats(prev => ({ ...prev, pendingTasks: pendingSnap.size }));
            } catch (error) { console.error('Error:', error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user]);

    if (loading) return (
        <div className="flex items-center justify-center p-12 min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/30 relative">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-400/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="px-8 py-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse" />
                                <span className="text-xs font-black text-violet-600 uppercase tracking-[0.2em]">Service Operations</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                                Hello, <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{userName.split(' ')[0]}</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg">Manage service tasks and material processing</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl px-6 py-4 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
                                    <FiCalendar className="text-2xl text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Today</p>
                                    <p className="text-2xl font-black text-slate-800">{currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                    <p className="text-sm font-bold text-violet-600">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-8 pb-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg mb-4">
                                <FiClock className="text-2xl text-white" />
                            </div>
                            <p className="text-4xl font-black text-slate-900">{stats.pendingTasks}</p>
                            <p className="text-sm font-bold text-slate-500">Pending Tasks</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg mb-4">
                                <FiCheckCircle className="text-2xl text-white" />
                            </div>
                            <p className="text-4xl font-black text-slate-900">{stats.completedToday}</p>
                            <p className="text-sm font-bold text-slate-500">Completed Today</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg mb-4">
                                <FiTool className="text-2xl text-white" />
                            </div>
                            <p className="text-4xl font-black text-slate-900">{stats.activeTasks}</p>
                            <p className="text-sm font-bold text-slate-500">Active Tasks</p>
                        </div>
                        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-3xl p-6 shadow-lg">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                                <FiTarget className="text-2xl text-white" />
                            </div>
                            <p className="text-4xl font-black text-white">92%</p>
                            <p className="text-sm font-bold text-white/80">Task Completion</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-lg">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <a href="/service/view-requests" className="group flex items-center gap-4 p-5 bg-violet-50 rounded-2xl border-2 border-violet-100 hover:border-violet-300 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <FiClipboard className="text-xl text-white" />
                                </div>
                                <div className="flex-1"><h3 className="font-bold text-slate-900">View Requests</h3><p className="text-sm text-slate-500">Process submissions</p></div>
                                <FiArrowRight className="text-xl text-violet-500 group-hover:translate-x-2 transition-transform" />
                            </a>
                            <a href="/service/service-tasks" className="group flex items-center gap-4 p-5 bg-fuchsia-50 rounded-2xl border-2 border-fuchsia-100 hover:border-fuchsia-300 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-fuchsia-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <FiTool className="text-xl text-white" />
                                </div>
                                <div className="flex-1"><h3 className="font-bold text-slate-900">Service Tasks</h3><p className="text-sm text-slate-500">Active jobs</p></div>
                                <FiArrowRight className="text-xl text-fuchsia-500 group-hover:translate-x-2 transition-transform" />
                            </a>
                            <a href="/service/messages" className="group flex items-center gap-4 p-5 bg-pink-50 rounded-2xl border-2 border-pink-100 hover:border-pink-300 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <FiMessageSquare className="text-xl text-white" />
                                </div>
                                <div className="flex-1"><h3 className="font-bold text-slate-900">Messages</h3><p className="text-sm text-slate-500">Communications</p></div>
                                <FiArrowRight className="text-xl text-pink-500 group-hover:translate-x-2 transition-transform" />
                            </a>
                            <a href="/service/reports" className="group flex items-center gap-4 p-5 bg-purple-50 rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <FiFileText className="text-xl text-white" />
                                </div>
                                <div className="flex-1"><h3 className="font-bold text-slate-900">Reports</h3><p className="text-sm text-slate-500">View analytics</p></div>
                                <FiArrowRight className="text-xl text-purple-500 group-hover:translate-x-2 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
