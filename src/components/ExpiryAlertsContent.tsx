'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { FiAlertTriangle, FiCalendar, FiBox, FiFilter, FiRefreshCw } from 'react-icons/fi';
import Image from 'next/image';

interface Material {
    id: string;
    materialName: string;
    materialCode: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate?: string;
    storeLocation: string;
    image?: string;
}

export default function ExpiryAlertsContent() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'expired' | 'expiring'>('all');

    const fetchData = async () => {
        setLoading(true);
        if (!db) return;

        try {
            const materialsRef = collection(db, 'materials');
            const q = query(materialsRef, orderBy('createdAt', 'desc')); // Fetch all then filter client side for expiry
            const snapshot = await getDocs(q);

            const now = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(now.getDate() + 30);

            const expiringItems = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Material))
                .filter(m => m.expiryDate) // Only items with expiry
                .map(m => {
                    const exp = new Date(m.expiryDate!);
                    let status: 'expired' | 'expiring' | 'good' = 'good';
                    let daysRem = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    if (exp < now) status = 'expired';
                    else if (exp <= thirtyDaysFromNow) status = 'expiring';

                    return { ...m, status, daysRem };
                })
                .filter(m => m.status !== 'good') // Keep only expired or expiring soon
                .sort((a, b) => a.daysRem - b.daysRem); // Sort by days remaining (ascending)

            setMaterials(expiringItems as any);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching expiry data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredMaterials = materials.filter(m => {
        if (filter === 'all') return true;
        return (m as any).status === filter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <FiAlertTriangle className="text-rose-600" />
                        Expiry Management
                    </h1>
                    <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest pl-11">
                        Critical Inventory Alerts & Action Items
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-bold text-sm shadow-sm"
                >
                    <FiRefreshCw /> Refresh Data
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                {['all', 'expired', 'expiring'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${filter === f
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {f === 'all' ? 'All Alerts' : f}
                    </button>
                ))}
            </div>

            {/* Content Display */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Item Details</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Stock Level</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Location</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Expiry Status</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMaterials.map((m: any) => (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative flex-shrink-0">
                                                {m.image ? (
                                                    <Image src={m.image} alt={m.materialName} fill className="object-cover" />
                                                ) : (
                                                    <FiBox className="m-auto text-slate-300 text-2xl" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{m.materialName}</p>
                                                <p className="text-xs font-mono text-slate-400 mt-1">{m.materialCode}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-black text-slate-700">{m.quantity}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{m.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 inline-block">
                                            <p className="text-xs font-bold text-slate-600">{m.storeLocation}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex flex-col items-start gap-1`}>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${m.status === 'expired'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {m.status === 'expired' ? (
                                                    <><FiAlertTriangle /> Expired</>
                                                ) : (
                                                    <><FiCalendar /> Expiring Soon</>
                                                )}
                                            </span>
                                            <span className={`text-[10px] font-bold ${m.status === 'expired' ? 'text-rose-600' : 'text-amber-600'
                                                }`}>
                                                {m.status === 'expired'
                                                    ? `Expired ${Math.abs(m.daysRem)} days ago`
                                                    : `${m.daysRem} days remaining`
                                                }
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {new Date(m.expiryDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                                            Resolve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMaterials.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                            <FiBox className="text-3xl text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">All Good!</h3>
                                        <p className="text-slate-400 text-sm mt-1">No expiry alerts found matching your criteria.</p>
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
