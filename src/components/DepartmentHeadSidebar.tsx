'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { FaChartPie, FaClipboardList, FaEnvelope, FaCheckCircle, FaVideo, FaUserTie, FaTruckLoading, FaUndo, FaCar, FaFileAlt, FaExchangeAlt, FaCog, FaBuilding, FaClock, FaBell } from 'react-icons/fa';
import { useRequestNotification } from '../hooks/useRequestNotification';

export default function DepartmentHeadSidebar() {
    const pathname = usePathname();
    const basePath = '/dashboard';
    const { isOpen, closeSidebar } = useSidebar();
    const { userRole, department } = useAuth();
    const { t } = useLanguage();
    const [meetingInvite, setMeetingInvite] = useState<any>(null);
    const requestCount = useRequestNotification(userRole, department);

    useEffect(() => {
        if (!db) return;
        const unsubscribe = onSnapshot(doc(db!, "meeting_sessions", "current_executive_meeting"), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const role = userRole?.toLowerCase() || '';
                const deptNormalized = (department || '').toLowerCase().replace(/\s+/g, '_');
                const isInvited = data.isPublic || data.invitedRoles.includes(role) || data.invitedRoles.includes(`department_head_${deptNormalized}`);
                if (isInvited) setMeetingInvite(data);
                else setMeetingInvite(null);
            } else {
                setMeetingInvite(null);
            }
        });
        return () => unsubscribe();
    }, [userRole, department]);

    const handleLinkClick = () => {
        if (window.innerWidth < 768) closeSidebar();
    };

    const menuItems = [
        { label: t('dashboard'), href: basePath, icon: FaChartPie },
        { label: t('view_requests'), href: `${basePath}/view-requests`, icon: FaClipboardList },
        { label: t('need_ac'), href: `${basePath}/ac-decision`, icon: FaClock },
        { label: t('messages_ac'), href: `${basePath}/messages-ac`, icon: FaEnvelope },
        { label: t('join_meeting'), href: '/dashboard/meeting', icon: FaVideo },
        { label: t('request_materials'), href: `${basePath}/request-material`, icon: FaUserTie },
        { label: t('receive_goods'), href: `${basePath}/receive-goods`, icon: FaTruckLoading },
        { label: t('return_goods'), href: `${basePath}/return-goods`, icon: FaUndo },
        { label: t('request_journey'), href: `${basePath}/request-journey`, icon: FaCar },
        { label: t('clerk_report'), href: `${basePath}/clerk-report`, icon: FaFileAlt },
        { label: t('exchange_report'), href: `${basePath}/exchange-report`, icon: FaExchangeAlt },
    ];

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/70 z-[140] lg:hidden backdrop-blur-lg transition-opacity duration-500" onClick={closeSidebar} />
            )}

            <div className={`fixed lg:sticky top-0 h-screen flex flex-col z-[150] overflow-hidden transition-all duration-500 ease-out
                ${isOpen ? 'w-72 translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:translate-x-0'}`}>

                {/* Ultra Premium Blue/Indigo Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-slate-950 to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-500/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-indigo-500/5 to-transparent" />

                <div className="relative w-80 flex flex-col h-full flex-shrink-0 border-r border-blue-500/10">
                    {/* Header */}
                    <div className="relative p-6 border-b border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10" />
                        <div className="relative flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 animate-pulse transition-opacity duration-500" />
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center shadow-2xl">
                                    <FaBuilding className="text-xl text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight">{t('dept_head')}</h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50" />
                                    <p className="text-xs font-bold text-blue-400/80 uppercase tracking-[0.2em]">{t('academic_staff')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                        <style jsx global>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #3b82f6, #6366f1); border-radius: 10px; }
                            @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                            @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); } 50% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.6); } }
                            .menu-item { animation: slideIn 0.3s ease-out forwards; }
                            .active-glow { animation: glow 2s ease-in-out infinite; }
                        `}</style>

                        {meetingInvite && (
                            <Link
                                href="/dashboard/meeting"
                                className="mb-4 mx-3 p-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg border border-indigo-400/30 flex items-start gap-3 group hover:scale-[1.02] transition-transform"
                                onClick={handleLinkClick}
                            >
                                <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                                    <FaBell className="text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.5 rounded text-white tracking-widest uppercase">{t('from_md_label')}</span>
                                    </div>
                                    <p className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">{t('meeting_invite')}</p>
                                    <p className="text-[11px] text-indigo-100 leading-tight">{t('emergency_session_msg')}</p>
                                </div>
                            </Link>
                        )}

                        {menuItems.map((item, index) => {
                            const isActive = item.href === basePath ? pathname === basePath : pathname?.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <Link key={index} href={item.href} onClick={handleLinkClick} style={{ animationDelay: `${index * 30}ms` }}
                                    className={`menu-item relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
                                        ${isActive ? 'bg-gradient-to-r from-blue-500/20 via-indigo-500/15 to-transparent text-white active-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>

                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300
                                        ${isActive ? 'h-8 bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500 shadow-lg shadow-blue-500/50' : 'h-0'}`} />

                                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                                        ${isActive ? 'bg-gradient-to-br from-blue-500/30 to-indigo-500/20 shadow-lg shadow-blue-500/20' : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-110'}`}>
                                        <Icon className={`text-lg transition-all duration-300 ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-slate-500 group-hover:text-blue-400'}`} />
                                    </div>

                                    <span className={`flex-1 font-medium transition-all duration-300 ${isActive ? 'font-bold' : 'group-hover:translate-x-1'}`}>
                                        {item.label}
                                    </span>

                                    {item.label === t('view_requests') && requestCount > 0 && (
                                        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse">
                                            <span className="text-[10px] font-black text-white">{requestCount}</span>
                                        </div>
                                    )}

                                    <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 ${isActive ? 'opacity-100 translate-x-0' : ''}`}>
                                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="relative p-4 border-t border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent" />
                        <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full opacity-50 blur-sm group-hover:opacity-80 transition-opacity" />
                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center">
                                    <span className="text-sm font-black text-white">DH</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{t('dept_head')}</p>
                                <p className="text-xs text-blue-400/60 truncate italic font-medium tracking-wide">{t('academic_management')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
