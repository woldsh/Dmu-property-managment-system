'use client';
import Header from '@/components/Header';
import StockClerkSidebar from '@/components/StockClerkSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function StockClerkConsumableMaterialPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <StockClerkSidebar stockType="consumable" />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <Header title="Stock Clerk - Consumable Items" subtitle="Procurement Management" />

                    <main className="flex-1 px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Dashboard Cards Placeholder */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Supply Requests</h3>
                                <p className="text-3xl font-bold text-sky-600 mt-2">18</p>
                                <p className="text-sm text-gray-500 mt-1">From Store Keepers</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Inventory Alerts</h3>
                                <p className="text-3xl font-bold text-red-500 mt-2">4</p>
                                <p className="text-sm text-gray-500 mt-1">Low Stock</p>
                            </div>
                        </div>

                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Operations</h2>
                            <p className="text-gray-600">No activity logged today.</p>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
