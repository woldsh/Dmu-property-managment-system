'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { useLanguage } from '../contexts/LanguageContext';
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

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) closeSidebar();
    };

    const menuItems = [
        { label: t('dashboard'), href: '/chief', icon: FaChartPie },
        { label: t('view_requests'), href: `${basePath}/view-requests-md`, icon: FaClipboardList },
        { label: t('approve_send_md'), href: `${basePath}/send-ac-decision`, icon: FaPaperPlane },
        { label: t('request_to_md'), href: `${basePath}/request-material`, icon: FaUserTie },
        { label: t('receive_goods'), href: `${basePath}/receive-goods`, icon: FaTruckLoading },
        { label: t('return_goods'), href: `${basePath}/return-goods`, icon: FaUndo },
        { label: t('meeting'), href: `${basePath}/start-meeting`, icon: FaVideo },
        { label: t('request_journey'), href: `${basePath}/request-journey`, icon: FaCar },
        { label: t('clerk_report'), href: `${basePath}/clerk-report`, icon: FaFileAlt },
        { label: t('exchange_report'), href: `${basePath}/exchange-report`, icon: FaExchangeAlt },
        { label: t('set_ac_rules'), href: `${basePath}/set-ac-rules`, icon: FaShieldAlt },
        { label: t('update_ac_rules'), href: `${basePath}/update-ac-rules`, icon: FaShieldAlt },
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
                {/* Background layers - Cyber Sapphire Theme */}
                <div className="absolute inset-0 bg-[#020617]" />
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent opacity-50" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/5 to-transparent" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 blur-[80px] rounded-full" />

                <div className="relative w-[320px] h-full flex flex-col">
                    {/* Chief Header */}
                    <div className="p-8 border-b border-indigo-500/5">
                        <div className="flex items-center gap-5">
                            <div className="relative group">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                                    className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"
                                />
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-400/20">
                                    <FaCrown className="text-2xl text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight uppercase overflow-hidden whitespace-nowrap">
                                    {t('chief_portal')}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                    <p className="text-[10px] font-black text-cyan-500/80 uppercase tracking-[0.3em]">{t('system_overseer')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-scrollbar">
                        <style jsx global>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.4); }
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
                                                ? 'bg-gradient-to-r from-indigo-500/20 via-indigo-500/5 to-transparent text-white border-l-4 border-indigo-500'
                                                : 'text-slate-500 hover:text-white hover:bg-white/5 border-l-4 border-transparent hover:border-indigo-500/30'}`}
                                    >
                                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                                            ${isActive
                                                ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                                                : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-110'}`}>
                                            <Icon className={`text-lg transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                                        </div>

                                        <span className={`flex-1 text-[13px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                                            {item.label}
                                        </span>

                                        <FaChevronRight className={`text-[10px] transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`} />

                                        {/* Animated hover glow */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>

                    {/* Chief Footer */}
                    <div className="p-6 border-t border-indigo-500/5 bg-[#030712]/50 backdrop-blur-xl">
                        <div className="relative group cursor-pointer p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-indigo-500/30 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center border border-white/10">
                                        <span className="text-xs font-black text-white">CH</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-white truncate">{t('institution_head')}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{t('root_access')}</p>
                                    </div>
                                </div>
                                <FaSignOutAlt className="text-slate-500 group-hover:text-red-400 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

