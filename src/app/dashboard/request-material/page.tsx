'use client';

import { useState } from 'react';
import PaperMaterialRequestForm from '@/components/PaperMaterialRequestForm';
import MaterialSearch from '@/components/MaterialSearch';

export default function RequestMaterialPage() {
    const [view, setView] = useState<'search' | 'form'>('search');
    const [selectedItem, setSelectedItem] = useState<{ name: string; model?: string } | undefined>(undefined);

    const handleSelect = (name: string, model?: string) => {
        setSelectedItem({ name, model });
        setView('form');
    };

    const handleBack = () => {
        setView('search');
        setSelectedItem(undefined);
    };

    if (view === 'search') {
        return (
            <div className="h-full p-6 bg-slate-50 min-h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto pb-8">
                    <MaterialSearch onSelect={handleSelect} onCancel={() => { }} />
                </div>
            </div>
        );
    }

    // Key ensures component remounts when selection changes
    return <PaperMaterialRequestForm key={selectedItem?.name} initialItem={selectedItem} onBack={handleBack} />;
}
