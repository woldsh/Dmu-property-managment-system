'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { FiBox, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { FaTools } from 'react-icons/fa';
import Image from 'next/image';

interface Material {
    id: string;
    materialName: string;
    materialCode: string;
    category: string;
    quantity: number;
    unit: string;
    storeLocation: string;
    shelfNumber: string;
    condition: string;
    image?: string;
}

export default function MaintenanceAlertsContent() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        if (!db) return;

        try {
            const materialsRef = collection(db, 'materials');
            const q = query(materialsRef, orderBy('materialName', 'asc'));
            const snapshot = await getDocs(q);

            const items = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Material))
                .filter(m => {
                    const condition = m.condition?.toLowerCase() || '';
                    return condition.includes('repair') || condition.includes('damaged');
                });

            setMaterials(items);
        } catch (error) {
            console.error("Error fetching maintenance alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <FaTools className="text-amber-600" />
                        Maintenance Alerts
                    </h1>
                    <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest pl-11">
                        Assets Requiring Technical Attention
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-bold text-sm shadow-sm"
                >
                    <FiRefreshCw /> Refresh Data
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Asset Details</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Condition</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Location</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {materials.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative flex-shrink-0">
                                                {m.image ? (
                                                    <Image src={m.image} alt={m.materialName} fill className="object-cover" />
                                                ) : (
                                                    <FiBox className="m-auto text-slate-300 text-xl" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{m.materialName}</p>
                                                <p className="text-xs font-mono text-slate-400 mt-1">{m.materialCode}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-medium text-slate-600">{m.category || '—'}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${m.condition?.toLowerCase().includes('damaged')
                                            ? 'bg-red-50 text-red-600 border border-red-100'
                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            {m.condition}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 inline-block">
                                            <p className="text-xs font-bold text-slate-600">{m.storeLocation || '—'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">
                                            <FiAlertCircle />
                                            Needs Attention
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {materials.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                            <FaTools className="text-3xl text-emerald-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">Operational Integrity High</h3>
                                        <p className="text-slate-400 text-sm mt-1">No pending maintenance or damage alerts found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
