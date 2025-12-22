'use client';

import Header from '../../../../../src/components/Header';
import StoreSidebar from '../../../../../src/components/StoreSidebar';
import { SidebarProvider } from '../../../../../src/contexts/SidebarContext';
import StoreRequestVerification from '../../../../../src/components/StoreRequestVerification';

export default function StoreConsumableRequestsPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <StoreSidebar storeType="consumable" />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="View Requests" subtitle="Consumable Material Handout Verification" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <StoreRequestVerification storeType="consumable" />
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
