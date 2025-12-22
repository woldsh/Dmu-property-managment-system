'use client';

import Header from '../../../../src/components/Header';
import TeacherSidebar from '../../../../src/components/TeacherSidebar';
import { SidebarProvider } from '../../../../src/contexts/SidebarContext';
import MaterialRequestForm from '../../../../src/components/MaterialRequestForm';

export default function RequestMaterialPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <TeacherSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Material Requisition" subtitle="Teacher Portal" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <MaterialRequestForm />
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
