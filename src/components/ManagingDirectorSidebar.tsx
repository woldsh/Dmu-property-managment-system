'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useRequestNotification } from '../hooks/useRequestNotification';
import { FaChartPie, FaClipboardList, FaEnvelope, FaFileAlt, FaCog, FaVideo, FaTruckLoading, FaUndo, FaCar, FaShieldAlt, FaPlusCircle } from 'react-icons/fa';

export default function ManagingDirectorSidebar() {
    const pathname = usePathname();
    const basePath = '/portal';
    const { isOpen, closeSidebar } = useSidebar();
    const { t } = useLanguage();
    const { userRole, department } = useAuth();
    const requestCount = useRequestNotification(userRole, department);

    const handleLinkClick = () => {
        if (window.innerWidth < 768) closeSidebar();
    };

    const menuItems = [
        { label: t('dashboard'), href: basePath, icon: FaChartPie },
        { label: t('view_requests'), href: `${basePath}/view-requests`, icon: FaClipboardList },
        { label: t('request_materials'), href: `${basePath}/request-material`, icon: FaPlusCircle },
        { label: t('receive_goods'), href: `${basePath}/receive-goods`, icon: FaTruckLoading },
        { label: t('return_goods'), href: `${basePath}/return-goods`, icon: FaUndo },
        { label: t('request_journey'), href: `${basePath}/request-journey`, icon: FaCar },
        { label: t('view_ac_report'), href: `${basePath}/reports`, icon: FaFileAlt },
        { label: t('clerk_report'), href: `${basePath}/clerk-report`, icon: FaFileAlt },
        { label: t('messages'), href: `${basePath}/messages`, icon: FaEnvelope },
    ];

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/70 z-[140] lg:hidden backdrop-blur-lg transition-opacity duration-500" onClick={closeSidebar} />
            )}

            <div className={`fixed lg:sticky top-0 h-screen flex flex-col z-[150] overflow-hidden transition-all duration-500 ease-out
                ${isOpen ? 'w-80 translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:translate-x-0'}`}>

                {/* Ultra Premium White Mesh Gradient */}
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(59,130,246,0.05)_0%,_transparent_50%),radial-gradient(circle_at_80%_80%,_rgba(99,102,241,0.05)_0%,_transparent_50%)]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative w-80 flex flex-col h-full flex-shrink-0 border-r border-slate-200 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)] selection:bg-blue-100">
                    {/* Header */}
                    <div className="relative p-7 pb-6">
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />
                        <div className="relative flex items-center gap-4">
                            <div className="relative group/logo cursor-pointer">
                                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 rounded-2xl blur-xl opacity-20 group-hover/logo:opacity-50 transition-all duration-700 scale-90 group-hover/logo:scale-110" />
                                <div className="relative w-14 h-14 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex items-center justify-center transition-all duration-500 group-hover/logo:shadow-blue-500/20 group-hover/logo:-translate-y-1">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                                    <FaShieldAlt className="text-2xl text-blue-600 drop-shadow-sm" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{t('managing_director')}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="relative">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-500 animate-ping opacity-30" />
                                    </div>
                                    <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-[0.3em] font-mono">{t('executive_label')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                        <style jsx global>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; transition: all 0.3s; }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                            @keyframes slideInUp { from { opacity: 0; transform: translateY(15px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                            @keyframes floatBg { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                            .menu-item-premium { animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                        `}</style>

                        {menuItems.map((item, index) => {
                            const isActive = item.href === basePath ? pathname === basePath : pathname?.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <Link key={index} href={item.href} onClick={handleLinkClick} style={{ animationDelay: `${index * 40}ms` }}
                                    className={`menu-item-premium relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group overflow-hidden
                                        ${isActive ? 'bg-white shadow-[0_10px_25px_-5px_rgba(59,130,246,0.12)] border border-blue-100/50 text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>

                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full transition-all duration-500
                                        ${isActive ? 'bg-blue-600 shadow-[2px_0_10px_rgba(37,99,235,0.4)] opacity-100' : 'h-0 opacity-0 group-hover:h-3 group-hover:bg-slate-200 group-hover:opacity-100'}`} />

                                    <div className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-500
                                        ${isActive ? 'bg-blue-50 shadow-inner' : 'bg-slate-50/50 group-hover:bg-blue-50 group-hover:scale-110 group-hover:rotate-3'}`}>
                                        <Icon className={`text-xl transition-all duration-500 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 group-hover:text-blue-500'}`} />
                                    </div>

                                    <span className={`flex-1 text-sm tracking-tight transition-all duration-300 ${isActive ? 'font-black' : 'font-bold group-hover:translate-x-1'}`}>{item.label}</span>

                                    {item.label === t('view_requests') && requestCount > 0 && (
                                        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                            <span className="text-[10px] font-black text-white">{requestCount}</span>
                                        </div>
                                    )}

                                    <div className={`transition-all duration-500 transform ${isActive ? 'rotate-90 text-blue-600' : 'opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0'}`}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>

                                    {/* Hover Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="relative mt-auto p-6 pt-0">
                        <div className="relative flex items-center gap-4 p-5 rounded-[2rem] bg-white shadow-[0_20px_40px_-5px_rgba(0,0,0,0.08)] border-2 border-slate-50 group/footer cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 hover:border-blue-50">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-20 group-hover/footer:opacity-50 transition-opacity" />
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center shadow-xl transition-all duration-500 group-hover/footer:rotate-6 group-hover/footer:scale-110">
                                    <span className="text-lg font-black text-white">MD</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-base font-black text-slate-900 truncate group-hover/footer:text-blue-600 transition-colors">{t('managing_director')}</p>
                                <p className="text-xs text-slate-500 font-extrabold uppercase tracking-[0.2em]">{t('executive_access')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
