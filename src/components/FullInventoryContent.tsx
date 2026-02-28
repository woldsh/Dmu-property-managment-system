'use client';

import React from 'react';
import MaterialList from './MaterialList';
import { FiLayers, FiBox } from 'react-icons/fi';

export default function FullInventoryContent() {
    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Master Inventory</h1>
                    <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">Complete Institutional Asset Record</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                        <FiLayers className="text-lg" />
                        <span className="text-xs font-black uppercase tracking-widest">Fixed Assets</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                        <FiBox className="text-lg" />
                        <span className="text-xs font-black uppercase tracking-widest">Consumables</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <MaterialList />
        </div>
    );
}
