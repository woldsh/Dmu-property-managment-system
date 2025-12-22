'use client';

import Header from '@/components/Header';
import DepartmentHeadSidebar from '@/components/DepartmentHeadSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import MaterialRequestView from '@/components/MaterialRequestView';

export default function ViewRequestsPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <DepartmentHeadSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                    {/* Background Decoration */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-orange-100/50 to-transparent blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-amber-100/50 to-transparent blur-3xl"></div>
                    </div>

                    <Header title="Incoming Requisitions" subtitle="Department Head Oversight" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                        <MaterialRequestView />
                    </main>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </SidebarProvider>
    );
}
