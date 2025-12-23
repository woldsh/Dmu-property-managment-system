'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
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
    FaCog,
    FaCrown,
    FaShieldAlt
} from 'react-icons/fa';

export default function ChiefSidebar() {
    const pathname = usePathname();
    const basePath = '/portal';
    const { isOpen, closeSidebar } = useSidebar();

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    };

    const menuItems = [
        { label: 'Dashboard', href: basePath, icon: FaChartPie },
        { label: 'View Requests (MD)', href: `${basePath}/view-requests-md`, icon: FaClipboardList },
        { label: 'Send AC Decision (MD)', href: `${basePath}/send-ac-decision`, icon: FaPaperPlane },
        { label: 'Request to MD', href: `${basePath}/request-material`, icon: FaUserTie },
        { label: 'Receive Goods', href: `${basePath}/receive-goods`, icon: FaTruckLoading },
        { label: 'Return Goods', href: `${basePath}/return-goods`, icon: FaUndo },
        { label: 'Start Meeting', href: `${basePath}/start-meeting`, icon: FaVideo },
        { label: 'Request Journey', href: `${basePath}/request-journey`, icon: FaCar },
        { label: 'Clerk Report', href: `${basePath}/clerk-report`, icon: FaFileAlt },
        { label: 'Exchange Report', href: `${basePath}/exchange-report`, icon: FaExchangeAlt },
        { label: 'Set AC Rules', href: `${basePath}/set-ac-rules`, icon: FaShieldAlt },
        { label: 'Update AC Rules', href: `${basePath}/update-ac-rules`, icon: FaShieldAlt },
    ];

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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                            <FaCrown className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Chief Portal</h2>
                            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Executive</p>
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
                                            ? 'bg-gradient-to-r from-amber-600/20 to-orange-600/10 text-amber-400 font-semibold'
                                            : 'hover:bg-slate-900 hover:text-white'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                        )}
                                        <Icon className={`text-lg transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`} />
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
                                <span className="text-xs font-bold text-slate-400">CH</span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">Chief Executive</p>
                                <p className="text-xs text-slate-500 truncate">chief@system</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
