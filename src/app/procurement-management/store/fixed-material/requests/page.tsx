'use client';

import Header from '@/components/Header';
import StoreSidebar from '@/components/StoreSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import StoreRequestVerification from '@/components/StoreRequestVerification';

export default function StoreFixedRequestsPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <StoreSidebar storeType="fixed" />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="View Requests" subtitle="Fixed Asset Handout Verification" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <StoreRequestVerification storeType="fixed_asset" />
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
