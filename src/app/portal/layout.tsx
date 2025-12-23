'use client';

import { SidebarProvider } from '@/contexts/SidebarContext';
import ManagingDirectorSidebar from '@/components/ManagingDirectorSidebar';
import Header from '@/components/Header';

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <ManagingDirectorSidebar />
                <div className="flex-1 flex flex-col">
                    <Header title="Executive Portal" subtitle="Managing Director" />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
