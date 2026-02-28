'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import {
    FiSearch,
    FiFilter,
    FiEye,
    FiBox,
    FiTag,
    FiInfo,
    FiCalendar,
    FiDollarSign,
    FiUser,
    FiMapPin,
    FiLayers,
    FiX,
    FiShield
} from 'react-icons/fi';
import Image from 'next/image';

interface Material {
    id: string;
    category: string;
    condition: string;
    createdAt: string;
    currency: string;
    description: string;
    image: string;
    materialCode: string;
    materialName: string;
    materialType: 'fixed_asset' | 'consumable';
    purchaseDate: string;
    quantity: number;
    remarks: string;
    responsiblePerson: string;
    serialNumber: string;
    shelfNumber: string;
    storeLocation: string;
    tags: string;
    totalPrice: number;
    unit: string;
    unitPrice: number;
    vendorName: string;
    warrantyDate: string;
    expiryDate?: string;
}

interface MaterialListProps {
    typeFilter?: 'fixed_asset' | 'consumable';
}

export default function MaterialList({ typeFilter }: MaterialListProps) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCondition, setSelectedCondition] = useState('All');
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

    useEffect(() => {
        if (!db) return;
        const q = query(collection(db!, 'materials'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const materialList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Material[];

            const filtered = typeFilter
                ? materialList.filter(m => m.materialType === typeFilter)
                : materialList;

            setMaterials(filtered);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [typeFilter]);

    useEffect(() => {
        let result = materials;

        if (searchTerm) {
            result = result.filter(m =>
                m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.materialCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            result = result.filter(m => m.category === selectedCategory);
        }

        if (selectedCondition !== 'All') {
            result = result.filter(m => m.condition === selectedCondition);
        }

        setFilteredMaterials(result);
    }, [searchTerm, selectedCategory, selectedCondition, materials]);

    const categories = ['All', ...Array.from(new Set(materials.map(m => m.category)))];
    const conditions = ['All', ...Array.from(new Set(materials.map(m => m.condition)))];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="relative min-w-[140px]">
                            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm appearance-none cursor-pointer"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="relative min-w-[140px]">
                            <FiInfo className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <select
                                value={selectedCondition}
                                onChange={(e) => setSelectedCondition(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm appearance-none cursor-pointer"
                            >
                                {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    <FiBox />
                    Showing {filteredMaterials.length} Materials
                </div>
            </div>

            {/* Materials Table/Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Material</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Type/Category</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Quantity/Unit</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMaterials.map((m) => {
                                // Expiry Logic
                                const isExpiring = m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                                const isExpired = m.expiryDate && new Date(m.expiryDate) < new Date();

                                return (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                                                    {m.image ? (
                                                        <Image
                                                            src={m.image}
                                                            alt={m.materialName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <FiBox className="m-auto text-slate-300 text-xl h-full" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{m.materialName}</p>
                                                    <p className="text-[10px] font-mono text-slate-500">{m.materialCode}</p>
                                                    {isExpired ? (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-wider mt-1">Expired</span>
                                                    ) : isExpiring ? (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-wider mt-1">Expiring Soon</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-1 ${m.materialType === 'fixed_asset' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                                                }`}>
                                                {m.materialType === 'fixed_asset' ? 'Fixed Asset' : 'Consumable'}
                                            </span>
                                            <p className="text-xs font-medium text-slate-500">{m.category}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-slate-800 text-sm">{m.quantity}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{m.unit}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
                                                <FiMapPin className="text-slate-400" />
                                                <span>Loc: {m.storeLocation} | Shelf: {m.shelfNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${m.condition === 'New' ? 'bg-blue-100 text-blue-700' :
                                                m.condition === 'Good' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {m.condition}
                                            </span>
                                            {m.expiryDate && (
                                                <p className="text-[10px] font-mono text-slate-400 mt-1">
                                                    Exp: {new Date(m.expiryDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedMaterial(m)}
                                                className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <FiEye className="text-lg" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {filteredMaterials.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                <FiBox className="text-2xl text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No materials matched your search</p>
                        </div>
                    )}
                </div>
            </div>

            {/* View Details Modal (Read Only) */}
            {selectedMaterial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${selectedMaterial.materialType === 'fixed_asset' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'}`}>
                                    <FiBox className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedMaterial.materialName}</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Store Inventory Archive</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedMaterial(null)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                            >
                                <FiX className="text-2xl" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Left: Image & Quick Stats */}
                                <div className="space-y-6">
                                    <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden relative shadow-inner">
                                        {selectedMaterial.image ? (
                                            <Image
                                                src={selectedMaterial.image}
                                                alt={selectedMaterial.materialName}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <FiBox className="m-auto text-slate-200 text-6xl h-full" />
                                        )}
                                    </div>

                                    <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-xl">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Operational Stats</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-bold">In-Stock</span>
                                            <span className="text-xl font-black">{selectedMaterial.quantity} {selectedMaterial.unit}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-bold">Total Valuation</span>
                                            <span className="text-xl font-black">{selectedMaterial.totalPrice.toLocaleString()} {selectedMaterial.currency}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Detailed Metadata */}
                                <div className="md:col-span-2 space-y-8">
                                    {/* Categorization Section */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Identification</p>
                                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                                                <FiTag className="text-slate-400" />
                                                <span className="font-mono text-sm font-bold truncate">{selectedMaterial.materialCode}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Condition Status</p>
                                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                                                <FiInfo className="text-slate-400" />
                                                <span className="text-sm font-bold">{selectedMaterial.condition}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Physical Mapping */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-[0.1em]">
                                            <FiMapPin className="text-blue-500" /> Organizational Mapping
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {[
                                                { label: 'Store Location', value: selectedMaterial.storeLocation, icon: FiMapPin },
                                                { label: 'Shelf/Rack No', value: selectedMaterial.shelfNumber, icon: FiLayers },
                                                { label: 'Responsible', value: selectedMaterial.responsiblePerson, icon: FiUser }
                                            ].map((item, i) => (
                                                <div key={i} className="p-4 border border-slate-100 rounded-2xl">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{item.label}</p>
                                                    <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                        <item.icon className="text-slate-300" /> {item.value || 'N/A'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Financial Audit */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-[0.1em]">
                                            <FiDollarSign className="text-emerald-500" /> Fiscal Intelligence
                                        </h4>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Unit Price', value: `${selectedMaterial.unitPrice} ${selectedMaterial.currency}` },
                                                { label: 'Vendor Entity', value: selectedMaterial.vendorName },
                                                { label: 'Purchase Date', value: selectedMaterial.purchaseDate },
                                                { label: 'Warranty/Expiry', value: selectedMaterial.warrantyDate || 'None' }
                                            ].map((item, i) => (
                                                <div key={i} className="p-4 border border-slate-100 rounded-2xl">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{item.label}</p>
                                                    <p className="font-bold text-slate-800 text-[11px] truncate">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description / Remarks */}
                                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Narrative / Remarks</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed italic">{selectedMaterial.description || 'No additional narrative provided for this item.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-400 underline decoration-slate-200">
                                <FiCalendar />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Added to Store: {new Date(selectedMaterial.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FiShield /> Read-Only Authorization Active
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: fade-in 0.4s ease-out forwards; }
        .slide-in-from-bottom-8 { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
        </div>
    );
}
