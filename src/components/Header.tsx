'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiUser, FiSettings, FiLogOut, FiBox, FiLock, FiChevronDown } from 'react-icons/fi';
import Image from 'next/image';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    const { user, logout } = useAuth();
    const { isOpen, toggleSidebar } = useSidebar();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Dynamically determine the base path for settings links
    const getBasePath = () => {
        if (pathname.startsWith('/workspace')) return '/workspace';
        if (pathname.startsWith('/admin-panel')) return '/admin-panel';
        if (pathname.startsWith('/portal')) return '/portal';
        if (pathname.startsWith('/service')) return '/service';
        if (pathname.startsWith('/procurement-management')) {
            if (pathname.includes('/team-leader')) return '/procurement-management/team-leader';
            if (pathname.includes('/store')) return '/procurement-management/store';
            if (pathname.includes('/stock-clerk')) return '/procurement-management/stock-clerk';
            return '/procurement-management';
        }
        return '/dashboard'; // Default
    };

    const basePath = getBasePath();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow-sm mb-8 sticky top-0 z-[110] border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Animated Hamburger Button */}
                        <button
                            onClick={toggleSidebar}
                            className="group relative w-10 h-10 rounded-lg hover:bg-slate-100 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-400"
                            aria-label="Toggle sidebar"
                        >
                            <div className="flex flex-col gap-1.5 w-6">
                                <span className={`h-0.5 w-full bg-slate-700 rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                <span className={`h-0.5 w-full bg-slate-700 rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                <span className={`h-0.5 w-full bg-slate-700 rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                            </div>
                        </button>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                            {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-6" ref={dropdownRef}>
                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-3 p-1.5 pr-3 rounded-2xl transition-all duration-500 border-2 group
                                    ${isProfileOpen ? 'bg-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:shadow-lg'}`}
                            >
                                <div className="relative w-9 h-9">
                                    <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500 ${isProfileOpen ? 'opacity-100 animate-pulse' : ''}`} />
                                    <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white shadow-md flex items-center justify-center bg-white transform transition-transform group-hover:scale-105">
                                        {user?.photoURL ? (
                                            <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center">
                                                <span className="text-white font-black text-xs">{user?.email?.[0].toUpperCase() || 'U'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-xs font-black text-slate-800 tracking-tight leading-none truncate max-w-[120px] group-hover:text-indigo-600 transition-colors">
                                        {user?.displayName || 'User'}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity">Account</p>
                                </div>
                                <FiChevronDown className={`text-slate-400 transition-all duration-500 ${isProfileOpen ? 'rotate-180 text-indigo-600' : 'group-hover:text-indigo-400'}`} />
                            </button>

                            {/* Dropdown Menu - Ultra Premium Glassmorphism */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-4 w-72 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-6 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                                    {/* Glass Overlay for depth */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-indigo-50/20 pointer-events-none" />

                                    <div className="relative">
                                        {/* Simplified User Info */}
                                        <div className="p-6 border-b border-white/40">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-md opacity-20" />
                                                    <div className="relative w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm overflow-hidden">
                                                        {user?.photoURL ? (
                                                            <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
                                                        ) : (
                                                            <span className="text-xl font-black">{user?.email?.[0].toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-black text-slate-800 truncate text-lg tracking-tight -mb-1">{user?.displayName || 'User'}</p>
                                                    <p className="text-[11px] text-slate-400 truncate font-black uppercase tracking-[0.1em]">{user?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="p-4 space-y-1">
                                            <Link
                                                href={`${basePath}/properties`}
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-4 px-5 py-4 rounded-3xl text-slate-600 hover:bg-gradient-to-r hover:from-white hover:to-indigo-50/50 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 font-black text-sm group"
                                            >
                                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                                    <FiBox className="text-lg text-slate-400 group-hover:text-indigo-500" />
                                                </div>
                                                <span className="tracking-tight">Properties</span>
                                            </Link>
                                            <Link
                                                href={`${basePath}/settings`}
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-4 px-5 py-4 rounded-3xl text-slate-600 hover:bg-gradient-to-r hover:from-white hover:to-purple-50/50 hover:text-purple-600 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 font-black text-sm group"
                                            >
                                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                                    <FiSettings className="text-lg text-slate-400 group-hover:text-purple-500" />
                                                </div>
                                                <span className="tracking-tight">Settings</span>
                                            </Link>
                                        </div>

                                        {/* Logout Section */}
                                        <div className="p-4 bg-slate-900 shadow-[0_-12px_48px_rgba(15,23,42,0.15)] mt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="group relative w-full h-16 rounded-[1.75rem] bg-red-600 hover:bg-red-500 transition-all duration-300 shadow-[0_12px_24px_rgba(220,38,38,0.3)] hover:shadow-[0_16px_32px_rgba(220,38,38,0.4)] active:scale-95 overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="relative flex items-center justify-center gap-4 text-white font-black uppercase text-[11px] tracking-[0.3em]">
                                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                                                        <FiLogOut className="text-lg" />
                                                    </div>
                                                    <span>Logout System</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
