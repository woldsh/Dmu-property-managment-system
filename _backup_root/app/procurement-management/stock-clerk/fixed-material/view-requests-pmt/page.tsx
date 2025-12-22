'use client';

import Header from '../../../../../src/components/Header';
import StockClerkSidebar from '../../../../../src/components/StockClerkSidebar';
import { SidebarProvider } from '../../../../../src/contexts/SidebarContext';
import MaterialRequestView from '../../../../../src/components/MaterialRequestView';

export default function ViewRequestsPMTPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <StockClerkSidebar stockType="fixed" />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="View Requests (PMT)" subtitle="Fixed Asset Requests" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <MaterialRequestView roleOverride="stock_clerk" materialTypeFilter="fixed_asset" />
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
