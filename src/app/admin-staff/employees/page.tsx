'use client';

import Header from '@/components/Header';
import EmployeeSidebar from '@/components/EmployeeSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { getDisplayNameForRole } from '@/utils/routeConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiBox, FiCheckCircle, FiActivity, FiInbox, FiTrendingUp, FiZap, FiTarget, FiDribbble } from 'react-icons/fi';

export default function AdminEmployeePage() {
    const { userRole, department } = useAuth();
    const displayName = department ? `${department} Employee` : getDisplayNameForRole(userRole || '');

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    };

    const cardVariants = {
        hidden: { scale: 0.8, opacity: 0, rotateY: 45 },
        show: {
            scale: 1,
            opacity: 1,
            rotateY: 0,
            transition: {
                type: "spring" as const,
                stiffness: 120,
                damping: 12
            }
        },
        hover: {
            y: -15,
            scale: 1.05,
            transition: { duration: 0.4, ease: "easeOut" as const }
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen mesh-gradient-solar flex overflow-hidden selection:bg-orange-500/30">
                {/* Floating Background Orbs */}
                <div className="fixed inset-0 pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1],
                            x: [0, 50, 0],
                            y: [0, -50, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/20 blur-[120px] rounded-full"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.1, 0.3, 0.1],
                            x: [0, -100, 0],
                            y: [0, 100, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity, delay: 2 }}
                        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-teal-500/20 blur-[150px] rounded-full"
                    />
                </div>

                {/* Sidebar */}
                <EmployeeSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col relative z-20 overflow-hidden">
                    <Header
                        title={displayName}
                        subtitle={department ? "Administrative Unit" : "Advanced Operations Terminal"}
                        isDark={true}
                    />

                    <main className="flex-1 px-8 py-10 overflow-y-auto custom-scrollbar relative">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="max-w-7xl mx-auto"
                        >
                            {/* Activity content removed as requested */}
                            <div className="flex items-center justify-center p-20 text-white/20 font-bold uppercase tracking-[0.2em] italic">
                                Accessing Operational Data...
                            </div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
