'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaChartPie,
    FaClipboardList,
    FaPaperPlane,
    FaUserTie,
    FaTruckLoading,
    FaUndo,
    FaCar,
    FaVideo,
    FaFileAlt,
    FaExchangeAlt,
    FaShieldAlt,
    FaCrown,
    FaChevronRight,
    FaSignOutAlt,
    FaEnvelope
} from 'react-icons/fa';

export default function ChiefSidebar() {
    const pathname = usePathname();
    const basePath = '/portal';
    const { isOpen, closeSidebar } = useSidebar();
    const { t } = useLanguage();
    const { userRole } = useAuth();

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) closeSidebar();
    };

    const menuItems = [
        { label: t('dashboard'), href: '/chief', icon: FaChartPie },
        { label: t('approve_send_md'), href: `${basePath}/send-ac-decision`, icon: FaPaperPlane },
        { label: t('request_to_md'), href: `${basePath}/request-material`, icon: FaUserTie },
        { label: t('receive_goods'), href: `${basePath}/receive-goods`, icon: FaTruckLoading },
        { label: t('return_goods'), href: `${basePath}/return-goods`, icon: FaUndo },
        { label: t('meeting'), href: `${basePath}/start-meeting`, icon: FaVideo },
        { label: t('request_journey'), href: `${basePath}/request-journey`, icon: FaCar },
        { label: t('clerk_report'), href: `${basePath}/clerk-report`, icon: FaFileAlt },
        { label: t('exchange_report'), href: `${basePath}/exchange-report`, icon: FaExchangeAlt },
        { label: t('set_ac_rules'), href: `/chief/set-ac-rules`, icon: FaShieldAlt },
        { label: t('update_ac_rules'), href: `/chief/update-ac-rules`, icon: FaShieldAlt },
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-[140] lg:hidden backdrop-blur-lg transition-opacity duration-500"
                        onClick={closeSidebar}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={false}
                animate={{
                    width: isOpen ? '320px' : '0px',
                    x: isOpen ? 0 : -320
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`fixed lg:sticky top-0 h-screen z-[150] overflow-hidden flex-shrink-0 shadow-2xl relative border-r border-indigo-500/10`}
            >
                {/* White Advanced Background */}
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-white" />

                <div className="relative w-[320px] h-full flex flex-col">
                    {/* Chief Header */}
                    <div className="p-8 border-b border-slate-100">
                        <div className="flex items-center gap-5">
                            <div className="relative group">
                                <div className="relative w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                                    <FaCrown className="text-2xl text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase overflow-hidden whitespace-nowrap">
                                    {t('chief_portal')}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{t('system_overseer')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-scrollbar">
                        <style jsx global>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                        `}</style>

                        {menuItems.map((item, index) => {
                            const isActive = item.href === '/chief' ? pathname === '/chief' : pathname?.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={handleLinkClick}
                                        className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 overflow-hidden
                                            ${isActive
                                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                                                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50 border-l-4 border-transparent hover:border-blue-500/30'}`}
                                    >
                                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                                            ${isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 group-hover:bg-blue-50 group-hover:scale-110'}`}>
                                            <Icon className={`text-lg transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`} />
                                        </div>

                                        <span className={`flex-1 text-[13px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                                            {item.label}
                                        </span>

                                        <FaChevronRight className={`text-[10px] transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`} />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>

                    {/* Chief Footer */}
                    <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                        <div className="relative group cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all">
                            <div className="relative flex items-center gap-4">
                                <div className="relative">
                                    <div className="relative w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                        <span className="text-xs font-black text-white">CH</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate">{t('institution_head')}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{t('root_access')}</p>
                                    </div>
                                </div>
                                <FaSignOutAlt className="text-slate-400 group-hover:text-red-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

