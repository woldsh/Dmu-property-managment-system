'use client';

import ManagingDirectorSidebar from './ManagingDirectorSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function ManagingDirectorLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-white flex relative overflow-hidden font-sans selection:bg-blue-100">

                {/* GLOBAL WHITE BACKGROUND - FIXED */}
                <div className="fixed inset-0 z-0 pointer-events-none bg-white">
                </div>

                {/* Sidebar */}
                <ManagingDirectorSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        {children}
                    </main>
                </div>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                `}</style>
            </div>
        </SidebarProvider>
    );
}
