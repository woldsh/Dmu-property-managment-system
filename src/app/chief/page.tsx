'use client';
import Header from '@/components/Header';
import ChiefSidebar from '@/components/ChiefSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function ChiefPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <ChiefSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <Header title="Chief Dashboard" subtitle="Institution Head" />

                    <main className="flex-1 px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Dashboard Cards Placeholder */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Pending Approvals</h3>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">5</p>
                                <p className="text-sm text-gray-500 mt-1">From Managing Director</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Scheduled Meetings</h3>
                                <p className="text-3xl font-bold text-amber-600 mt-2">3</p>
                                <p className="text-sm text-gray-500 mt-1">Today</p>
                            </div>
                        </div>

                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Executive Overview</h2>
                            <p className="text-gray-600">Review recent decisions and reports.</p>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
