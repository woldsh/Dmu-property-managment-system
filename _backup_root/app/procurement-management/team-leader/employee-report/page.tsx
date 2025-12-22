'use client';

import Header from '../../../../src/components/Header';
import ProcurementTeamLeaderSidebar from '../../../../src/components/ProcurementTeamLeaderSidebar';
import { SidebarProvider } from '../../../../src/contexts/SidebarContext';
import EmployeeReportView from '../../../../src/components/EmployeeReportView';

export default function EmployeeReportPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <ProcurementTeamLeaderSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Employee Material Report" subtitle="Usage Analytics & Tracking" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <EmployeeReportView />
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
