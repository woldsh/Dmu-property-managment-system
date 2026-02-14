'use client';

import RegisterUser from '@/components/RegisterUser';
import { motion } from 'framer-motion';

export default function EnrollPersonnelPage() {
    return (
        <div className="min-h-full pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto space-y-12">

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />
                <div className="p-8 md:p-12">
                    <RegisterUser />
                </div>
            </motion.div>
        </div>
    );
}
