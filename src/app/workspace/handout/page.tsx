'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import StoreSidebar from '@/components/StoreSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import StoreRequestVerification from '@/components/StoreRequestVerification';
import { Loader2 } from 'lucide-react';

export default function WorkspaceHandoutPage() {
    const { user } = useAuth();
    const [storeType, setStoreType] = useState<'fixed_asset' | 'consumable'>('fixed_asset'); // Default fallback
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

                    // Determine store type based on user role or explicit storeType field
                    if (userData.stockType === 'fixed_asset' || userData.userRole?.includes('fixed_asset') || userData.storeType === 'fixed_assets') {
                        setStoreType('fixed_asset');
                    } else if (userData.stockType === 'consumable' || userData.userRole?.includes('consumable') || userData.storeType === 'consumable_items') {
                        setStoreType('consumable');
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
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
            </div>
        );
    }

    // Default sidebar prop based on storeType derived from user
    const sidebarStoreType = storeType === 'consumable' ? 'consumable' : 'fixed';

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Sidebar */}
                <StoreSidebar storeType={sidebarStoreType} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Handout Verification" subtitle="Verify Codes & Deduct Inventory" />

                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <StoreRequestVerification storeType={storeType} />
                    </main>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </SidebarProvider>
    );
}
