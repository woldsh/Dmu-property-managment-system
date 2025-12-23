'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
    FaChartPie,
    FaEye,
    FaEnvelopeOpenText,
    FaUsers,
    FaFileContract,
    FaUserTie,
    FaTruckLoading,
    FaUndo,
    FaCar,
    FaFileAlt,
    FaExchangeAlt,
    FaCog,
    FaClipboardCheck,
    FaClipboardList
} from 'react-icons/fa';

interface StockClerkSidebarProps {
    stockType: 'fixed' | 'consumable';
}

export default function StockClerkSidebar({ stockType }: StockClerkSidebarProps) {
    const pathname = usePathname();
    const isFixed = stockType === 'fixed';
    const basePath = '/workspace';
    const { isOpen, closeSidebar } = useSidebar();
    const { t } = useLanguage();

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    };

    const menuItems = [
        { label: t('dashboard'), href: basePath, icon: FaChartPie },
        { label: t('view_requests'), href: `${basePath}/view-requests-pmt`, icon: FaEye },
        { label: t('messages_pmt'), href: `${basePath}/messages-pmt`, icon: FaEnvelopeOpenText },
        { label: t('employee_data'), href: `${basePath}/employee-data`, icon: FaUsers },
        { label: t('report_data'), href: `${basePath}/report-data`, icon: FaFileContract },
        { label: t('request_materials'), href: `${basePath}/request-md`, icon: FaUserTie },
        { label: t('receive_goods'), href: `${basePath}/receive-goods`, icon: FaTruckLoading },
        { label: t('return_goods'), href: `${basePath}/return-goods`, icon: FaUndo },
        { label: t('request_journey'), href: `${basePath}/request-journey`, icon: FaCar },
        { label: t('exchange_report'), href: `${basePath}/exchange-report`, icon: FaExchangeAlt },
        { label: t('clerk_report'), href: `${basePath}/store-clerk-report`, icon: FaFileAlt },
    ];

    const HeaderIcon = isFixed ? FaClipboardCheck : FaClipboardList;
    const accentColor = isFixed ? 'cyan' : 'teal';

    return (
        <>
            {/* Backdrop Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:sticky top-0
                bg-slate-950 text-slate-300 h-screen
                flex flex-col shadow-2xl border-r border-slate-900
                transition-all duration-300 ease-in-out
                ${isOpen ? 'w-72 translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:translate-x-0 lg:border-none'}
                z-30 overflow-hidden
            `}>
                <div className="w-72 flex flex-col h-full flex-shrink-0">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isFixed ? 'from-cyan-500 to-blue-600' : 'from-cyan-500 to-teal-500'} flex items-center justify-center shadow-lg ${isFixed ? 'shadow-cyan-500/20' : 'shadow-teal-500/20'} text-white`}>
                            <HeaderIcon className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">{t('stock_clerk')}</h2>
                            <p className={`text-xs font-medium ${isFixed ? 'text-cyan-400' : 'text-teal-400'} uppercase tracking-wider`}>
                                {isFixed ? t('fixed_assets') : t('consumable_items')}
                            </p>
                        </div>
                    </div>

                    {/* Scrollable Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                        <style jsx global>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 5px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #334155;
                            border-radius: 10px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #475569;
                        }
                    `}</style>

                        {menuItems.map((item, index) => {
                            const isActive = item.href === basePath
                                ? pathname === basePath
                                : pathname?.startsWith(item.href);

                            const Icon = item.icon;

                            return (
                                <div key={index}>
                                    <Link
                                        href={item.href}
                                        onClick={handleLinkClick}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                            ? `bg-gradient-to-r ${isFixed ? 'from-cyan-600/20 to-blue-600/10 text-cyan-400' : 'from-cyan-600/20 to-teal-600/10 text-teal-400'} font-semibold`
                                            : 'hover:bg-slate-900 hover:text-white'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 ${isFixed ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]'} rounded-r-full`} />
                                        )}
                                        <Icon className={`text-lg transition-colors ${isActive ? (isFixed ? 'text-cyan-400' : 'text-teal-400') : `text-slate-500 group-hover:${isFixed ? 'text-cyan-400' : 'text-teal-400'}`}`} />
                                        <span className="flex-1">{item.label}</span>
                                    </Link>
                                </div>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-900 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                <span className="text-xs font-bold text-slate-400">SC</span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{t('stock_clerk')}</p>
                                <p className="text-xs text-slate-500 truncate">clerk@system</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
