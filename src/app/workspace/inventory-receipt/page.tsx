'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { FiFileText, FiPackage, FiClipboard } from 'react-icons/fi';

export default function WorkspaceInventoryReceiptPage() {
    return (
        <ProtectedRoute>
            <div className="p-8">
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                            <FiFileText className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Inventory Receipt</h1>
                            <p className="text-slate-500">Generate and manage inventory receipts</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100">
                            <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center mb-4">
                                <FiPackage className="text-xl text-white" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">Generate Receipt</h3>
                            <p className="text-sm text-slate-500 mb-4">Create new inventory receipt for processed items</p>
                            <button className="px-4 py-2 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors">
                                Create Receipt
                            </button>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center mb-4">
                                <FiClipboard className="text-xl text-white" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">View Receipts</h3>
                            <p className="text-sm text-slate-500 mb-4">Browse and manage past inventory receipts</p>
                            <button className="px-4 py-2 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-600 transition-colors">
                                View All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
