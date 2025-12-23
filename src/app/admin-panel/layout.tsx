'use client';

import { SidebarProvider } from '@/contexts/SidebarContext';
import AdminTeamLeaderSidebar from '@/components/AdminTeamLeaderSidebar';
import Header from '@/components/Header';

export default function AdminPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <AdminTeamLeaderSidebar />
                <div className="flex-1 flex flex-col">
                    <Header title="Admin Panel" subtitle="Administrative Staff" />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
