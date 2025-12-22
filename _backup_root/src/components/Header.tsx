'use client';

import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    const { user, logout } = useAuth();
    const { isOpen, toggleSidebar } = useSidebar();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="bg-white shadow-sm mb-8 sticky top-0 z-30">
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
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 hidden sm:block">
                            {user?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
