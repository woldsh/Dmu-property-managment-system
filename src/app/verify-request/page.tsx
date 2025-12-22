'use client';

import VerifyMaterialRequest from '@/components/VerifyMaterialRequest';
import Header from '@/components/Header';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VerifyRequestPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);


    if (loading) return null;

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                <main className="flex-grow flex items-center justify-center p-4">
                    <VerifyMaterialRequest />
                </main>
            </div>
        </SidebarProvider>
    );
}
