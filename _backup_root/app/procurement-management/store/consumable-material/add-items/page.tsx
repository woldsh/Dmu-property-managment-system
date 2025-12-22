'use client';

import React from 'react';
import Header from '../../../../../src/components/Header';
import StoreSidebar from '../../../../../src/components/StoreSidebar';
import { SidebarProvider } from '../../../../../src/contexts/SidebarContext';
import AddItemForm from '../../../../../src/components/AddItemForm';

export default function AddConsumableMaterialPage() {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
                <StoreSidebar storeType="consumable" />

                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Register Consumable Material" subtitle="Store Management" />

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        <AddItemForm type="consumable" />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
