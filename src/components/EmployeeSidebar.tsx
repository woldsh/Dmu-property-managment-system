'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPieChart,
    FiUserPlus,
    FiDownloadCloud,
    FiRotateCcw,
    FiTruck,
    FiFileText,
    FiRepeat,
    FiClock,
    FiCpu,
    FiBox
} from 'react-icons/fi';

export default function EmployeeSidebar() {
    const pathname = usePathname();
    const basePath = '/admin-panel';
    const { isOpen, closeSidebar } = useSidebar();
    const { t } = useLanguage();

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    };

    const menuItems = [
        { label: t('dashboard'), href: basePath, icon: FiPieChart },
        { label: t('request_materials'), href: `${basePath}/request-material`, icon: FiBox },
        { label: t('receive_goods'), href: `${basePath}/receive-goods`, icon: FiDownloadCloud },
        { label: t('return_goods'), href: `${basePath}/return-goods`, icon: FiRotateCcw },
        { label: t('request_journey'), href: `${basePath}/request-journey`, icon: FiTruck },
        { label: t('clerk_report'), href: `${basePath}/clerk-report`, icon: FiFileText },
        { label: t('exchange_report'), href: `${basePath}/exchange-report`, icon: FiRepeat },
        { label: t('waiting_ac'), href: `${basePath}/ac-decision`, icon: FiClock },
        { label: t('properties'), href: `/workspace/properties`, icon: FiBox },
    ];

    const containerVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    return (
        <>
            {/* Backdrop Overlay for Mobile - Enhanced Blur */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[140] lg:hidden backdrop-blur-md transition-opacity duration-500"
                        onClick={closeSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Premium Sidebar */}
            <div className={`
                fixed lg:sticky top-0
                bg-[#020205] text-slate-400 h-screen
                flex flex-col border-r border-white/5
                transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                ${isOpen ? 'w-80 translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:translate-x-0 lg:border-none'}
                z-[150] overflow-hidden
            `}>
                <div className="w-80 flex flex-col h-full flex-shrink-0 relative">

                    {/* Abstract Decorative Glows */}
                    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none opacity-30" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full pointer-events-none" />

                    {/* Header Section */}
                    <div className="p-8 pb-10 flex flex-col items-center gap-6 relative z-10">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/10 group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-teal-500/20 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
                            <FiCpu className="text-3xl text-black group-hover:scale-110 transition-transform duration-500" />
                        </motion.div>
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none mb-1">
                                {t('staff_portal')}
                            </h2>
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] opacity-60">System Authorized</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto py-4 px-6 space-y-2 custom-scrollbar relative z-10">
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-1.5">
                            {menuItems.map((item, index) => {
                                const isActive = item.href === basePath
                                    ? pathname === basePath
                                    : pathname?.startsWith(item.href);

                                const Icon = item.icon;

                                return (
                                    <motion.div key={index} variants={itemVariants}>
                                        {index === menuItems.length - 1 && (
                                            <div className="px-5 py-4 text-[10px] font-black text-orange-500/40 uppercase tracking-[0.3em] mt-4">
                                                {t('settings')}
                                            </div>
                                        )}
                                        <Link
                                            href={item.href}
                                            onClick={handleLinkClick}
                                            className={`
                                                    flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                                                    ${isActive
                                                    ? 'bg-white/10 text-white font-black italic border border-white/20 shadow-[0_0_20px_rgba(249,115,22,0.15)] backdrop-blur-md'
                                                    : 'hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'
                                                }
                                                `}
                                        >
                                            {/* Dynamic Glow Line for Active Link */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidebar-active-glow"
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-orange-500 rounded-r-full shadow-[0_0_15px_rgba(249,115,22,0.8)]"
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            )}

                                            <Icon className={`
                                                    relative z-10 text-2xl transition-all duration-300
                                                    ${isActive ? 'text-orange-500 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'text-slate-600 group-hover:text-orange-400 group-hover:scale-110'}
                                                `} />

                                            <span className={`
                                                    relative z-10 flex-1 text-sm uppercase tracking-widest font-black transition-all
                                                    ${isActive ? 'text-white' : 'group-hover:translate-x-1'}
                                                `}>
                                                {item.label}
                                            </span>

                                            {isActive && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="relative z-10 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]"
                                                />
                                            )}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </nav>

                    {/* Sidebar Footer / User Identification */}
                    <div className="p-6 relative z-10">
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-4 flex items-center gap-4 group hover:bg-white/10 transition-all duration-500 border-dashed hover:border-orange-500/30 cursor-pointer">
                            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center border border-white/10 shadow-inner group-hover:rotate-6 transition-transform">
                                <span className="text-xs font-black text-orange-400">EP</span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Authorized Identity</p>
                                <p className="text-sm font-black text-white truncate italic tracking-tight">{t('employee')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
