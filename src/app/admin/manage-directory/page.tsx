'use client';

import UserManagement from '@/components/UserManagement';
import { motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';

export default function ManageDirectoryPage() {
    return (
        <div className="min-h-full pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto space-y-12">
            <div className="pt-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                        <FiUsers className="text-blue-600 text-xs" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Employee Management</span>
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                        Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">Employee</span>
                    </h2>
                    <p className="text-slate-400 font-bold text-lg max-w-xl leading-relaxed">
                        Audit and manage institutional personnel records, roles, and status.
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />
                <div className="p-8 md:p-12 min-h-[600px]">
                    <UserManagement />
                </div>
            </motion.div>
        </div>
    );
}
