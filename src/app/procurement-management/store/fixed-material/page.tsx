'use client';
import Header from '@/components/Header';
import StoreSidebar from '@/components/StoreSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function StoreKeeperFixedMaterialPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <StoreSidebar storeType="fixed" />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <Header title="Fixed Asset Store Keeper" subtitle="Dashboard" />

                    <main className="flex-1 px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Dashboard Cards Placeholder */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">New Requests</h3>
                                <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
                                <p className="text-sm text-gray-500 mt-1">From Stock Clerks</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Total Fixed Assets</h3>
                                <p className="text-3xl font-bold text-indigo-600 mt-2">1,024</p>
                                <p className="text-sm text-gray-500 mt-1">In Inventory</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Pending Transfers</h3>
                                <p className="text-3xl font-bold text-orange-600 mt-2">5</p>
                                <p className="text-sm text-gray-500 mt-1">Awaiting Approval</p>
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
