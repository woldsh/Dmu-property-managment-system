'use client';
import Header from '../../src/components/Header';
import GeneralServiceSidebar from '../../src/components/GeneralServiceSidebar';
import { SidebarProvider } from '../../src/contexts/SidebarContext';

export default function GeneralServicePage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <GeneralServiceSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <Header title="General Service" subtitle="Dashboard" />

                    <main className="flex-1 px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Dashboard Cards Placeholder */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">MD Requests</h3>
                                <p className="text-3xl font-bold text-violet-600 mt-2">8</p>
                                <p className="text-sm text-gray-500 mt-1">Pending Action</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">PMT Messages</h3>
                                <p className="text-3xl font-bold text-fuchsia-600 mt-2">4</p>
                                <p className="text-sm text-gray-500 mt-1">Unread</p>
                            </div>
                        </div>

                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Service Status</h2>
                            <p className="text-gray-600">All systems operational.</p>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
