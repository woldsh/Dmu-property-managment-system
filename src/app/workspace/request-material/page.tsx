'use client';

import { InventoryProvider } from '@/contexts/InventoryContext';
import MaterialRequestForm from '@/components/MaterialRequestForm';

export default function WorkspaceRequestMaterialPage() {
    return (
        <InventoryProvider>
            <MaterialRequestForm />
        </InventoryProvider>
    );
}
