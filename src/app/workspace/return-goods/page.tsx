'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiRefreshCw, FiShield, FiClock, FiChevronRight } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

export default function ReturnGoodsPage() {
    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6 bg-[#F8F9FA]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full bg-white rounded-[3rem] shadow-[0_20px_70px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden relative"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-3xl -mr-32 -mt-32 rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 blur-3xl -ml-32 -mb-32 rounded-full" />

                <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center gap-12">
                    {/* Visual Side */}
                    <div className="flex-1 relative">
                        <div className="w-full aspect-square bg-slate-50 rounded-[2.5rem] flex items-center justify-center relative group">
                            {/* Animated Background Rings */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border-2 border-dashed border-slate-200 rounded-full"
                            />

                            <div className="relative">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="text-8xl text-slate-900 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
                                >
                                    <FiRefreshCw />
                                </motion.div>

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg ring-4 ring-white"
                                >
                                    <FiPackage />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="flex-[1.2] space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 mb-6">
                                <span className="w-1.5 h-1.5 bg-slate-800 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Module Update: v2.4.0</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                                Return Goods <br />
                                <span className="text-blue-600">Infrastructure</span>
                            </h1>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed italic">
                                We're recalibrating the asset restoration pipeline for institutional-grade reliability.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <FiShield className="text-slate-400 mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-xs font-black text-slate-900">Final Verification</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <FiClock className="text-slate-400 mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ETA</p>
                                <p className="text-xs font-black text-slate-900">Next Sprint</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Optimizing Transaction Logic...</span>
                            </div>

                            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all hover:bg-slate-800 group flex items-center justify-center gap-3">
                                Notify Me on Deployment
                                <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] text-center pt-4 opacity-50">
                            Secure Asset Management System • Institutional Portal
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
