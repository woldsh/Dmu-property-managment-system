'use client';

import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import {
    FiSearch, FiBox, FiCalendar, FiTag,
    FiInfo, FiMapPin, FiActivity, FiLayers, FiShield,
    FiUser, FiTruck, FiFileText, FiChevronRight, FiClock, FiCheckCircle
} from 'react-icons/fi';
import Image from 'next/image';

interface MaterialLookupProps {
    storeType: 'fixed_asset' | 'consumable';
}

export default function MaterialLookup({ storeType }: MaterialLookupProps) {
    const [searchCode, setSearchCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [material, setMaterial] = useState<any | null>(null);
    const [handoutHistory, setHandoutHistory] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchCode.trim()) return;

        setLoading(true);
        setError(null);
        setMaterial(null);
        setHandoutHistory([]);

        try {
            // 1. Fetch Material details from 'materials'
            const matQuery = query(
                collection(db!, 'materials'),
                where('materialCode', '==', searchCode.trim())
            );
            const matSnap = await getDocs(matQuery);

            if (!matSnap.empty) {
                setMaterial({ id: matSnap.docs[0].id, ...matSnap.docs[0].data() });
            }

            // 2. Fetch Handout History from 'Send_to_Users'
            // Since material_details is an array, we fetch recent records and filter client-side
            const handoutQuery = query(
                collection(db!, 'Send_to_Users'),
                orderBy('created_at', 'desc'),
                limit(50)
            );
            const handoutSnap = await getDocs(handoutQuery);

            const filteredHandouts = handoutSnap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((record: any) =>
                    record.material_details?.some((item: any) => item.materialCode === searchCode.trim())
                );

            setHandoutHistory(filteredHandouts);

            if (matSnap.empty && filteredHandouts.length === 0) {
                setError('No registry or handout data found for this identifier.');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('An error occurred while retrieving secure registry data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-slate-50/50 p-6 lg:p-10 space-y-8 max-w-[1500px] mx-auto">

            {/* --- COORDINATED SEARCH HEADER --- */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <FiSearch className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Material Intelligence</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Cross-Registry Decoder</p>
                    </div>
                </div>

                <div className="flex-1 max-w-2xl w-full flex gap-3">
                    <div className="relative flex-1 group">
                        <FiTag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="SCAN CODE (e.g. uiuio)..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 uppercase"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Execute'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="max-w-xl mx-auto bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-center gap-4 text-rose-600 animate-in fade-in slide-in-from-top-4">
                    <FiInfo className="text-xl shrink-0" />
                    <p className="font-bold text-sm tracking-wide">{error}</p>
                </div>
            )}

            {/* --- PROFESSIONAL STRUCTURED DASHBOARD --- */}
            {(material || handoutHistory.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start overflow-hidden animate-in fade-in duration-700">

                    {/* LEFT SIDEBAR: Visual Identity & Key Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        {material && (
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-6 flex flex-col gap-8 animate-in slide-in-from-left-10">
                                {/* Material Image */}
                                <div className="aspect-square bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden relative shadow-inner">
                                    {material.image ? (
                                        <Image
                                            src={material.image}
                                            alt={material.materialName}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200">
                                            <FiBox className="text-[100px]" />
                                        </div>
                                    )}
                                </div>

                                {/* Essential Data Points */}
                                <div className="space-y-4">
                                    <div className="p-5 bg-slate-900 rounded-3xl text-white">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Registry Qty</p>
                                            <FiActivity className="text-indigo-400" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black tabular-nums">
                                                {(material.quantity || 0) + handoutHistory.reduce((acc, curr) => {
                                                    const item = curr.material_details?.find((m: any) => m.materialCode === searchCode.trim());
                                                    return acc + (item?.quantity || 0);
                                                }, 0)}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{material.unit}</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 mt-2 italic">
                                            {material.quantity} in Stock + {handoutHistory.reduce((acc, curr) => {
                                                const item = curr.material_details?.find((m: any) => m.materialCode === searchCode.trim());
                                                return acc + (item?.quantity || 0);
                                            }, 0)} Issued
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">State</p>
                                            <p className="font-bold text-slate-700 text-sm">{material.condition}</p>
                                        </div>
                                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Class</p>
                                            <p className="font-bold text-slate-700 text-sm truncate">{material.category}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Store Location Map */}
                        {material && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6 animate-in slide-in-from-left-10 delay-200">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <FiMapPin className="text-indigo-500" /> Storage Node
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm py-3 border-b border-slate-100/50">
                                        <span className="font-bold text-slate-400">Warehouse</span>
                                        <span className="font-bold text-slate-800">Zone {material.storeLocation}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-3 border-b border-slate-100/50">
                                        <span className="font-bold text-slate-400">Shelf</span>
                                        <span className="font-bold text-slate-800">ID: {material.shelfNumber}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats Summary */}
                        <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-16 -mt-16"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 relative z-10">Lifecycle Pulse</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400 uppercase">Total Handouts</span>
                                    <span className="font-black text-indigo-400">{handoutHistory.length} Sessions</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400 uppercase">Confirmed Recipients</span>
                                    <span className="font-black text-emerald-400">
                                        {[...new Set(handoutHistory.map(h => h.requester_user_id))].length} Unique
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT: Detailed Specifications & Handout History */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Header Profile */}
                        {material && (
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 flex flex-col md:flex-row justify-between items-start gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm
                                            ${material.materialType === 'fixed_asset' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                            {material.materialType?.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs font-mono font-black text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                                            SIGNATURE: {searchCode}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                                        {material.materialName}
                                    </h1>
                                    <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">
                                        {material.description || 'No specialized narrative logged for this material entity.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Section 2: Handout Activity (Send_to_Users Integration) */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Handout Registry Log</h4>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full">
                                    <FiClock /> SECURE SNAPSHOT
                                </div>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {handoutHistory.length > 0 ? (
                                    handoutHistory.map((handout, idx) => (
                                        <div key={handout.id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Qty</span>
                                                    <span className="text-xl font-black text-slate-900 leading-none">
                                                        {handout.material_details?.find((m: any) => m.materialCode === searchCode.trim())?.quantity || 0}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-slate-800 tracking-tight">{handout.requester_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Requester ID: {handout.requester_user_id?.slice(0, 8)}...</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 justify-end">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</p>
                                                    <p className="text-xs font-bold text-slate-700">{new Date(handout.sharedAt).toLocaleDateString()} {new Date(handout.sharedAt).toLocaleTimeString()}</p>
                                                </div>
                                                <div className={`px-5 py-2 rounded-full border flex items-center gap-2
                                                    ${handout.status === 'handout_completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                    <FiCheckCircle className="text-sm" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{handout.status?.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center flex flex-col items-center justify-center">
                                        <FiActivity className="text-4xl text-slate-100 mb-4" />
                                        <p className="text-slate-300 font-bold text-sm tracking-wide">No historical handout records found for this code.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Technical Specs & Valuation */}
                        {material && (
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                                <div className="p-10 bg-slate-50/30 flex flex-col md:flex-row justify-between gap-10">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Valuation</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter">{material.totalPrice?.toLocaleString()}</p>
                                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">{material.currency}</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Aggregate Value</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Entity</p>
                                            <p className="text-sm font-bold text-slate-700 flex items-center gap-2 truncate">
                                                <FiTruck className="text-indigo-500" /> {material.vendorName || 'Independent'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custodian</p>
                                            <p className="text-sm font-bold text-slate-700 flex items-center gap-2 truncate">
                                                <FiUser className="text-indigo-500" /> {material.responsiblePerson}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Official Serial Number</p>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-sm font-black text-center text-slate-500">
                                            {material.serialNumber || 'DECLARED_N/A'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Protection Expiry</p>
                                        <div className={`p-4 rounded-2xl border font-black text-xs text-center flex items-center justify-center gap-2
                                            ${material.expiryDate ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            <FiCalendar /> {material.expiryDate || 'PERMANENT_ASSET'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- EMPTY STATE: PROFESSIONAL STANDBY --- */}
            {!material && handoutHistory.length === 0 && !loading && !error && (
                <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-slate-200 shadow-sm animate-in fade-in duration-1000">
                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-100 mb-8">
                        <FiLayers className="text-6xl" />
                    </div>
                    <h3 className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Intelligence Hub Standby</h3>
                    <p className="text-slate-400 text-sm font-bold mt-4 italic tracking-wide">Enter Material Identifier to Decode Registry</p>
                </div>
            )}

            <style jsx global>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-top { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slide-in-bottom { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slide-in-left { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                
                .animate-in { animation: fade-in 0.6s ease-out forwards; }
                .slide-in-from-top-4 { animation: slide-in-top 0.4s ease-out forwards; }
                .slide-in-from-left-10 { animation: slide-in-left 0.6s ease-out forwards; }
                .delay-200 { animation-delay: 200ms; }
            `}</style>
        </div>
    );
}
