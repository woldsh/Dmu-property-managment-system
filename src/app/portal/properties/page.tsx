'use client';

import EmployeeReportView from '@/components/EmployeeReportView';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function PortalPropertiesPage() {
    const { user } = useAuth();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-transparent">
                <EmployeeReportView
                    hidePending={true}
                    categorizeByType={true}
                    onlyAccepted={true}
                    userId={user?.uid}
                />
            </div>
        </ProtectedRoute>
    );
}
