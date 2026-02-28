'use client';

import { InventoryProvider } from '@/contexts/InventoryContext';
import MaterialRequestForm from '@/components/MaterialRequestForm';

export default function ServiceRequestMaterialPage() {
    return (
        <InventoryProvider>
            <MaterialRequestForm />
        </InventoryProvider>
    );
}
