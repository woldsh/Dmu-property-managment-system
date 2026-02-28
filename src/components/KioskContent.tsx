'use client';

import React, { useState } from 'react';
import { db } from '../lib/firebase'; // Assuming centralized firebase export
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FiSearch, FiCheckCircle, FiBox, FiClipboard, FiClock, FiX } from 'react-icons/fi';
import Image from 'next/image';

interface Item {
    id: string;
    materialName: string;
    materialCode: string;
    storeLocation: string;
    shelfNumber: string;
    quantity: number;
    unit: string;
    image?: string;
    status?: string;
}

export default function KioskContent() {
    const [mode, setMode] = useState<'home' | 'search' | 'audit'>('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError('');
        setSearchResult(null);

        try {
            const materialsRef = collection(db!, 'materials');
            // Try searching by code first
            let q = query(materialsRef, where('materialCode', '==', searchQuery));
            let snapshot = await getDocs(q);

            if (snapshot.empty) {
                // Try name if code fails
                // Note: Firestore doesn't support substring search natively easily, so we might need strict match or client side
                // For Kiosk, let's assume specific Code or Exact Name for now, or maybe just fetch all and filter if dataset is small
                // But for scalability, let's assume direct lookup
                q = query(materialsRef, where('materialName', '==', searchQuery));
                snapshot = await getDocs(q);
            }

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                setSearchResult({ id: doc.id, ...doc.data() } as Item);
            } else {
                setError('Item not found. Please check the Code or Name.');
            }
        } catch (err) {
            console.error("Search error:", err);
            setError('System error. Please contact IT.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setMode('home');
        setSearchQuery('');
        setSearchResult(null);
        setError('');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <FiBox className="text-blue-500" />
                        Quick<span className="text-blue-500">Access</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-2">Warehouse Kiosk Terminal</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">{new Date().toLocaleDateString()}</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center">

                {/* HOME MODE */}
                {mode === 'home' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                        <button
                            onClick={() => setMode('search')}
                            className="bg-slate-800 hover:bg-blue-600 transition-all duration-300 p-12 rounded-3xl border border-slate-700 hover:border-blue-400 group flex flex-col items-center justify-center gap-6 shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 text-blue-500 transition-colors">
                                <FiSearch className="text-5xl" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-3xl font-black text-white mb-2">Item Lookup</h2>
                                <p className="text-slate-400 group-hover:text-blue-100 font-medium">Check Location & Stock</p>
                            </div>
                        </button>

                        <button
                            className="bg-slate-800 hover:bg-emerald-600 transition-all duration-300 p-12 rounded-3xl border border-slate-700 hover:border-emerald-400 group flex flex-col items-center justify-center gap-6 shadow-2xl opacity-50 cursor-not-allowed"
                        >
                            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600 text-emerald-500 transition-colors">
                                <FiClipboard className="text-5xl" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-3xl font-black text-white mb-2">Quick Audit</h2>
                                <p className="text-slate-400 group-hover:text-emerald-100 font-medium">Log Check (Coming Soon)</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* SEARCH MODE */}
                {mode === 'search' && (
                    <div className="w-full max-w-3xl animate-in zoom-in-95 duration-200">
                        <div className="mb-8">
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-wider text-sm mb-4"
                            >
                                <FiX className="text-lg" /> Cancel / Back
                            </button>
                            <h2 className="text-4xl font-black text-white">Scan or Enter Item Code</h2>
                        </div>

                        <form onSubmit={handleSearch} className="mb-12">
                            <div className="relative">
                                <input
                                    type="text"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="e.g. CS-2024-001"
                                    className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 rounded-3xl p-8 text-4xl font-black text-white placeholder:text-slate-600 outline-none shadow-inner transition-all text-center uppercase"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-4 top-4 bottom-4 px-8 bg-blue-600 rounded-2xl hover:bg-blue-500 transition-colors text-white font-black uppercase text-xl disabled:opacity-50"
                                >
                                    {loading ? '...' : 'GO'}
                                </button>
                            </div>
                            {error && (
                                <p className="text-red-400 font-bold mt-4 text-center text-lg animate-bounce flex items-center justify-center gap-2">
                                    <FiX /> {error}
                                </p>
                            )}
                        </form>

                        {searchResult && (
                            <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom-8 duration-500 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-emerald-500 text-xs font-black uppercase tracking-widest text-slate-900 px-6 py-2 rounded-bl-2xl">
                                    Product Found
                                </div>

                                <div className="w-full md:w-64 aspect-square bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden border border-slate-700 shrink-0">
                                    {searchResult.image ? (
                                        <Image src={searchResult.image} alt={searchResult.materialName} fill className="object-cover" />
                                    ) : (
                                        <FiBox className="text-8xl text-slate-700" />
                                    )}
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h3 className="text-3xl font-black text-white mb-2">{searchResult.materialName}</h3>
                                        <div className="bg-slate-900 inline-block px-4 py-2 rounded-lg border border-slate-700">
                                            <p className="font-mono text-blue-400 font-bold text-xl">{searchResult.materialCode}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-700">
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Location</p>
                                            <p className="text-2xl font-black text-white">{searchResult.storeLocation || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-700">
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Shelf</p>
                                            <p className="text-2xl font-black text-white">{searchResult.shelfNumber || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-700 col-span-2">
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Stock Level</p>
                                            <p className="text-4xl font-black text-white flex items-baseline gap-2">
                                                {searchResult.quantity} <span className="text-lg font-bold text-slate-500">{searchResult.unit}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={reset}
                                        className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-black uppercase tracking-widest transition-colors mt-auto"
                                    >
                                        Start New Search
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center text-slate-600 text-sm font-medium mt-12">
                <p>&copy; {new Date().getFullYear()} Property Management System &bull; Kiosk Terminal v1.0</p>
            </footer>
        </div>
    );
}
