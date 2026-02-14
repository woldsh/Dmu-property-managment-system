'use client';

import { SidebarProvider } from '@/contexts/SidebarContext';
import AdminSidebar from '@/components/AdminSidebar';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import IdleTimeoutGuard from '@/components/IdleTimeoutGuard';
import { Loader2 } from 'lucide-react';
import { InventoryProvider } from '@/contexts/InventoryContext';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const { t } = useLanguage();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFDFE] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                        {t('accessing_admin_panel')}
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <SidebarProvider>
            <InventoryProvider>
                <IdleTimeoutGuard />
                <div className="min-h-screen bg-white flex relative">
                    {/* Global Decorative Mesh Gradient for Admin Panel */}
                    <div className="fixed inset-0 pointer-events-none opacity-40 z-0 text-blue-500">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>

                    <div className="relative z-10 flex w-full">
                        <AdminSidebar />
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="sticky top-0 z-40">
                                <Header
                                    title={t('system_administrator')}
                                    subtitle={t('institutional_command_center')}
                                />
                            </div>
                            <main className="flex-1 overflow-y-auto relative z-0">
                                {children}
                            </main>
                        </div>
                    </div>
                </div>
            </InventoryProvider>
        </SidebarProvider>
    );
}
