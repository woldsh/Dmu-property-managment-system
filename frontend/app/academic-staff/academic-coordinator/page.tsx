'use client';
import Header from '../../../src/components/Header';
import AcademicCoordinatorSidebar from '../../../src/components/AcademicCoordinatorSidebar';
import { SidebarProvider } from '../../../src/contexts/SidebarContext';

export default function AcademicCoordinatorPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <AcademicCoordinatorSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <Header title="Academic Coordinator" subtitle="Academic Management" />

                    <main className="flex-1 px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Dashboard Cards Placeholder */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">Pending Requests</h3>
                                <p className="text-3xl font-bold text-lime-600 mt-2">5</p>
                                <p className="text-sm text-gray-500 mt-1">From Dept Heads</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800">MD Decisions</h3>
                                <p className="text-3xl font-bold text-green-600 mt-2">2</p>
                                <p className="text-sm text-gray-500 mt-1">New Updates</p>
                            </div>
                        </div>

                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Operations</h2>
                            <p className="text-gray-600">No scheduled meetings for today.</p>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
