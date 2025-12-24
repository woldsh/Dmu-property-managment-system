'use client';

import { useAuth } from '@/contexts/AuthContext';
import AddItemForm from '@/components/AddItemForm';
import { Loader2 } from 'lucide-react';

export default function WorkspaceAddItemsPage() {
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

    // Determine type based on role
    const type = userRole?.includes('consumable') ? 'consumable' : 'fixed_asset';

    return <AddItemForm type={type} />;
}
