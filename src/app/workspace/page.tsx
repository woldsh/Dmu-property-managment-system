'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import procurement components
const TeamLeaderPage = dynamic(() => import('../procurement-management/team-leader/page'), { ssr: false });
const FixedAssetStockClerkPage = dynamic(() => import('../procurement-management/stock-clerk/fixed-material/page'), { ssr: false });
const ConsumableStockClerkPage = dynamic(() => import('../procurement-management/stock-clerk/consumable-material/page'), { ssr: false });
const FixedAssetStoreKeeperPage = dynamic(() => import('../procurement-management/store/fixed-material/page'), { ssr: false });
const ConsumableStoreKeeperPage = dynamic(() => import('../procurement-management/store/consumable-material/page'), { ssr: false });

export default function WorkspacePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [stockType, setStockType] = useState<string | null>(null);
    const [storeType, setStoreType] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
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
                    setStockType(userData.stockType || null);
                    setStoreType(userData.storeType || null);
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020205] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        Loading Workspace...
                    </p>
                </div>
            </div>
        );
    }

    const renderWorkspace = () => {
        if (!userRole) return null;

        if (userRole === 'procurement_team_leader') {
            return <TeamLeaderPage />;
        }

        if (userRole === 'fixed_asset_stock_clerk' || (userRole === 'consumable_item_stock_clerk' && stockType === 'fixed_assets')) {
            return <FixedAssetStockClerkPage />;
        }

        if (userRole === 'consumable_item_stock_clerk' || stockType === 'consumable_items') {
            return <ConsumableStockClerkPage />;
        }

        if (userRole === 'fixed_asset_store_keeper' || (userRole === 'consumable_item_store_keeper' && storeType === 'fixed_assets')) {
            return <FixedAssetStoreKeeperPage />;
        }

        if (userRole === 'consumable_item_store_keeper' || storeType === 'consumable_items') {
            return <ConsumableStoreKeeperPage />;
        }

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Procurement Workspace</h1>
                    <p className="text-gray-600 mt-2">Welcome to your workspace</p>
                </div>
            </div>
        );
    };

    return (
        <ProtectedRoute>
            {renderWorkspace()}
        </ProtectedRoute>
    );
}
