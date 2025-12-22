'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // Optional: specific roles allowed to access this route
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuthorization = async () => {
            // Wait for auth to finish loading
            if (authLoading) {
                return;
            }

            // If no user, redirect to login
            if (!user) {
                router.push('/login');
                return;
            }

            // If specific roles are required, check user's role
            if (allowedRoles && allowedRoles.length > 0) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const userRole = userData.userRole;

                        // Check if user's role is in the allowed roles
                        if (allowedRoles.includes(userRole)) {
                            setAuthorized(true);
                        } else {
                            // User doesn't have permission, redirect to home
                            router.push('/');
                            return;
                        }
                    } else {
                        // User document doesn't exist, redirect to login
                        router.push('/login');
                        return;
                    }
                } catch (error) {
                    console.error('Error checking user authorization:', error);
                    router.push('/login');
                    return;
                }
            } else {
                // No specific roles required, just need to be authenticated
                setAuthorized(true);
            }

            setChecking(false);
        };

        checkAuthorization();
    }, [user, authLoading, allowedRoles, router]);

    // Show loading state while checking authentication
    if (authLoading || checking) {
        return (
            <div className="min-h-screen bg-[#020205] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Verifying Access...
                    </p>
                </div>
            </div>
        );
    }

    // Show nothing if not authorized (will redirect)
    if (!authorized) {
        return null;
    }

    // User is authorized, show the protected content
    return <>{children}</>;
}
