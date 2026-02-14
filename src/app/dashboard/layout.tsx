'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SidebarProvider } from '@/contexts/SidebarContext';
import AcademicCoordinatorSidebar from '@/components/AcademicCoordinatorSidebar';
import DepartmentHeadSidebar from '@/components/DepartmentHeadSidebar';
import TeacherSidebar from '@/components/TeacherSidebar';
import Header from '@/components/Header';
import MeetingNotificationBanner from '@/components/MeetingNotificationBanner';
import RequestNotificationBanner from '@/components/RequestNotificationBanner';
import IdleTimeoutGuard from '@/components/IdleTimeoutGuard';
import { Loader2 } from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import { InventoryProvider } from '@/contexts/InventoryContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020205] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-lime-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading Dashboard...
                    </p>
                </div>
            </div>
        );
    }

    // Determine which sidebar to show based on user role
    const renderSidebar = () => {
        if (!userRole) return <AcademicCoordinatorSidebar />;

        if (userRole === 'academic_coordinator') {
            return <AcademicCoordinatorSidebar />;
        }

        if (userRole.endsWith('_head')) {
            return <DepartmentHeadSidebar />;
        }

        if (userRole.endsWith('_teacher')) {
            return <TeacherSidebar />;
        }

        // Default
        return <AcademicCoordinatorSidebar />;
    };

    const getTitle = () => {
        if (!userRole) return 'Dashboard';
        if (userRole === 'academic_coordinator') return 'Academic Coordinator';
        if (userRole.endsWith('_head')) return 'Department Head';
        if (userRole.endsWith('_teacher')) return 'Teacher Dashboard';
        return 'Dashboard';
    };

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <InventoryProvider>
                    <IdleTimeoutGuard />
                    <div className="min-h-screen bg-white flex">
                        {renderSidebar()}
                        <div className="flex-1 flex flex-col min-w-0">
                            <MeetingNotificationBanner />
                            <RequestNotificationBanner />
                            <div className="sticky top-0 z-40">
                                <Header title={getTitle()} subtitle="Academic Staff" />
                            </div>
                            <main className="flex-1 overflow-y-auto relative z-0">
                                {children}
                            </main>
                        </div>
                    </div>
                </InventoryProvider>
            </SidebarProvider>
        </ProtectedRoute>
    );
}
