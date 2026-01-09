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
import { getDisplayNameForRole } from '@/utils/routeConfig';

export default function TeamLeaderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userRole } = useAuth();
    const { t } = useLanguage();

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
        switch (role) {
            case 'student_service_dormitory_leader': return t('dormitory_leader');
            case 'student_service_cafeteria_leader': return t('cafeteria_leader');
            case 'student_service_sport_leader': return t('sports_leader');
            case 'student_service_leader': return t('student_service_leader');
            case 'hrm_leader': return t('hrm_leader');
            case 'finance_leader': return t('finance_leader');
            default: return t('team_leader');
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Dynamic Sidebar */}
                {renderSidebar()}

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <Header title={getLocalizedRoleName(userRole || '')} subtitle={t('team_leadership' as any) || "Team Leadership"} />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
