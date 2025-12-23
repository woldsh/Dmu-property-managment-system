'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { FaChartPie, FaClipboardList, FaFileInvoice, FaEnvelope, FaUserTie, FaTruckLoading, FaUndo, FaCar, FaExchangeAlt, FaStore, FaUsers, FaCog, FaTasks, FaLayerGroup } from 'react-icons/fa';

export default function ProcurementTeamLeaderSidebar() {
    const pathname = usePathname();
    const basePath = '/workspace';
    const { isOpen, closeSidebar } = useSidebar();

    const handleLinkClick = () => {
        if (window.innerWidth < 768) closeSidebar();
    };

    const menuItems = [
        { label: 'Dashboard', href: basePath, icon: FaChartPie },
        { label: 'View Requests', href: `${basePath}/view-requests`, icon: FaClipboardList },
        { label: 'Inventory Receipt', href: `${basePath}/inventory-receipt`, icon: FaFileInvoice },
        { label: 'Messages', href: `${basePath}/messages`, icon: FaEnvelope },
        { label: 'Request Materials', href: `${basePath}/request-material`, icon: FaUserTie },
        { label: 'Receive Goods', href: `${basePath}/receive-goods`, icon: FaTruckLoading },
        { label: 'Return Goods', href: `${basePath}/return-goods`, icon: FaUndo },
        { label: 'Request Journey', href: `${basePath}/request-journey`, icon: FaCar },
        { label: 'Exchange Report', href: `${basePath}/exchange-report`, icon: FaExchangeAlt },
        { label: 'Store Report', href: `${basePath}/store-report`, icon: FaStore },
        { label: 'Clerk Report', href: `${basePath}/clerk-report`, icon: FaTasks },
        { label: 'Employee Report', href: `${basePath}/employee-report`, icon: FaUsers },
    ];

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-lg transition-opacity duration-500" onClick={closeSidebar} />
            )}

            <div className={`fixed lg:sticky top-0 h-screen flex flex-col z-30 overflow-hidden transition-all duration-500 ease-out
                ${isOpen ? 'w-80 translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:translate-x-0'}`}>

                {/* Ultra Premium Teal/Cyan Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-teal-950 via-slate-950 to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-teal-500/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-cyan-500/5 to-transparent" />

                <div className="relative w-80 flex flex-col h-full flex-shrink-0 border-r border-teal-500/10">
                    {/* Header */}
                    <div className="relative p-6 border-b border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10" />
                        <div className="relative flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 animate-pulse transition-opacity duration-500" />
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 flex items-center justify-center shadow-2xl">
                                    <FaLayerGroup className="text-xl text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight">Team Leader</h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-lg shadow-teal-400/50" />
                                    <p className="text-xs font-bold text-teal-400/80 uppercase tracking-[0.2em]">Procurement</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                        <style jsx global>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #14b8a6, #06b6d4); border-radius: 10px; }
                            @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                            @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(20, 184, 166, 0.3); } 50% { box-shadow: 0 0 25px rgba(20, 184, 166, 0.6); } }
                            .menu-item { animation: slideIn 0.3s ease-out forwards; }
                            .active-glow { animation: glow 2s ease-in-out infinite; }
                        `}</style>

                        {menuItems.map((item, index) => {
                            const isActive = item.href === basePath ? pathname === basePath : pathname?.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <Link key={index} href={item.href} onClick={handleLinkClick} style={{ animationDelay: `${index * 30}ms` }}
                                    className={`menu-item relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
                                        ${isActive ? 'bg-gradient-to-r from-teal-500/20 via-cyan-500/15 to-transparent text-white active-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>

                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300
                                        ${isActive ? 'h-8 bg-gradient-to-b from-teal-400 via-cyan-500 to-emerald-500 shadow-lg shadow-teal-500/50' : 'h-0'}`} />

                                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                                        ${isActive ? 'bg-gradient-to-br from-teal-500/30 to-cyan-500/20 shadow-lg shadow-teal-500/20' : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-110'}`}>
                                        <Icon className={`text-lg transition-all duration-300 ${isActive ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'text-slate-500 group-hover:text-teal-400'}`} />
                                    </div>

                                    <span className={`flex-1 font-medium transition-all duration-300 ${isActive ? 'font-bold' : 'group-hover:translate-x-1'}`}>{item.label}</span>

                                    <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 ${isActive ? 'opacity-100 translate-x-0' : ''}`}>
                                        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="relative p-4 border-t border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 to-transparent" />
                        <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-full opacity-50 blur-sm group-hover:opacity-80 transition-opacity" />
                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 flex items-center justify-center">
                                    <span className="text-sm font-black text-white">TL</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">Team Leader</p>
                                <p className="text-xs text-teal-400/60 truncate italic font-medium tracking-wide">Procurement Dept</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
