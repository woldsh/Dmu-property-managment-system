'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EmployeeReportView from '@/components/EmployeeReportView';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

export default function EmployeeDataPage() {
    const { user } = useAuth();
    const [stockType, setStockType] = useState<'fixed' | 'consumable' | 'all'>('all');
    const [loading, setLoading] = useState(true);

    const [isStoreKeeper, setIsStoreKeeper] = useState(false);

    useEffect(() => {
        const fetchStockType = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // Detect Store Keeper role
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
                console.error('Error fetching user stock type:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStockType();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Loading Employee Intelligence...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50">
                <EmployeeReportView
                    filterType={stockType}
                    hidePending={true}
                    categorizeByType={stockType === 'all'}
                    onlyAccepted={isStoreKeeper}
                />
            </div>
        </ProtectedRoute>
    );
}
