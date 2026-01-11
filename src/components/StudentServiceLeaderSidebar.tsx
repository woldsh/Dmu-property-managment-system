'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useRequestNotification } from '../hooks/useRequestNotification';
import { FaChartPie, FaUsers, FaEnvelope, FaUserTie, FaTruckLoading, FaUndo, FaCar, FaFileAlt, FaUserGraduate, FaBox } from 'react-icons/fa';

export default function StudentServiceLeaderSidebar() {
    const pathname = usePathname();
    const basePath = '/admin-staff/team-leader';
    const { isOpen, closeSidebar } = useSidebar();
    const { t } = useLanguage();
    const { userRole } = useAuth();
    const requestCount = useRequestNotification(userRole, undefined);

    const handleLinkClick = () => {
        if (window.innerWidth < 768) closeSidebar();
    };

    const menuItems = [
        { label: t('dashboard'), href: basePath, icon: FaChartPie },
        { label: t('view_requests'), href: `${basePath}/view-requests`, icon: FaUsers },
        { label: t('request_materials'), href: `${basePath}/request-material`, icon: FaBox },
        { label: t('clerk_report'), href: `${basePath}/clerk-report`, icon: FaFileAlt },
        { label: t('messages'), href: `${basePath}/messages`, icon: FaEnvelope },
        { label: t('receive_goods'), href: `${basePath}/receive-goods`, icon: FaTruckLoading },
        { label: t('return_goods'), href: `${basePath}/return-goods`, icon: FaUndo },
        { label: t('request_journey'), href: `${basePath}/request-journey`, icon: FaCar },
    ];

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/70 z-[140] lg:hidden backdrop-blur-lg transition-opacity duration-500" onClick={closeSidebar} />
            )}

            <div className={`fixed lg:sticky top-0 h-screen flex flex-col z-[150] overflow-hidden transition-all duration-500 ease-out
                ${isOpen ? 'w-80 translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:translate-x-0'}`}>

                <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-slate-950 to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-500/10 to-transparent" />

                <div className="relative w-80 flex flex-col h-full flex-shrink-0 border-r border-purple-500/10">
                    <div className="relative p-6 border-b border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10" />
                        <div className="relative flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 animate-pulse transition-opacity duration-500" />
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-violet-500 flex items-center justify-center shadow-2xl">
                                    <FaUserGraduate className="text-xl text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight">{t('student_service_leader')}</h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-lg shadow-purple-400/50" />
                                    <p className="text-xs font-bold text-purple-400/80 uppercase tracking-[0.2em]">{t('administration_label')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                        <style jsx global>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #a855f7, #6366f1); border-radius: 10px; }
                            @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                            .menu-item { animation: slideIn 0.3s ease-out forwards; }
                        `}</style>

                        {menuItems.map((item, index) => {
                            const isActive = item.href === basePath ? pathname === basePath : pathname?.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <Link key={index} href={item.href} onClick={handleLinkClick} style={{ animationDelay: `${index * 30}ms` }}
                                    className={`menu-item relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
                                        ${isActive ? 'bg-gradient-to-r from-purple-500/20 via-indigo-500/15 to-transparent text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>

                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300
                                        ${isActive ? 'h-8 bg-gradient-to-b from-purple-400 via-indigo-500 to-violet-500 shadow-lg shadow-purple-500/50' : 'h-0'}`} />

                                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                                        ${isActive ? 'bg-gradient-to-br from-purple-500/30 to-indigo-500/20 shadow-lg shadow-purple-500/20' : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-110'}`}>
                                        <Icon className={`text-lg transition-all duration-300 ${isActive ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-slate-500 group-hover:text-purple-400'}`} />
                                    </div>

                                    <span className={`flex-1 font-medium transition-all duration-300 ${isActive ? 'font-bold' : 'group-hover:translate-x-1'}`}>
                                        {item.label}
                                    </span>

                                    {item.label === t('view_requests') && requestCount > 0 && (
                                        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-pulse">
                                            <span className="text-[10px] font-black text-white">{requestCount}</span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="relative p-4 border-t border-white/5">
                        <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-violet-500 flex items-center justify-center">
                                <span className="text-sm font-black text-white">SS</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{t('student_service_leader')}</p>
                                <p className="text-xs text-purple-400/60 truncate italic font-medium tracking-wide">{t('authorized_access')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
