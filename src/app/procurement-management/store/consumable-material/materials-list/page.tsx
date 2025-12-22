'use client';

import Header from '@/components/Header';
import StoreSidebar from '@/components/StoreSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import MaterialList from '@/components/MaterialList';
import { FiList, FiDatabase, FiShield } from 'react-icons/fi';

export default function ConsumableMaterialListPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex">
                <StoreSidebar storeType="consumable" />

                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Consumable Store" subtitle="Stock Inventory Management" />

                    <main className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                        <div className="max-w-7xl mx-auto space-y-8">
                            {/* Page Header Decoration */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                                            <FiList />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Consumable Stock List</h2>
                                    </div>
                                    <p className="text-slate-500 font-medium max-w-2xl">
                                        Real-time registry of all consumable resources and office supplies.
                                        Monitoring item quantities for optimization and replenishment.
                                    </p>
                                </div>
                                <div className="flex items-center gap-6 relative z-10 border-l border-slate-100 pl-8">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</p>
                                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-2 justify-end">
                                            <FiShield /> SECURE VIEW ONLY
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Main List Component */}
                            <MaterialList typeFilter="consumable" />
                        </div>
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
