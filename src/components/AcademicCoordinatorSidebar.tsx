'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { FaChartPie, FaClipboardList, FaUserTie, FaEnvelope, FaFileAlt, FaCog, FaGraduationCap, FaVideo, FaTruckLoading, FaUndo, FaCar, FaExchangeAlt, FaGavel, FaBell } from 'react-icons/fa';

export default function AcademicCoordinatorSidebar() {
    const pathname = usePathname();
    const basePath = '/dashboard';

    const { isOpen, closeSidebar } = useSidebar();
    const { userRole } = useAuth();
    const [meetingInvite, setMeetingInvite] = useState<any>(null);

    useEffect(() => {
        if (!db) return;
        const unsubscribe = onSnapshot(doc(db, "meeting_sessions", "current_executive_meeting"), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const role = userRole?.toLowerCase() || '';
                const isInvited = data.isPublic || data.invitedRoles.includes(role) || data.invitedRoles.includes('academic_coordinator');
                if (isInvited) setMeetingInvite(data);
                else setMeetingInvite(null);
            } else {
                setMeetingInvite(null);
            }
        });
        return () => unsubscribe();
    }, [userRole]);

    const handleLinkClick = () => {
        if (window.innerWidth < 768) closeSidebar();
    };

    const menuItems = [
        { label: 'Dashboard', href: basePath, icon: FaChartPie },
        { label: 'View Requests', href: `${basePath}/view-requests`, icon: FaClipboardList },
        { label: 'Commission Review', href: `${basePath}/commission-review`, icon: FaGavel },
        { label: 'Join Meeting', href: '/dashboard/meeting', icon: FaVideo },
        { label: 'View AC Report', href: `${basePath}/ac-report`, icon: FaFileAlt },
        { label: 'Receive Goods', href: `${basePath}/receive-goods`, icon: FaTruckLoading },
        { label: 'Return Goods', href: `${basePath}/return-goods`, icon: FaUndo },
        { label: 'Request Journey', href: `${basePath}/request-journey`, icon: FaCar },
        { label: 'Clerk Report', href: `${basePath}/clerk-report`, icon: FaFileAlt },
        { label: 'Exchange Report', href: `${basePath}/exchange-report`, icon: FaExchangeAlt },
        { label: 'Request Materials', href: `${basePath}/request-material`, icon: FaUserTie },
        { label: 'Messages', href: `${basePath}/messages`, icon: FaEnvelope },
    ];

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md transition-opacity duration-500" onClick={closeSidebar} />
            )}

            <div className={`
                fixed lg:sticky top-0 h-screen flex flex-col z-30 overflow-hidden flex-shrink-0
                transition-all duration-500 ease-out
                ${isOpen ? 'w-80 translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:translate-x-0'}
            `}>
                {/* Ultra Premium Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-900/20 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-lime-500/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-emerald-500/5 to-transparent" />

                <div className="relative w-80 flex flex-col h-full flex-shrink-0 border-r border-lime-500/10">
                    {/* Header with Glow Effect */}
                    <div className="relative p-6 border-b border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 to-emerald-500/5" />
                        <div className="relative flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500 via-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl">
                                    <FaGraduationCap className="text-2xl text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight">Academic Coordinator</h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse shadow-lg shadow-lime-400/50" />
                                    <p className="text-xs font-bold text-lime-400/80 uppercase tracking-[0.2em]">Online</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation with Premium Styling */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                        <style jsx global>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #84cc16, #22c55e); border-radius: 10px; }
                            @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                            @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(132, 204, 22, 0.3); } 50% { box-shadow: 0 0 20px rgba(132, 204, 22, 0.6); } }
                            .menu-item { animation: slideIn 0.3s ease-out forwards; }
                            .active-glow { animation: glow 2s ease-in-out infinite; }
                        `}</style>

                        {meetingInvite && (
                            <Link
                                href="/dashboard/meeting"
                                className="mb-4 mx-3 p-3 bg-gradient-to-r from-lime-600 to-emerald-600 rounded-2xl shadow-lg border border-lime-400/30 flex items-start gap-3 group hover:scale-[1.02] transition-transform"
                                onClick={handleLinkClick}
                            >
                                <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                                    <FaBell className="text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.5 rounded text-white tracking-widest uppercase">From: Managing Director</span>
                                    </div>
                                    <p className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">Meeting Invite</p>
                                    <p className="text-[11px] text-lime-100 leading-tight">Emergency executive session started. Join now!</p>
                                </div>
                            </Link>
                        )}

                        {menuItems.map((item, index) => {
                            const isActive = item.href === basePath ? pathname === basePath : pathname?.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={handleLinkClick}
                                    style={{ animationDelay: `${index * 30}ms` }}
                                    className={`menu-item relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
                                        ${isActive
                                            ? 'bg-gradient-to-r from-lime-500/20 via-emerald-500/15 to-transparent text-white active-glow'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {/* Active Indicator Bar */}
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300
                                        ${isActive ? 'h-8 bg-gradient-to-b from-lime-400 to-emerald-500 shadow-lg shadow-lime-500/50' : 'h-0 bg-transparent'}`}
                                    />

                                    {/* Icon Container with Hover Effect */}
                                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                                        ${isActive
                                            ? 'bg-gradient-to-br from-lime-500/30 to-emerald-500/20 shadow-lg shadow-lime-500/20'
                                            : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-110'
                                        }`}>
                                        <Icon className={`text-lg transition-all duration-300 ${isActive ? 'text-lime-400 drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]' : 'text-slate-500 group-hover:text-lime-400'}`} />
                                    </div>

                                    {/* Label */}
                                    <span className={`flex-1 font-medium transition-all duration-300 ${isActive ? 'font-bold' : 'group-hover:translate-x-1'}`}>
                                        {item.label}
                                    </span>

                                    {/* Hover Arrow */}
                                    <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0
                                        ${isActive ? 'opacity-100 translate-x-0' : ''}`}>
                                        <svg className="w-4 h-4 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>

                                    {/* Hover Background Glow */}
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-lime-500/0 via-lime-500/5 to-lime-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Premium Footer */}
                    <div className="relative p-4 border-t border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-lime-500/5 to-transparent" />
                        <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full opacity-50 blur-sm group-hover:opacity-80 transition-opacity" />
                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center">
                                    <span className="text-sm font-black text-white">AC</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">AC Coordinator</p>
                                <p className="text-xs text-lime-400/60 truncate italic font-medium tracking-wide">Academic Management</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
