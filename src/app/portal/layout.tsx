'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SidebarProvider } from '@/contexts/SidebarContext';
import ManagingDirectorSidebar from '@/components/ManagingDirectorSidebar';
import ChiefSidebar from '@/components/ChiefSidebar';
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
                        Loading Executive Portal...
                    </p>
                </div>
            </div>
        );
    }

    const isChief = userRole === 'chief';

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-white flex">
                {isChief ? <ChiefSidebar /> : <ManagingDirectorSidebar />}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header
                        title={isChief ? "Chief Portal" : "Executive Portal"}
                        subtitle={isChief ? "Institution Head" : "Managing Director Control Center"}
                        isDark={false}
                    />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
