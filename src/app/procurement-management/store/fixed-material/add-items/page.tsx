'use client';

import React from 'react';
import Header from '@/components/Header';
import StoreSidebar from '@/components/StoreSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import AddItemForm from '@/components/AddItemForm';

export default function AddFixedAssetPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
                <StoreSidebar storeType="fixed" />

                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Register Fixed Asset" subtitle="Store Management" />

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        <AddItemForm type="fixed_asset" />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
