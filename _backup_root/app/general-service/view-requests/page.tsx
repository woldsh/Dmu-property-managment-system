'use client';

import Header from '../../../src/components/Header';
import GeneralServiceSidebar from '../../../src/components/GeneralServiceSidebar';
import { SidebarProvider } from '../../../src/contexts/SidebarContext';
import MaterialRequestView from '../../../src/components/MaterialRequestView';

export default function GeneralServiceRequestsPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <GeneralServiceSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                    {/* Background Decoration */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-violet-100/50 to-transparent blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-100/50 to-transparent blur-3xl"></div>
                    </div>

                    <Header title="Service Management" subtitle="Validated Request Oversight" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                        <MaterialRequestView roleOverride="general_service" />
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
