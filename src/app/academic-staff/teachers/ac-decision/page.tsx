'use client';

import Header from '@/components/Header';
import TeacherSidebar from '@/components/TeacherSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import UniversalCommissionReview from '@/components/UniversalCommissionReview';

export default function TeacherACDecisionPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <TeacherSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="AC Decision" subtitle="Commission Review Queue" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <UniversalCommissionReview />
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
