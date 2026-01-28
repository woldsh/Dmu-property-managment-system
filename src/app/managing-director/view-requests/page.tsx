'use client';

import Header from '@/components/Header';
import ManagingDirectorLayout from '@/components/ManagingDirectorLayout';
import MaterialRequestView from '@/components/MaterialRequestView';

export default function ManagingDirectorRequestsPage() {
    return (
        <ManagingDirectorLayout>
            <Header title="Executive Directives" subtitle="Managing Director Oversight" />
            <div className="min-h-full">
                <MaterialRequestView />
            </div>
        </ManagingDirectorLayout>
    );
}
