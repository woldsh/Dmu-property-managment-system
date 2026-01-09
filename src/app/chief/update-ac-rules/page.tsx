'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChiefSidebar from '@/components/ChiefSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, getDoc, deleteDoc } from 'firebase/firestore';
import {
    FaShieldAlt,
    FaSearch,
    FaBoxOpen,
    FaExclamationTriangle,
    FaSave,
    FaSpinner,
    FaCheckCircle,
    FaRegHandPaper,
    FaArrowRight,
    FaTrashAlt
} from 'react-icons/fa';

interface Material {
    id: string;
    materialName: string;
    materialCode: string;
    quantity: number;
    category: string;
    image?: string;
    lowStockAmount: number;
    maxRequestAmount: number;
}

interface ACRule {
    lowStockAmount: number;
    maxRequestAmount: number;
}

export default function UpdateACRulesPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [formData, setFormData] = useState<ACRule>({
        lowStockAmount: 0,
        maxRequestAmount: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    // Fetch materials with existing rules
    useEffect(() => {
        const fetchRuledMaterials = async () => {
            if (!db) return;
            try {
                // 1. Fetch all rules
                const rulesSnapshot = await getDocs(collection(db, 'AC_rules'));
                const rulesData = rulesSnapshot.docs.reduce((acc, doc) => {
                    acc[doc.id] = doc.data() as ACRule;
                    return acc;
                }, {} as Record<string, ACRule>);

                const ruledIds = Object.keys(rulesData);
                if (ruledIds.length === 0) {
                    setMaterials([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch corresponding materials to get latest stock/image
                // Note: Firestore 'in' query is limited to 10-30 IDs usually, 
                // but since we want to show all governed materials, we fetch them.
                const materialsSnapshot = await getDocs(collection(db, 'materials'));
                const allMaterials = materialsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as any[];

                const mergedMaterials = allMaterials
                    .filter(m => ruledIds.includes(m.id))
                    .map(m => ({
                        ...m,
                        lowStockAmount: rulesData[m.id].lowStockAmount,
                        maxRequestAmount: rulesData[m.id].maxRequestAmount
                    })) as Material[];

                setMaterials(mergedMaterials);
            } catch (err) {
                console.error("Error fetching ruled materials:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRuledMaterials();
    }, []);

    // Sync form data with selected material
    useEffect(() => {
        if (selectedMaterial) {
            setFormData({
                lowStockAmount: selectedMaterial.lowStockAmount,
                maxRequestAmount: selectedMaterial.maxRequestAmount
            });
            setShowDeleteConfirm(false);
        }
        setStatus({ type: null, message: '' });
    }, [selectedMaterial]);

    const filteredMaterials = materials.filter(m =>
        m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.materialCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMaterial) return;

        setIsSubmitting(true);
        setStatus({ type: null, message: '' });

        try {
            if (!db) throw new Error("Firebase not initialized");
            await setDoc(doc(db, 'AC_rules', selectedMaterial.id), {
                materialId: selectedMaterial.id,
                materialName: selectedMaterial.materialName,
                materialCode: selectedMaterial.materialCode,
                lowStockAmount: formData.lowStockAmount,
                maxRequestAmount: formData.maxRequestAmount,
                updatedAt: serverTimestamp()
            });

            // Update local state
            setMaterials(prev => prev.map(m =>
                m.id === selectedMaterial.id
                    ? { ...m, lowStockAmount: formData.lowStockAmount, maxRequestAmount: formData.maxRequestAmount }
                    : m
            ));

            setStatus({ type: 'success', message: `Rules updated for ${selectedMaterial.materialName}` });
        } catch (err) {
            console.error("Error updating rule:", err);
            setStatus({ type: 'error', message: 'Failed to update rules. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedMaterial) return;

        setIsDeleting(true);
        setStatus({ type: null, message: '' });

        try {
            if (!db) throw new Error("Firebase not initialized");
            await deleteDoc(doc(db, 'AC_rules', selectedMaterial.id));

            // Remove from local list
            setMaterials(prev => prev.filter(m => m.id !== selectedMaterial.id));
            setSelectedMaterial(null);
            setShowDeleteConfirm(false);

            setStatus({ type: 'success', message: `Rules successfully deleted.` });
        } catch (err) {
            console.error("Error deleting rule:", err);
            setStatus({ type: 'error', message: 'Failed to delete rules. Please try again.' });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
                <ChiefSidebar />

                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Manage AC Rules" subtitle="Update or Remove Inventory Guardrails" />

                    <main className="flex-1 overflow-y-auto p-4 md:p-10">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Left Panel: Material Selection */}
                            <div className="lg:col-span-5 flex flex-col gap-6">
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
                                    <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">
                                            <FaShieldAlt className="text-amber-500" />
                                            Active Rule Registry
                                        </h3>
                                        <div className="relative">
                                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or code..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-medium text-slate-600 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                                <FaSpinner className="animate-spin text-3xl text-amber-500" />
                                                <p className="font-bold uppercase tracking-widest text-xs">Accessing Rules...</p>
                                            </div>
                                        ) : filteredMaterials.length > 0 ? (
                                            <div className="space-y-3">
                                                {filteredMaterials.map(m => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => setSelectedMaterial(m)}
                                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all group flex gap-4 ${selectedMaterial?.id === m.id
                                                            ? 'bg-amber-50 border-amber-500 shadow-amber-100 shadow-lg'
                                                            : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {/* Thumbnail Image */}
                                                        <div className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border ${selectedMaterial?.id === m.id ? 'border-amber-200' : 'border-slate-100'}`}>
                                                            {m.image ? (
                                                                <img src={m.image} alt={m.materialName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                                    <FaBoxOpen />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <div className="truncate">
                                                                    <h4 className={`font-black tracking-tight truncate ${selectedMaterial?.id === m.id ? 'text-amber-800' : 'text-slate-700'}`}>
                                                                        {m.materialName}
                                                                    </h4>
                                                                    <p className="text-xs font-bold text-slate-400 tracking-wider">CODE: {m.materialCode}</p>
                                                                </div>
                                                                <div className={`text-[10px] px-2 py-1 rounded-full font-black uppercase flex-shrink-0 ${m.quantity > 5 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    STK: {m.quantity}
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.category}</span>
                                                                <FaArrowRight className={`text-sm transition-transform ${selectedMaterial?.id === m.id ? 'translate-x-1 text-amber-500' : 'opacity-0 group-hover:opacity-100 text-slate-300'}`} />
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                                                <FaShieldAlt className="text-5xl mb-4" />
                                                <p className="font-bold">No active rules found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Rule Configuration */}
                            <div className="lg:col-span-7">
                                {selectedMaterial ? (
                                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 h-full">
                                        <div className="p-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white relative">
                                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                                <FaShieldAlt className="text-9xl" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Executive Override</span>
                                            <h2 className="text-3xl font-black tracking-tight mb-2">{selectedMaterial.materialName}</h2>

                                            {/* Material Image Display */}
                                            {selectedMaterial.image && (
                                                <div className="absolute top-8 right-8 w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl animate-in zoom-in-95 duration-500">
                                                    <img
                                                        src={selectedMaterial.image}
                                                        alt={selectedMaterial.materialName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex gap-4 mt-4">
                                                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold">
                                                    ID: {selectedMaterial.id.slice(0, 8)}...
                                                </div>
                                                <div className="bg-amber-500/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-amber-400 border border-amber-500/30">
                                                    STATUS: Active Rule
                                                </div>
                                            </div>
                                        </div>

                                        <form onSubmit={handleSubmit} className="p-10 space-y-10">
                                            {status.message && (
                                                <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in zoom-in-95 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-100' : 'bg-red-50 text-red-800 border-2 border-red-100'
                                                    }`}>
                                                    {status.type === 'success' ? <FaCheckCircle className="text-2xl" /> : <FaExclamationTriangle className="text-2xl" />}
                                                    <span className="font-black tracking-tight">{status.message}</span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                {/* Low Stock Amount */}
                                                <div className="space-y-4 group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg border border-amber-200 shadow-inner group-focus-within:bg-amber-500 group-focus-within:text-white transition-colors">
                                                            <FaExclamationTriangle />
                                                        </div>
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Update Low Stock Amount</label>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={formData.lowStockAmount === 0 ? '' : formData.lowStockAmount}
                                                            onChange={(e) => {
                                                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                                setFormData(prev => ({ ...prev, lowStockAmount: isNaN(val) ? 0 : val }));
                                                            }}
                                                            placeholder="0"
                                                            className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-8 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-black text-3xl text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-sm uppercase tracking-widest">Pieces</span>
                                                    </div>
                                                </div>

                                                {/* Max Request Amount */}
                                                <div className="space-y-4 group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg border border-orange-200 shadow-inner group-focus-within:bg-orange-500 group-focus-within:text-white transition-colors">
                                                            <FaRegHandPaper />
                                                        </div>
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Update Max Request Amount</label>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={formData.maxRequestAmount === 0 ? '' : formData.maxRequestAmount}
                                                            onChange={(e) => {
                                                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                                setFormData(prev => ({ ...prev, maxRequestAmount: isNaN(val) ? 0 : val }));
                                                            }}
                                                            placeholder="0"
                                                            className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-black text-3xl text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-sm uppercase tracking-widest">Units</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-10 border-t border-slate-100 space-y-6">
                                                <div className="flex justify-between items-center gap-6">
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                                                            disabled={isDeleting || isSubmitting}
                                                            className={`
                                                                px-8 py-5 border-2 border-red-100 text-red-600 font-black uppercase text-xs tracking-[0.2em] rounded-2xl
                                                                hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all
                                                                flex items-center gap-4 ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}
                                                            `}
                                                        >
                                                            <FaTrashAlt className="text-base" />
                                                            Remove Protocol
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting || isDeleting || showDeleteConfirm}
                                                        className={`
                                                            px-12 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black uppercase text-sm tracking-[0.2em] rounded-2xl
                                                            shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 active:scale-95 transition-all
                                                            flex items-center gap-4 ${(isSubmitting || showDeleteConfirm) ? 'opacity-70 cursor-not-allowed' : ''}
                                                        `}
                                                    >
                                                        {isSubmitting ? <FaSpinner className="animate-spin text-xl" /> : <FaSave className="text-lg" />}
                                                        {isSubmitting ? 'Updating Protocol...' : 'Save Changes'}
                                                    </button>
                                                </div>

                                                {/* Inline Confirmation UI */}
                                                {showDeleteConfirm && (
                                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2 duration-200 mt-4 max-w-sm ml-0">
                                                        <div className="space-y-4">
                                                            <div className="flex items-start gap-3">
                                                                <FaExclamationTriangle className="text-red-500 mt-0.5" />
                                                                <div>
                                                                    <h4 className="font-extrabold text-red-900 text-sm">Delete this rule?</h4>
                                                                    <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest leading-relaxed">This action is permanent.</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={confirmDelete}
                                                                    disabled={isDeleting}
                                                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-black uppercase text-[9px] tracking-widest rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    {isDeleting ? <FaSpinner className="animate-spin" /> : 'Delete'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowDeleteConfirm(false)}
                                                                    className="flex-1 px-4 py-2 bg-white text-slate-500 font-black uppercase text-[9px] tracking-widest rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[40px] h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center group">
                                        <div className="w-24 h-24 rounded-3xl bg-slate-100 text-slate-300 flex items-center justify-center text-5xl mb-6 group-hover:scale-110 group-hover:bg-amber-100 group-hover:text-amber-500 transition-all duration-500">
                                            <FaShieldAlt />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-400 tracking-tight mb-3">No Rule Selected</h3>
                                        <p className="text-slate-400 font-medium max-w-sm">Please select an existing rule from the registry on the left to modify or remove inventory governing protocols.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>
        </SidebarProvider>
    );
}

