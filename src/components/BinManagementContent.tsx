'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { FiBox, FiMapPin, FiGrid, FiMove, FiSearch, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
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
    category?: string;
}

interface BinGroup {
    location: string;
    shelves: {
        [shelf: string]: Material[];
    };
}

export default function BinManagementContent() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveTarget, setMoveTarget] = useState({ location: '', shelf: '' });
    const [isMoving, setIsMoving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        if (!db) return;

        try {
            const materialsRef = collection(db, 'materials');
            const q = query(materialsRef, orderBy('storeLocation'), orderBy('shelfNumber'));
            const snapshot = await getDocs(q);

            const fetchedMaterials = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Material));

            setMaterials(fetchedMaterials);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching bin data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Grouping Logic
    const groupedData = materials.reduce((acc, item) => {
        const loc = item.storeLocation || 'Unassigned';
        const shelf = item.shelfNumber || 'No Shelf';

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            if (!item.materialName.toLowerCase().includes(lowerSearch) &&
                !item.materialCode.toLowerCase().includes(lowerSearch) &&
                !loc.toLowerCase().includes(lowerSearch) &&
                !shelf.toLowerCase().includes(lowerSearch)) {
                return acc;
            }
        }

        if (!acc[loc]) {
            acc[loc] = {};
        }
        if (!acc[loc][shelf]) {
            acc[loc][shelf] = [];
        }
        acc[loc][shelf].push(item);
        return acc;
    }, {} as { [loc: string]: { [shelf: string]: Material[] } });

    const handleSelectItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkMove = async () => {
        if (!moveTarget.location || !moveTarget.shelf) {
            alert("Please specify both target Location and Shelf.");
            return;
        }

        setIsMoving(true);
        try {
            const updatePromises = selectedItems.map(id => {
                const itemRef = doc(db, 'materials', id);
                return updateDoc(itemRef, {
                    storeLocation: moveTarget.location,
                    shelfNumber: moveTarget.shelf
                });
            });

            await Promise.all(updatePromises);

            await fetchData();
            setSelectedItems([]);
            setIsMoveModalOpen(false);
            setMoveTarget({ location: '', shelf: '' });
        } catch (error) {
            console.error("Error moving items:", error);
            alert("Failed to move items. Please try again.");
        } finally {
            setIsMoving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1700px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <FiGrid className="text-blue-600" />
                        Bin Location Management
                    </h1>
                    <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest pl-11">
                        Visualize and Organize Warehouse Storage
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search items, locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-64 transition-all font-bold text-slate-600"
                        />
                    </div>

                    {selectedItems.length > 0 && (
                        <button
                            onClick={() => setIsMoveModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black uppercase text-xs tracking-wider shadow-lg shadow-blue-200 active:scale-95"
                        >
                            <FiMove /> Move ({selectedItems.length}) Items
                        </button>
                    )}

                    <button
                        onClick={fetchData}
                        className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
                    >
                        <FiRefreshCw />
                    </button>
                </div>
            </div>

            {/* Visualization Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                {Object.entries(groupedData).map(([location, shelves]) => (
                    <div key={location} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex justify-between items-center backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-lg shadow-inner">
                                    <FiMapPin />
                                </div>
                                <h2 className="text-lg font-black text-slate-800 tracking-tight">{location}</h2>
                            </div>
                            <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                                {Object.keys(shelves).length} Shelves
                            </span>
                        </div>

                        <div className="p-6 space-y-6 flex-1 bg-slate-50/30">
                            {Object.entries(shelves).map(([shelf, items]) => (
                                <div key={shelf} className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden hover:border-blue-200 transition-colors shadow-sm">
                                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                        <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                            <FiBox className="text-slate-400" /> {shelf}
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-400">{items.length} Items</span>
                                    </div>
                                    <div className="p-2 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                                        {items.map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelectItem(item.id)}
                                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${selectedItems.includes(item.id)
                                                        ? 'bg-blue-50 border-blue-200 shadow-inner'
                                                        : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedItems.includes(item.id)
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-slate-300'
                                                    }`}>
                                                    {selectedItems.includes(item.id) && <FiCheck className="text-white text-[8px]" />}
                                                </div>
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200">
                                                    {item.image && <Image src={item.image} alt="" fill className="object-cover" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-700 truncate">{item.materialName}</p>
                                                    <p className="text-[10px] font-mono text-slate-400 truncate">{item.materialCode}</p>
                                                </div>
                                                <span className="text-xs font-black text-slate-600 whitespace-nowrap px-2 py-1 bg-slate-100 rounded-lg">
                                                    {item.quantity} <span className="text-[8px] uppercase text-slate-400">{item.unit.substring(0, 2)}</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Move Modal */}
            {isMoveModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-blue-600 p-6 flex items-center justify-between">
                            <h3 className="text-white font-black text-lg flex items-center gap-2">
                                <FiMove /> Move {selectedItems.length} Items
                            </h3>
                            <button onClick={() => setIsMoveModalOpen(false)} className="text-blue-200 hover:text-white transition-colors">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Location</label>
                                    <input
                                        type="text"
                                        value={moveTarget.location}
                                        onChange={(e) => setMoveTarget(prev => ({ ...prev, location: e.target.value }))}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700"
                                        placeholder="e.g. Warehouse A"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Shelf / Bin</label>
                                    <input
                                        type="text"
                                        value={moveTarget.shelf}
                                        onChange={(e) => setMoveTarget(prev => ({ ...prev, shelf: e.target.value }))}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700"
                                        placeholder="e.g. Rack 4, Shelf B"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setIsMoveModalOpen(false)}
                                    className="flex-1 py-4 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkMove}
                                    disabled={isMoving}
                                    className="flex-1 py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isMoving ? 'Moving...' : 'Confirm Move'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
