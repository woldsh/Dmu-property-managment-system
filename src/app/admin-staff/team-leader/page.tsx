'use client';
import Header from '@/components/Header';
import AdminTeamLeaderSidebar from '@/components/AdminTeamLeaderSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function AdminTeamLeaderPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <AdminTeamLeaderSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <Header title="Admin Team Leader" subtitle="Department Supervisor" />

                    <main className="flex-1 px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Dashboard Cards Placeholder */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">New Requests</h3>
                                <p className="text-3xl font-bold text-teal-600 mt-2">7</p>
                                <p className="text-sm text-gray-500 mt-1">From Employees</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Pending Approvals</h3>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">4</p>
                                <p className="text-sm text-gray-500 mt-1">Awaiting Action</p>
                            </div>
                        </div>

                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Operations Overview</h2>
                            <p className="text-gray-600">No recent operational issues.</p>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
