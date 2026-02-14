'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarResizeHandle from './SidebarResizeHandle';
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
    const { isOpen, closeSidebar, sidebarWidth } = useSidebar();
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
                        className="fixed inset-0 bg-black/40 z-[140] lg:hidden backdrop-blur-md transition-opacity duration-500"
                        onClick={closeSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Premium Sidebar */}
            <div
                className={`
                fixed lg:sticky top-0
                h-screen flex flex-col z-[150] overflow-hidden
                transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:border-none'}
            `}
                style={{ width: isOpen ? sidebarWidth : 0 }}
            >
                {/* Ultra Premium White Mesh Gradient */}
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(59,130,246,0.03)_0%,_transparent_50%),radial-gradient(circle_at_80%_80%,_rgba(99,102,241,0.03)_0%,_transparent_50%)]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div
                    className="relative flex flex-col h-full flex-shrink-0 border-r border-slate-200/60 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.03)] selection:bg-blue-50"
                    style={{ width: sidebarWidth }}
                >
                    <SidebarResizeHandle />

                    {/* Header Section */}
                    <div className="relative p-6 pb-5">
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative group/logo cursor-pointer"
                            >
                                <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-400 rounded-2xl blur-xl opacity-10 group-hover/logo:opacity-30 transition-all duration-700" />
                                <div className="relative w-14 h-14 rounded-2xl bg-white shadow-[0_10px_35px_rgb(0,0,0,0.05)] border border-slate-100 flex items-center justify-center transition-all duration-500 group-hover/logo:shadow-blue-500/20 group-hover/logo:border-blue-100">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                                    <FiCpu className="text-2xl text-blue-600 drop-shadow-sm" />
                                </div>
                            </motion.div>

                            <div className="flex flex-col relative">
                                <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic leading-none mb-1.5">
                                    {t('staff_portal')}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping opacity-40" />
                                    </div>
                                    <p className="text-[9px] font-black text-blue-600/60 uppercase tracking-[0.4em] font-mono">System Authorized</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1 custom-scrollbar relative z-10">
                        <style jsx global>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                        `}</style>

                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-1">
                            {menuItems.map((item, index) => {
                                const isActive = item.href === basePath
                                    ? pathname === basePath
                                    : pathname?.startsWith(item.href);

                                const Icon = item.icon;

                                return (
                                    <motion.div key={index} variants={itemVariants}>
                                        {index === menuItems.length - 1 && (
                                            <div className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4 mb-2 flex items-center gap-2">
                                                <div className="h-[1px] flex-1 bg-slate-100" />
                                                {t('settings')}
                                                <div className="h-[1px] flex-1 bg-slate-100" />
                                            </div>
                                        )}
                                        <Link
                                            href={item.href}
                                            onClick={handleLinkClick}
                                            className={`
                                                flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-500 group relative overflow-hidden
                                                ${isActive
                                                    ? 'bg-white shadow-[0_12px_30px_-8px_rgba(37,99,235,0.12)] border border-blue-50 text-blue-600 font-black'
                                                    : 'text-slate-500 hover:text-slate-900 border border-transparent'
                                                }
                                            `}
                                        >
                                            {/* Hover Glow Shine */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                                            {/* Left Active Indicator */}
                                            <div className={`
                                                absolute left-0 top-1/2 -translate-y-1/2 w-1.5 rounded-r-full transition-all duration-500
                                                ${isActive ? 'h-7 bg-blue-600 shadow-[2px_0_12px_rgba(37,99,235,0.4)]' : 'h-0 bg-slate-200 group-hover:h-3'}
                                            `} />

                                            <div className={`
                                                relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500
                                                ${isActive ? 'bg-blue-50 shadow-inner' : 'bg-slate-50 group-hover:bg-blue-50 group-hover:scale-110 group-hover:rotate-2'}
                                            `}>
                                                <Icon className={`
                                                    text-xl transition-all duration-500
                                                    ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 group-hover:text-blue-500'}
                                                `} />
                                            </div>

                                            <span className={`
                                                relative z-10 flex-1 text-sm tracking-tight transition-all duration-300
                                                ${isActive ? 'text-blue-700' : 'font-bold group-hover:translate-x-1'}
                                            `}>
                                                {item.label}
                                            </span>

                                            <div className={`
                                                transition-all duration-500 transform 
                                                ${isActive ? 'opacity-100 translate-x-0 rotate-90 text-blue-500' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}
                                            `}>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </nav>

                    {/* Sidebar Footer Removal */}
                </div>
            </div>
        </>
    );
}
