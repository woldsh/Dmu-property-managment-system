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
                console.error('Error fetching user data for portal layout:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading Portal...
                    </p>
                </div>
            </div>
        );
    }

    const isChief = userRole === 'chief';

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-[#020205] flex">
                {isChief ? <ChiefSidebar /> : <ManagingDirectorSidebar />}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header
                        title={isChief ? "Chief Portal" : "Executive Portal"}
                        subtitle={isChief ? "Institution Head" : "Managing Director Control Center"}
                        isDark={true}
                    />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
