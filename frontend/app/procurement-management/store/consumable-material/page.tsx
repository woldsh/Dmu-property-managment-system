'use client';
import Header from '../../../../src/components/Header';
import StoreConsumableSidebar from '../../../../src/components/StoreConsumableSidebar';
import { SidebarProvider } from '../../../../src/contexts/SidebarContext';

export default function StoreKeeperConsumableMaterialPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <StoreConsumableSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <Header title="Consumable Item Store Keeper" subtitle="Dashboard" />

                    <main className="flex-1 px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Dashboard Cards Placeholder */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">New Requests</h3>
                                <p className="text-3xl font-bold text-blue-600 mt-2">8</p>
                                <p className="text-sm text-gray-500 mt-1">From Stock Clerks</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Total Consumables</h3>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">32,500</p>
                                <p className="text-sm text-gray-500 mt-1">Items in Stock</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Low Stock Alerts</h3>
                                <p className="text-3xl font-bold text-red-600 mt-2">15</p>
                                <p className="text-sm text-gray-500 mt-1">Require Reordering</p>
                            </div>
                        </div>

                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Clerk Activity</h2>
                            <p className="text-gray-600">No recent activity to display.</p>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
