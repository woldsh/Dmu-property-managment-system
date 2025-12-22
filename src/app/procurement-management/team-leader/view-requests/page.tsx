'use client';

import Header from '@/components/Header';
import ProcurementTeamLeaderSidebar from '@/components/ProcurementTeamLeaderSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import MaterialRequestView from '@/components/MaterialRequestView';

export default function TeamLeaderViewRequestsPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <ProcurementTeamLeaderSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Material Withdrawals" subtitle="Team Leader Approval Center" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <MaterialRequestView roleOverride="team_leader" />
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
