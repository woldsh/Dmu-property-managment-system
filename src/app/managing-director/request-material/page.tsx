'use client';

import MaterialRequestForm from '@/components/MaterialRequestForm';
import { InventoryProvider } from '@/contexts/InventoryContext';
import ManagingDirectorLayout from '@/components/ManagingDirectorLayout';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ManagingDirectorRequestPage() {
    const { t } = useLanguage();

    return (
        <ManagingDirectorLayout>
            <Header title={t('request_materials')} subtitle={t('managing_director')} />
            <div className="p-6">
                <InventoryProvider>
                    <MaterialRequestForm />
                </InventoryProvider>
            </div>
        </ManagingDirectorLayout>
    );
}
