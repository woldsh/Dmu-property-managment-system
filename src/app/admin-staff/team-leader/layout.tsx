'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import AdminTeamLeaderSidebar from '@/components/AdminTeamLeaderSidebar';
import DormitoryLeaderSidebar from '@/components/DormitoryLeaderSidebar';
import CafeteriaLeaderSidebar from '@/components/CafeteriaLeaderSidebar';
import SportsLeaderSidebar from '@/components/SportsLeaderSidebar';
import StudentServiceLeaderSidebar from '@/components/StudentServiceLeaderSidebar';
import Header from '@/components/Header';
import IdleTimeoutGuard from '@/components/IdleTimeoutGuard';
import { getDisplayNameForRole } from '@/utils/routeConfig';
import { InventoryProvider } from '@/contexts/InventoryContext';
import RequestNotificationBanner from '@/components/RequestNotificationBanner';

export default function TeamLeaderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userRole, department, loading } = useAuth();
    const { t } = useLanguage();

    if (loading || (!userRole && !loading)) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Determine which sidebar to show based on user role
    const renderSidebar = () => {
        switch (userRole) {
            case 'student_service_dormitory_leader':
                return <DormitoryLeaderSidebar />;
            case 'student_service_cafeteria_leader':
                return <CafeteriaLeaderSidebar />;
            case 'student_service_sport_leader':
                return <SportsLeaderSidebar />;
            case 'student_service_leader':
                return <StudentServiceLeaderSidebar />;
            case 'hrm_leader':
                return <AdminTeamLeaderSidebar />;
            case 'finance_leader':
                return <AdminTeamLeaderSidebar />;
            default:
                return <AdminTeamLeaderSidebar />;
        }
    };

    const getLocalizedRoleName = (role: string) => {
        // If department exists, use it to form a specific title
        if (department) {
            return `${department} Team Leader`;
        }

        switch (role) {
            case 'student_service_dormitory_leader': return t('dormitory_leader');
            case 'student_service_cafeteria_leader': return t('cafeteria_leader');
            case 'student_service_sport_leader': return t('sports_leader');
            case 'student_service_leader': return t('student_service_leader');

            case 'hrm_leader': return t('hrm_leader');
            case 'finance_leader': return t('finance_leader');

            // Admin Staff Leaders
            case 'general_service_admin_leader': return 'General Service Lead';
            case 'procurement_admin_leader': return 'Procurement Lead';
            case 'resource_development_leader': return 'Resource Dev Lead';
            case 'building_renovation_leader': return 'Renovation Lead';
            case 'library_service_leader': return 'Library Lead';
            case 'security_leader': return 'Security Lead';
            case 'registrar_leader': return 'Registrar Lead';

            // Catch-all for Admin/Team Lead
            case 'admin_leader': return 'Admin Lead';

            default: return t('team_leader') || 'Team Leader';
        }
    };

    return (
        <SidebarProvider>
            <InventoryProvider>
                <IdleTimeoutGuard />
                <div className="min-h-screen bg-white flex">
                    {/* Dynamic Sidebar */}
                    {renderSidebar()}

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        <RequestNotificationBanner />
                        <Header
                            title={getLocalizedRoleName(userRole || '')}
                            subtitle={department ? "Administrative Unit" : (t('team_leadership' as any) || "Team Leadership")}
                        />
                        <main className="flex-1 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </InventoryProvider>
        </SidebarProvider>
    );
}
