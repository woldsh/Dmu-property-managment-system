'use client';

import Header from '../../../src/components/Header';
import ManagingDirectorSidebar from '../../../src/components/ManagingDirectorSidebar';
import { SidebarProvider } from '../../../src/contexts/SidebarContext';
import MaterialRequestView from '../../../src/components/MaterialRequestView';

export default function ManagingDirectorRequestsPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <ManagingDirectorSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Executive Directives" subtitle="Managing Director Oversight" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
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
