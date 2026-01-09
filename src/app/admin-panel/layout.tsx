'use client';

import { SidebarProvider } from '@/contexts/SidebarContext';
import AdminTeamLeaderSidebar from '@/components/AdminTeamLeaderSidebar';
import EmployeeSidebar from '@/components/EmployeeSidebar';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { isEmployeeRole, getDisplayNameForRole } from '@/utils/routeConfig';

export default function AdminPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020205] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading Workspace...
                    </p>
                </div>
            </div>
        );
    }

    const isEmployee = isEmployeeRole(userRole);

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {isEmployee ? <EmployeeSidebar /> : <AdminTeamLeaderSidebar />}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="sticky top-0 z-40">
                        <Header
                            title={getDisplayNameForRole(userRole || '')}
                            subtitle={isEmployee ? "Administrative Staff" : "Management Console"}
                        />
                    </div>
                    <main className="flex-1 overflow-y-auto relative z-0">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
