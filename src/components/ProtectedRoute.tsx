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
    const { user, loading: authLoading, userRole } = useAuth();
    const router = useRouter();
    const isAuthorized = !allowedRoles || allowedRoles.length === 0 || (userRole && allowedRoles.includes(userRole));

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/login');
        } else if (allowedRoles && allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
            router.push('/');
        }
    }, [user, authLoading, userRole, allowedRoles, router]);

    // Show loading state ONLY while auth is actually loading
    if (authLoading) {
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

    // If we're authenticated and authorized (or no roles required), show the children
    // If not authorized, we'll return null while the useEffect handles the redirect
    if (user && isAuthorized) {
        return <>{children}</>;
    }

    return null;
}
