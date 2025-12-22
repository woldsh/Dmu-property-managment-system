'use client';

import Header from '../../../../src/components/Header';
import DepartmentHeadSidebar from '../../../../src/components/DepartmentHeadSidebar';
import { SidebarProvider } from '../../../../src/contexts/SidebarContext';
import UniversalCommissionReview from '../../../../src/components/UniversalCommissionReview';

export default function DeptHeadACDecisionPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <DepartmentHeadSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Need AC decision" subtitle="Departmental Commission Tracking" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <UniversalCommissionReview viewType="department" />
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
