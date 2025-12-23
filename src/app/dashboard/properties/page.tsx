'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EmployeeReportView from '@/components/EmployeeReportView';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

export default function PropertiesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isTeacher, setIsTeacher] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.userRole?.endsWith('_teacher')) {
                        setIsTeacher(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching user for properties:', error);
            } finally {
                setLoading(false);
            }
        };

        checkRole();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Loading Property Assets...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50">
                <EmployeeReportView
                    onlyAccepted={true}
                    userId={user?.uid}
                    hidePending={true}
                />
            </div>
        </ProtectedRoute>
    );
}
