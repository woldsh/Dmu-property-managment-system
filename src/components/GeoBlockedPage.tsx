'use client';

import { motion } from 'framer-motion';
import { Globe, ShieldX, MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';

export default function GeoBlockedPage() {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-[#020205] selection:bg-red-500/30">

            {/* Mesh Gradients - Red theme for blocked state */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-red-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[150px] rounded-full animate-pulse decoration-3000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-[580px]"
            >
                {/* Institutional Branding */}
                <div className="flex flex-col items-center mb-12">
                    <Link href="/" className="group flex flex-col items-center">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent" />
                            <Building2 className="text-black w-8 h-8 relative z-10" />
                        </motion.div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none mb-2">
                                DMU <span className="text-red-500 font-normal">PROPERTY SYSTEM</span>
                            </h2>
                            <span className="text-[9px] text-slate-500 font-black tracking-[0.4em] uppercase">REGIONAL RESTRICTION</span>
                        </div>
                    </Link>
                </div>

                {/* Ultra-Premium Glass Card */}
                <div className="backdrop-blur-[40px] bg-white/[0.03] border border-white/[0.08] rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] p-8 md:p-12 relative overflow-hidden group">

                    {/* Internal Glow Effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[60px] rounded-full group-hover:bg-red-500/20 transition-all duration-700" />

                    <div className="relative z-10">
                        {/* Icon Header */}
                        <div className="flex justify-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent" />
                                <ShieldX className="w-12 h-12 text-red-400 relative z-10" />
                            </motion.div>
                        </div>

                        {/* Main Content */}
                        <div className="text-center mb-10">
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-black uppercase tracking-tight mb-4 flex items-center gap-3 justify-center italic"
                            >
                                {language === 'am' ? 'አገልግሎት አይገኝም' : 'Service Not Available'}
                            </motion.h3>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-4"
                            >
                                <p className="text-slate-300 text-lg font-bold">
                                    {language === 'am'
                                        ? 'ይህ ስርዓት በኢትዮጵያ ውስጥ ብቻ ይገኛል'
                                        : 'This system is only available in Ethiopia'}
                                </p>

                                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-left">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <MapPin className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">
                                                {language === 'am' ? 'የክልል ገደብ' : 'Regional Restriction'}
                                            </h4>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                {language === 'am'
                                                    ? 'ከኢትዮጵያ ውጭ እየገቡ መሆኑን ተገንዝበናል። ይህ አገልግሎት በኢትዮጵያ ውስጥ ላሉ ተጠቃሚዎች ብቻ የተገደበ ነው።'
                                                    : 'We detected that you are accessing from outside Ethiopia. This service is restricted to users within Ethiopia only.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 text-xs text-slate-500 space-y-2">
                                    <p className="flex items-center justify-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        {language === 'am'
                                            ? 'የአይፒ አድራሻ ላይ የተመሠረተ ቦታ ማወቂያ'
                                            : 'IP-based Geolocation Detection'}
                                    </p>
                                    <p className="text-[10px] text-slate-600">
                                        {language === 'am'
                                            ? 'ለበለጠ ድጋፍ የኢንፎርሜሽን ቴክኖሎጂ ክፍልን ያነጋግሩ'
                                            : 'For support, contact the IT Systems Department'}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Language Toggle */}
                        <div className="flex justify-center pt-6">
                            <div className="inline-flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    ENGLISH
                                </button>
                                <button
                                    onClick={() => setLanguage('am')}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${language === 'am' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    አማርኛ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 text-center"
                >
                    <p className="text-slate-600 text-[10px] font-black tracking-[0.3em] uppercase">
                        {language === 'am' ? 'ደህንነቱ የተጠበቀ • ክልላዊ • የተገደበ' : 'Secure • Regional • Restricted'}
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
