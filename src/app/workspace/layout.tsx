'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SidebarProvider } from '@/contexts/SidebarContext';
import ProcurementTeamLeaderSidebar from '@/components/ProcurementTeamLeaderSidebar';
import StockClerkSidebar from '@/components/StockClerkSidebar';
import StoreSidebar from '@/components/StoreSidebar';
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [stockType, setStockType] = useState<'fixed' | 'consumable'>('fixed');
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
                    // Determine stock type based on role
                    if (userData.userRole?.includes('fixed_asset') || userData.stockType === 'fixed_assets') {
                        setStockType('fixed');
                    } else if (userData.userRole?.includes('consumable') || userData.stockType === 'consumable_items') {
                        setStockType('consumable');
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020205] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading Workspace...
                    </p>
                </div>
            </div>
        );
    }

    // Determine which sidebar to show based on user role
    const renderSidebar = () => {
        if (!userRole) return <ProcurementTeamLeaderSidebar />;

        if (userRole === 'procurement_team_leader') {
            return <ProcurementTeamLeaderSidebar />;
        }

        if (userRole.includes('stock_clerk')) {
            return <StockClerkSidebar stockType={stockType} />;
        }

        if (userRole.includes('store_keeper')) {
            return <StoreSidebar storeType={stockType} />;
        }

        // Default
        return <ProcurementTeamLeaderSidebar />;
    };

    const getTitle = () => {
        if (!userRole) return 'Workspace';
        if (userRole === 'procurement_team_leader') return 'Procurement Workspace';
        if (userRole.includes('stock_clerk')) return 'Stock Clerk Workspace';
        if (userRole.includes('store_keeper')) return 'Store Keeper Workspace';
        return 'Workspace';
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                {renderSidebar()}
                <div className="flex-1 flex flex-col">
                    <Header title={getTitle()} subtitle="Procurement Management" />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
