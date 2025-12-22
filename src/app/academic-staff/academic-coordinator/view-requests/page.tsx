'use client';

import Header from '@/components/Header';
import AcademicCoordinatorSidebar from '@/components/AcademicCoordinatorSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import MaterialRequestView from '@/components/MaterialRequestView';

export default function ACViewRequestsPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <AcademicCoordinatorSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="View Requests" subtitle="Academic Coordinator Approval" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <MaterialRequestView roleOverride="academic_coordinator" />
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
