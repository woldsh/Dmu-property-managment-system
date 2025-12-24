'use client';

import { useAuth } from '@/contexts/AuthContext';
import MaterialLookup from '@/components/MaterialLookup';
import { Loader2 } from 'lucide-react';

export default function WorkspaceSearchMaterialPage() {
    const { userRole, loading } = useAuth();

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

    const storeType = userRole?.includes('consumable') ? 'consumable' : 'fixed_asset';

    return <MaterialLookup storeType={storeType} />;
}
