'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
import { FiClipboard, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiPlay, FiSave } from 'react-icons/fi';
import Image from 'next/image';

interface Material {
    id: string;
    materialName: string;
    materialCode: string;
    quantity: number;
    unit: string;
    storeLocation: string;
    shelfNumber: string;
    image?: string;
}

interface CountItem extends Material {
    actualQuantity?: number;
    difference?: number;
    notes?: string;
    status: 'pending' | 'counted';
}

export default function CycleCountContent() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [countSession, setCountSession] = useState<CountItem[]>([]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchMaterials = async () => {
        setLoading(true);
        if (!db) return;
        try {
            const materialsRef = collection(db, 'materials');
            const q = query(materialsRef, orderBy('materialName'));
            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material));
            setMaterials(fetched);
        } catch (error) {
            console.error("Error fetching materials:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const startNewSession = () => {
        // Randomly select 5 items for cycle count
        const shuffled = [...materials].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5).map(item => ({
            ...item,
            status: 'pending'
        } as CountItem));

        setCountSession(selected);
        setIsSessionActive(true);
    };

    const handleCountUpdate = (id: string, actual: number) => {
        setCountSession(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    actualQuantity: actual,
                    difference: actual - item.quantity,
                    status: 'counted'
                };
            }
            return item;
        }));
    };

    const handleNoteUpdate = (id: string, note: string) => {
        setCountSession(prev => prev.map(item => {
            if (item.id === id) return { ...item, notes: note };
            return item;
        }));
    };

    const submitSession = async () => {
        if (!db) return;
        if (!confirm("Are you sure you want to finalize this cycle count? This will record discrepancies.")) return;

        setLoading(true);
        try {
            const sessionData = {
                date: new Date().toISOString(),
                items: countSession.map(item => ({
                    materialId: item.id,
                    materialName: item.materialName,
                    systemQty: item.quantity,
                    actualQty: item.actualQuantity,
                    difference: item.difference,
                    notes: item.notes || ''
                })),
                totalDiscrepancy: countSession.reduce((acc, item) => acc + Math.abs(item.difference || 0), 0)
            };

            await addDoc(collection(db, 'cycle_counts'), sessionData);

            // Optionally update inventory if requested (omitted for safety, just recording discrepancy)

            setIsSessionActive(false);
            setCountSession([]);
            alert("Cycle count submitted successfully!");
        } catch (error) {
            console.error("Error submitting cycle count:", error);
            alert("Failed to submit cycle count.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isSessionActive) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <FiClipboard className="text-emerald-600" />
                        Cycle Counting
                    </h1>
                    <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest pl-11">
                        Inventory Verification & Auditing
                    </p>
                </div>
                {!isSessionActive ? (
                    <button
                        onClick={startNewSession}
                        disabled={materials.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-black uppercase text-xs tracking-wider shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiPlay /> Start New Session
                    </button>
                ) : (
                    <button
                        onClick={() => setIsSessionActive(false)}
                        className="px-6 py-3 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 font-bold uppercase text-xs tracking-wider"
                    >
                        Cancel Session
                    </button>
                )}
            </div>

            {/* Active Session */}
            {isSessionActive && (
                <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <FiCheckCircle />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-800">Active Counting Session</h3>
                            <p className="text-xs text-emerald-600">Verify the physical quantity for the following {countSession.length} items.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {countSession.map((item, index) => (
                                <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-slate-50/50 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200">
                                        {item.image && <Image src={item.image} alt="" fill className="object-cover" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg">{item.materialName}</h4>
                                                <p className="text-xs font-mono text-slate-400 mt-1">{item.materialCode}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Qty</p>
                                                <p className="text-xl font-black text-slate-700">{item.quantity} <span className="text-xs font-medium">{item.unit}</span></p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-col md:flex-row gap-4 items-start md:items-end">
                                            <div className="w-full md:w-auto">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Actual Count</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    onChange={(e) => handleCountUpdate(item.id, parseInt(e.target.value) || 0)}
                                                    className={`w-full md:w-32 px-4 py-3 bg-white border-2 rounded-xl outline-none font-bold text-lg transition-all ${item.status === 'counted'
                                                        ? item.difference === 0
                                                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50/30'
                                                            : 'border-rose-200 text-rose-700 bg-rose-50/30'
                                                        : 'border-slate-200 focus:border-blue-500'
                                                        }`}
                                                    placeholder="Enter Qty"
                                                />
                                            </div>

                                            <div className="flex-1 w-full">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Discrepancy Notes</label>
                                                <input
                                                    type="text"
                                                    onChange={(e) => handleNoteUpdate(item.id, e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium focus:border-blue-500 transition-all placeholder:text-slate-300"
                                                    placeholder="Reason for variance (if any)..."
                                                />
                                            </div>

                                            {item.status === 'counted' && (
                                                <div className={`px-4 py-3 rounded-xl font-bold text-sm ${item.difference === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                    }`}>
                                                    {item.difference! > 0 ? '+' : ''}{item.difference} Variance
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                            <button
                                onClick={submitSession}
                                disabled={countSession.some(i => i.status === 'pending') || loading}
                                className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black uppercase text-xs tracking-wider shadow-lg shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : <><FiSave /> Submit Audit</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isSessionActive && (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <FiClipboard className="text-4xl text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Ready to Audit</h3>
                    <p className="text-slate-400 max-w-md mx-auto mt-2">
                        Start a new cycle count session to randomly verify inventory accuracy. Regular audits help maintain stock integrity.
                    </p>
                </div>
            )}
        </div>
    );
}
