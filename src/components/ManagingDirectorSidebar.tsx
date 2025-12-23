'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/SidebarContext';
import { FaChartPie, FaClipboardList, FaEnvelope, FaFileAlt, FaCog, FaVideo, FaTruckLoading, FaUndo, FaCar, FaShieldAlt, FaPlusCircle } from 'react-icons/fa';

export default function ManagingDirectorSidebar() {
    const pathname = usePathname();
    const basePath = '/portal';
    const { isOpen, closeSidebar } = useSidebar();

    const handleLinkClick = () => {
        if (window.innerWidth < 768) closeSidebar();
    };

    const menuItems = [
        { label: 'Dashboard', href: basePath, icon: FaChartPie },
        { label: 'View Requests', href: `${basePath}/view-requests`, icon: FaClipboardList },
        { label: 'Join Meeting', href: `${basePath}/join-meeting`, icon: FaVideo },
        { label: 'Request Materials', href: `${basePath}/request-material`, icon: FaPlusCircle },
        { label: 'Receive Goods', href: `${basePath}/receive-goods`, icon: FaTruckLoading },
        { label: 'Return Goods', href: `${basePath}/return-goods`, icon: FaUndo },
        { label: 'Request Journey', href: `${basePath}/request-journey`, icon: FaCar },
        { label: 'View AC Report', href: `${basePath}/reports`, icon: FaFileAlt },
        { label: 'Clerk Report', href: `${basePath}/clerk-report`, icon: FaFileAlt },
        { label: 'Messages', href: `${basePath}/messages`, icon: FaEnvelope },
    ];

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-lg transition-opacity duration-500" onClick={closeSidebar} />
            )}

            <div className={`fixed lg:sticky top-0 h-screen flex flex-col z-30 overflow-hidden transition-all duration-500 ease-out
                ${isOpen ? 'w-80 translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:translate-x-0'}`}>

                {/* Ultra Premium Dark Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-950 to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-indigo-500/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-purple-500/5 to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />

                <div className="relative w-80 flex flex-col h-full flex-shrink-0 border-r border-indigo-500/10">
                    {/* Header with Glow Effect */}
                    <div className="relative p-6 border-b border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
                        <div className="relative flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 animate-pulse transition-opacity duration-500" />
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                                    <FaShieldAlt className="text-xl text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight">Managing Director</h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-lg shadow-indigo-400/50" />
                                    <p className="text-xs font-bold text-indigo-400/80 uppercase tracking-[0.2em]">Executive</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                        <style jsx global>{`
                            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #6366f1, #a855f7); border-radius: 10px; }
                            @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                            @keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.3); } 50% { box-shadow: 0 0 25px rgba(99, 102, 241, 0.6); } }
                            .menu-item { animation: slideIn 0.3s ease-out forwards; }
                            .active-glow { animation: glow 2s ease-in-out infinite; }
                        `}</style>

                        {menuItems.map((item, index) => {
                            const isActive = item.href === basePath ? pathname === basePath : pathname?.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <Link key={index} href={item.href} onClick={handleLinkClick} style={{ animationDelay: `${index * 30}ms` }}
                                    className={`menu-item relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
                                        ${isActive ? 'bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-transparent text-white active-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>

                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300
                                        ${isActive ? 'h-8 bg-gradient-to-b from-indigo-400 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50' : 'h-0'}`} />

                                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                                        ${isActive ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/20 shadow-lg shadow-indigo-500/20' : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-110'}`}>
                                        <Icon className={`text-lg transition-all duration-300 ${isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                                    </div>

                                    <span className={`flex-1 font-medium transition-all duration-300 ${isActive ? 'font-bold' : 'group-hover:translate-x-1'}`}>{item.label}</span>

                                    <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 ${isActive ? 'opacity-100 translate-x-0' : ''}`}>
                                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>

                                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Premium Footer */}
                    <div className="relative p-4 border-t border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent" />
                        <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-50 blur-sm group-hover:opacity-80 transition-opacity" />
                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                                    <span className="text-sm font-black text-white">MD</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">Managing Director</p>
                                <p className="text-xs text-indigo-400/60 truncate italic font-medium tracking-wide">Executive Access</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
