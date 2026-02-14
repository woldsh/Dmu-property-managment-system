'use client';

import { SidebarProvider } from '@/contexts/SidebarContext';
import AdminTeamLeaderSidebar from '@/components/AdminTeamLeaderSidebar';
import EmployeeSidebar from '@/components/EmployeeSidebar';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import IdleTimeoutGuard from '@/components/IdleTimeoutGuard';
import { Loader2 } from 'lucide-react';
import { isEmployeeRole, getDisplayNameForRole } from '@/utils/routeConfig';
import { InventoryProvider } from '@/contexts/InventoryContext';

export default function AdminPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userRole, department, loading } = useAuth();

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

    // Only show content if we have a user role. 
    // If userRole is null and loading is false, a redirect is likely happening.
    if (!userRole && !loading) {
        return (
            <div className="min-h-screen bg-[#020205] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
            </div>
        );
    }

    const isEmployee = isEmployeeRole(userRole);

    const getTitle = () => {
        if (department && isEmployee) {
            return `${department} Employee`;
        }
        return getDisplayNameForRole(userRole || '');
    };

    return (
        <SidebarProvider>
            <InventoryProvider>
                <IdleTimeoutGuard />
                <div className="min-h-screen bg-white flex relative">
                    {/* Global Decorative Mesh Gradient for Admin Panel */}
                    <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>

                    <div className="relative z-10 flex w-full">
                        {isEmployee ? <EmployeeSidebar /> : <AdminTeamLeaderSidebar />}
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="sticky top-0 z-40">
                                <Header
                                    title={getTitle()}
                                    subtitle={department ? "Administrative Unit" : (isEmployee ? "Administrative Staff" : "Management Console")}
                                />
                            </div>
                            <main className="flex-1 overflow-y-auto relative z-0">
                                {children}
                            </main>
                        </div>
                    </div>
                </div>
            </InventoryProvider>
        </SidebarProvider>
    );
}
