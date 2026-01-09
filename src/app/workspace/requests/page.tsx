'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import StoreRequestVerification from '@/components/StoreRequestVerification';
import MaterialRequestView from '@/components/MaterialRequestView';
import { Loader2 } from 'lucide-react';

export default function WorkspaceRequestsPage() {
    const { user } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [storeType, setStoreType] = useState<'fixed_asset' | 'consumable'>('fixed_asset');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                if (!db) return;
                const userDocRef = doc(db!, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserRole(userData.userRole);

                    // Determine store type based on user role
                    if (userData.userRole?.includes('fixed_asset') || userData.storeType === 'fixed_assets') {
                        setStoreType('fixed_asset');
                    } else if (userData.userRole?.includes('consumable') || userData.storeType === 'consumable_items') {
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
            <div className="flex items-center justify-center p-12 min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    // Store Keeper sees only handout verification (approved clerk requests)
    if (userRole?.includes('store_keeper')) {
        return <StoreRequestVerification storeType={storeType} />;
    }

    // Other roles (Team Leader, Stock Clerk) see MaterialRequestView
    return <MaterialRequestView />;
}
