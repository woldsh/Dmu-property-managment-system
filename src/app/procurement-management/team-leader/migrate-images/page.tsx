'use client';

import MigrateUserReportImages from '@/components/MigrateUserReportImages';
import Header from '@/components/Header';
import ProcurementTeamLeaderSidebar from '@/components/ProcurementTeamLeaderSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function MigrationPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <ProcurementTeamLeaderSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Database Migration" subtitle="User-Report Image Update" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <MigrateUserReportImages />
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
