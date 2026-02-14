'use client';

import { SidebarProvider } from '@/contexts/SidebarContext';
import GeneralServiceSidebar from '@/components/GeneralServiceSidebar';
import Header from '@/components/Header';
import RequestNotificationBanner from '@/components/RequestNotificationBanner';
import IdleTimeoutGuard from '@/components/IdleTimeoutGuard';
import { InventoryProvider } from '@/contexts/InventoryContext';

export default function ServiceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <InventoryProvider>
                <IdleTimeoutGuard />
                <div className="min-h-screen bg-white flex">
                    <GeneralServiceSidebar />
                    <div className="flex-1 flex flex-col">
                        <RequestNotificationBanner />
                        <Header title="Service Dashboard" subtitle="General Service" />
                        <main className="flex-1 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </InventoryProvider>
        </SidebarProvider>
    );
}
