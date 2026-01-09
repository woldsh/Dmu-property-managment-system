'use client';

import Header from '@/components/Header';
import EmployeeSidebar from '@/components/EmployeeSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { getDisplayNameForRole } from '@/utils/routeConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiBox, FiCheckCircle, FiActivity, FiInbox, FiTrendingUp, FiZap, FiTarget, FiDribbble } from 'react-icons/fi';

export default function AdminEmployeePage() {
    const { userRole } = useAuth();
    const displayName = getDisplayNameForRole(userRole || '');

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
                    <Header title={displayName} subtitle="Advanced Operations Terminal" isDark={true} />

                    <main className="flex-1 px-8 py-10 overflow-y-auto custom-scrollbar relative">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="max-w-7xl mx-auto"
                        >
                            {/* Hero Typography Section */}
                            <motion.div
                                variants={{
                                    hidden: { x: -50, opacity: 0 },
                                    show: { x: 0, opacity: 1, transition: { duration: 0.8 } }
                                }}
                                className="mb-20 space-y-6"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.3em]">
                                    <FiZap className="animate-pulse" /> System Active
                                </div>
                                <h1 className="text-7xl font-black text-white tracking-[-0.04em] leading-[0.9] uppercase italic">
                                    Strategic<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-teal-400 to-orange-400 bg-[length:200%_auto] animate-text-shimmer not-italic">Workflow</span>
                                </h1>
                                <p className="text-white/40 font-bold text-xl max-w-xl leading-relaxed">
                                    Your operational parameters are synchronized. Deploy resources and track departmental velocity in real-time.
                                </p>
                            </motion.div>

                            {/* Advanced Stats Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
                                {[
                                    { label: 'Actionable Items', val: '02', icon: FiInbox, glow: 'orange', trend: '+12%' },
                                    { label: 'Resource Load', val: '14', icon: FiBox, glow: 'teal', trend: 'Stable' },
                                    { label: 'Success Index', val: '89', icon: FiTarget, glow: 'rose', trend: '+5.4%' }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        variants={cardVariants}
                                        whileHover="hover"
                                        className="relative group h-80"
                                    >
                                        <div className={`absolute -inset-1 bg-gradient-to-r ${stat.glow === 'orange' ? 'from-orange-500' : stat.glow === 'teal' ? 'from-teal-500' : 'from-rose-500'} to-transparent rounded-[3rem] blur opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />

                                        <div className="relative h-full premium-glass rounded-[3rem] p-10 flex flex-col justify-between overflow-hidden border-white/5 bg-black/40">
                                            <div className="flex items-start justify-between">
                                                <div className={`w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl transition-transform duration-500 group-hover:rotate-12 ${stat.glow === 'orange' ? 'text-orange-400' : stat.glow === 'teal' ? 'text-teal-400' : 'text-rose-400'
                                                    }`}>
                                                    <stat.icon />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Trend</p>
                                                    <p className="text-teal-400 font-black italic">{stat.trend}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] mb-3">{stat.label}</h3>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{stat.val}</span>
                                                    {stat.val !== '89' && <span className="text-2xl font-black text-white/20 italic tracking-tighter uppercase tracking-[-0.1em]">Units</span>}
                                                    {stat.val === '89' && <span className="text-4xl font-black text-rose-500 italic tracking-tighter">%</span>}
                                                </div>
                                            </div>

                                            {/* Micro Sparkline Simulation */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden flex gap-1 px-4 mb-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(b => (
                                                    <motion.div
                                                        key={b}
                                                        animate={{ height: [4, Math.random() * 24, 4] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, delay: b * 0.1 }}
                                                        className={`flex-1 rounded-t-full ${stat.glow === 'orange' ? 'bg-orange-500' : stat.glow === 'teal' ? 'bg-teal-500' : 'bg-rose-500'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Console / Activity Hub */}
                            <motion.div
                                variants={cardVariants}
                                className="premium-glass rounded-[4rem] p-16 border-white/5 relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.8)]" />
                                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Live Activity <span className="text-teal-400 not-italic">Stream</span></h3>
                                            </div>
                                            <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Asynchronous update acknowledging all nodes</p>
                                        </div>

                                        <div className="space-y-8">
                                            {[
                                                { t: '14:22', msg: 'Core Resource Allocation #4012 Finalized', color: 'orange' },
                                                { t: '09:05', msg: 'System Audit: 422 nodes verified across sectors', color: 'teal' },
                                                { t: 'Prev', msg: 'Global Security Protocol Alpha Re-Engaged', color: 'white' }
                                            ].map((log, li) => (
                                                <motion.div
                                                    key={li}
                                                    whileHover={{ x: 10 }}
                                                    className="flex items-center gap-6 group/log cursor-pointer"
                                                >
                                                    <div className="text-[11px] font-black text-white/20 uppercase tracking-widest w-12">{log.t}</div>
                                                    <div className={`h-[1px] flex-1 bg-gradient-to-r ${log.color === 'orange' ? 'from-orange-500/50' : log.color === 'teal' ? 'from-teal-500/50' : 'from-white/10'} to-transparent group-hover/log:from-white/40 transition-all`} />
                                                    <div className="text-sm font-bold text-white/70 group-hover/log:text-white transition-colors uppercase tracking-tight">{log.msg}</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center p-10 bg-black/40 rounded-[3rem] border border-white/5 relative overflow-hidden">
                                        <FiDribbble className="text-[120px] text-teal-400/10 absolute -top-10 -right-10 rotate-12" />
                                        <div className="text-center space-y-4 relative z-10">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Terminal Health</p>
                                            <div className="relative">
                                                <span className="text-8xl font-black text-white italic tracking-tighter leading-none">99</span>
                                                <span className="text-5xl font-black text-orange-400 italic">.9</span>
                                            </div>
                                            <p className="text-xs font-black text-teal-400 uppercase tracking-widest bg-teal-400/10 px-6 py-2 rounded-full inline-block">Absolute Uptime</p>
                                        </div>

                                        {/* Dynamic Scanline Effect */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                                            <motion.div
                                                animate={{ y: ['0%', '100%'] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                                className="w-full h-1 bg-teal-400 blur-sm shadow-[0_0_20px_10px_rgba(20,184,166,0.5)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
