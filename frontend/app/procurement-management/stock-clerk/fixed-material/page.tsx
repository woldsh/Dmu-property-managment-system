'use client';
import Header from '../../../../src/components/Header';
import StockClerkFixedSidebar from '../../../../src/components/StockClerkFixedSidebar';
import { SidebarProvider } from '../../../../src/contexts/SidebarContext';

export default function StockClerkFixedMaterialPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <StockClerkFixedSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <Header title="Stock Clerk - Fixed Assets" subtitle="Procurement Management" />

                    <main className="flex-1 px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Dashboard Cards Placeholder */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">PMT Requests</h3>
                                <p className="text-3xl font-bold text-cyan-600 mt-2">3</p>
                                <p className="text-sm text-gray-500 mt-1">New Inquiries</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Exchange Items</h3>
                                <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
                                <p className="text-sm text-gray-500 mt-1">Pending Returns</p>
                            </div>
                        </div>

                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Material Status</h2>
                            <p className="text-gray-600">No recent updates.</p>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
