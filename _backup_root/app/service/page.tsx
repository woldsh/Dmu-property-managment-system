'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import general service component
const GeneralServicePage = dynamic(() => import('../general-service/page'), { ssr: false });

export default function ServicePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
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
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020205] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading Service...
                    </p>
                </div>
            </div>
        );
    }

    const renderService = () => {
        if (!userRole) return null;

        if (userRole === 'general_service_leader') {
            return <GeneralServicePage />;
        }

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">General Service</h1>
                    <p className="text-gray-600 mt-2">Welcome to general service</p>
                </div>
            </div>
        );
    };

    return (
        <ProtectedRoute>
            {renderService()}
        </ProtectedRoute>
    );
}
