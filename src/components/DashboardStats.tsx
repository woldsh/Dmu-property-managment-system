'use client';

import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStatsProps {
    title: string;
    value: number | string;
    subtitle: string;
    icon: LucideIcon;
    color: 'emerald' | 'solar' | 'blue' | 'purple' | 'rose';
    delay?: number;
}

export default function DashboardStats({ title, value, subtitle, icon: Icon, color, delay = 0 }: DashboardStatsProps) {
    const colorMap = {
        emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
        solar: 'from-orange-500/20 to-amber-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/10',
        blue: 'from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10',
        purple: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/10',
        rose: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10',
    };

    const iconBgMap = {
        emerald: 'bg-emerald-500/10',
        solar: 'bg-orange-500/10',
        blue: 'bg-blue-500/10',
        purple: 'bg-purple-500/10',
        rose: 'bg-rose-500/10',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`relative group overflow-hidden rounded-[2.5rem] border p-8 bg-gradient-to-br transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${colorMap[color]}`}
        >
            {/* Background Glow */}
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:scale-150 ${iconBgMap[color]}`} />

            <div className="relative flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-2xl ${iconBgMap[color]} group-hover:scale-110 transition-transform duration-500`}>
                        <Icon className="w-8 h-8" />
                    </div>
                </div>

                <div className="mt-2 text-pro-tracking">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] opacity-60 mb-1">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">{value}</span>
                    </div>
                    <p className="text-xs font-semibold opacity-50 mt-2 uppercase tracking-widest">{subtitle}</p>
                </div>
            </div>

            {/* Decorative Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full" />
        </motion.div>
    );
}
