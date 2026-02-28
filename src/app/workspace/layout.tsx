'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SidebarProvider } from '@/contexts/SidebarContext';
import ProcurementTeamLeaderSidebar from '@/components/ProcurementTeamLeaderSidebar';
import StockClerkSidebar from '@/components/StockClerkSidebar';
import StoreSidebar from '@/components/StoreSidebar';
import EmployeeSidebar from '@/components/EmployeeSidebar';
import ChiefSidebar from '@/components/ChiefSidebar';
import AcademicCoordinatorSidebar from '@/components/AcademicCoordinatorSidebar';
import DepartmentHeadSidebar from '@/components/DepartmentHeadSidebar';
import TeacherSidebar from '@/components/TeacherSidebar';
import AdminTeamLeaderSidebar from '@/components/AdminTeamLeaderSidebar';
import ManagingDirectorSidebar from '@/components/ManagingDirectorSidebar';
import GeneralServiceSidebar from '@/components/GeneralServiceSidebar';
import Header from '@/components/Header';
import IdleTimeoutGuard from '@/components/IdleTimeoutGuard';
import RequestNotificationBanner from '@/components/RequestNotificationBanner';
import { Loader2 } from 'lucide-react';
import { isEmployeeRole, getDisplayNameForRole, isLeaderRole } from '@/utils/routeConfig';

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userRole, department, loading } = useAuth();

    // Determine stock type based on role
    const getStockType = () => {
        if (userRole?.includes('fixed_asset')) return 'fixed';
        if (userRole?.includes('consumable')) return 'consumable';
        return 'fixed'; // Default
    };

    const stockType = getStockType();

    if (loading || (!userRole && !loading)) {
        return (
            <div className="min-h-screen bg-[#020205] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading Workspace...
                    </p>
                </div>
            </div>
        );
    }

    // Determine which sidebar to show based on user role
    const renderSidebar = () => {
        if (!userRole) return <ProcurementTeamLeaderSidebar />;

        // Procurement Specific
        if (userRole === 'procurement_team_leader') return <ProcurementTeamLeaderSidebar />;
        if (userRole.includes('stock_clerk')) return <StockClerkSidebar stockType={stockType} />;
        if (userRole.includes('store_keeper')) return <StoreSidebar storeType={stockType} />;

        // Other Roles
        if (userRole === 'chief') return <ChiefSidebar />;
        if (userRole === 'managing_director_leader') return <ManagingDirectorSidebar />;
        if (userRole === 'academic_coordinator') return <AcademicCoordinatorSidebar />;
        if (userRole === 'general_service_leader') return <GeneralServiceSidebar />;
        if (userRole.endsWith('_head')) return <DepartmentHeadSidebar />;
        if (userRole.endsWith('_teacher')) return <TeacherSidebar />;
        if (isEmployeeRole(userRole)) return <EmployeeSidebar />;
        if (isLeaderRole(userRole)) return <AdminTeamLeaderSidebar />;

        return <ProcurementTeamLeaderSidebar />;
    };

    const getTitle = () => {
        if (department && isEmployeeRole(userRole)) {
            return `${department} Employee`;
        }
        if (!userRole) return 'Workspace';
        return getDisplayNameForRole(userRole);
    };

    return (
        <SidebarProvider>
            <IdleTimeoutGuard />
            <div className="min-h-screen bg-white flex">
                {renderSidebar()}
                <div className="flex-1 flex flex-col">
                    <RequestNotificationBanner />
                    <Header
                        title={getTitle()}
                        subtitle={department && isEmployeeRole(userRole) ? "Administrative Unit" : "Procurement Management"}
                    />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
