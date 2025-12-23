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
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserRole(userData.userRole);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

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
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {renderSidebar()}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="sticky top-0 z-40">
                        <Header title={getTitle()} subtitle="Academic Staff" />
                    </div>
                    <main className="flex-1 overflow-y-auto relative z-0">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
