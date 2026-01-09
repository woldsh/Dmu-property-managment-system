'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EmployeeReportView from '@/components/EmployeeReportView';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

export default function WorkspacePropertiesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isStoreKeeper, setIsStoreKeeper] = useState(false);
    const [stockType, setStockType] = useState<'fixed' | 'consumable' | 'all'>('all');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                if (!db) return;
                const userDoc = await getDoc(doc(db!, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    if (userData.userRole?.includes('store_keeper')) {
                        setIsStoreKeeper(true);
                    }

                    if (userData.userRole?.includes('fixed_asset') || userData.stockType === 'fixed_assets' || userData.userRole === 'store_keeper_fixed') {
                        setStockType('fixed');
                    } else if (userData.userRole?.includes('consumable') || userData.stockType === 'consumable_items' || userData.userRole === 'store_keeper_consumable') {
                        setStockType('consumable');
                    }
                }
            } catch (error) {
                console.error('Error fetching user for workspace properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Initializing Asset Management...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-transparent">
                <EmployeeReportView
                    filterType={stockType}
                    hidePending={true}
                    categorizeByType={stockType === 'all'}
                    onlyAccepted={true}
                    userId={user?.uid}
                />
            </div>
        </ProtectedRoute>
    );
}
