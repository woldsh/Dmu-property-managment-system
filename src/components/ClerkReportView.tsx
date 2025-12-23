'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, where, updateDoc, doc, getDoc } from 'firebase/firestore';
import { FiSearch, FiCode, FiUser, FiPackage, FiCheckCircle, FiClock, FiSend } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface MaterialDetail {
    materialName: string;
    materialCode?: string;
    materialType: string;
    quantity: number;
    unit: string;
}

interface SentCodeRecord {
    id: string;
    verification_code: string;
    requester_name: string;
    material_details: MaterialDetail[];
    status: string;
    created_at: any;
}

interface ClerkReportViewProps {
    materialTypeFilter?: 'fixed_asset' | 'consumable';
}

export default function ClerkReportView({ materialTypeFilter }: ClerkReportViewProps) {
    const [records, setRecords] = useState<SentCodeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmingSendId, setConfirmingSendId] = useState<string | null>(null);

    // Get current user from useAuth
    const { user } = useAuth();
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        if (!user?.uid) return;
        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'Users', user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUserData();
    }, [user?.uid]);

    const handleConfirmSend = async (id: string) => {
        try {
            await updateDoc(doc(db, 'Send_to_Users', id), {
                status: 'shared_with_store',
                sharedAt: new Date().toISOString() // Using ISO string for easier client-side parsing without dealing with serverTimestamp promise/latency issues in this context, or keep consistency if other fields use Firestore Timestamp.
            });
            setConfirmingSendId(null);
        } catch (error) {
            console.error("Error sending code to store:", error);
            alert("Failed to send code.");
        }
    };

    useEffect(() => {
        // Don't fetch if no user is logged in
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        // Determine if we should filter by requester_id
        // Clerks and Store Keepers should see all records (to verify them)
        // Others (Teachers, etc.) should only see their own records
        const isClerkOrStore =
            userData?.userRole?.includes('stock_clerk') ||
            userData?.userRole?.includes('store_keeper') ||
            userData?.userRole === 'procurement_team_leader';

        let q;
        if (isClerkOrStore) {
            // Clerks see everything
            q = query(collection(db, 'Send_to_Users'));
        } else {
            // Individual users see only their own reports
            q = query(
                collection(db, 'Send_to_Users'),
                where('requester_user_id', '==', user.uid)
            );
        }

        // Safety Timeout to stop loading if Firestore hangs
        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 5000);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            clearTimeout(timeoutId);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SentCodeRecord[];

            // Sort client-side to avoid needing a composite index
            const sortedData = data.sort((a, b) => {
                const timeA = a.created_at?.seconds || 0;
                const timeB = b.created_at?.seconds || 0;
                return timeB - timeA;
            });

            setRecords(sortedData);
            setLoading(false);
        }, (error) => {
            clearTimeout(timeoutId);
            console.error("Firestore Error in ClerkReportView:", error);
            setLoading(false);
        });

        return () => {
            clearTimeout(timeoutId);
            unsubscribe();
        };
    }, [user?.uid, userData?.userRole]);

    // Determine derived material type filter if not explicitly provided
    const effectiveMaterialTypeFilter = materialTypeFilter ||
        (userData?.stockType === 'fixed_asset' ? 'fixed_asset' :
            userData?.stockType === 'consumable' ? 'consumable' : undefined);

    const filteredRecords = records.filter(record => {
        // 1. Filter by Search Term
        const matchesSearch =
            record.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.verification_code.includes(searchTerm);

        // 2. Filter by Material Type
        // If effectiveMaterialTypeFilter is set, show record if it contains AT LEAST ONE item of that type
        const matchesType = !effectiveMaterialTypeFilter ||
            record.material_details.some(m => m.materialType === effectiveMaterialTypeFilter);

        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            {/* Header / Filter */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Verification Codes</h2>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Sent to Users</p>
                </div>
                <div className="relative w-full md:w-96 group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search requester or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-600"
                    />
                </div>
            </div>

            {/* Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecords.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                        <FiPackage className="text-5xl mx-auto mb-4 opacity-30" />
                        <p className="font-bold uppercase tracking-widest text-sm">No records found</p>
                    </div>
                ) : (
                    filteredRecords.map(record => (
                        <div key={record.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                            {/* Header Status Bar */}
                            <div className={`h-2 w-full ${record.status === 'verified' ? 'bg-green-500' : 'bg-amber-500'}`}></div>

                            <div className="p-6 space-y-6">
                                {/* Top Row: Requester & Code */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                            <FiUser className="text-lg" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">{record.requester_name}</h3>
                                            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Requester</p>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                                        <div className="flex items-center gap-2">
                                            <FiCode className="text-indigo-500 text-xs" />
                                            <span className="font-mono font-black text-indigo-600 text-sm tracking-widest">{record.verification_code}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Material List */}
                                <div className="bg-slate-50/50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">
                                        <FiPackage /> Requested Items
                                    </div>
                                    {record.material_details.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-600">{item.materialName}</span>
                                                {item.materialCode && (
                                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded inline-block self-start mt-0.5">{item.materialCode}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-500">
                                                    {item.quantity} {item.unit}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer: Status & Time */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex gap-2 items-center w-full">
                                        {confirmingSendId === record.id ? (
                                            <div className="w-full bg-slate-50 border-2 border-indigo-100 rounded-3xl p-5 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="text-center mb-4">
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block mb-1">Security Check</span>
                                                    <span className="text-sm font-black text-slate-800">Verify your account?</span>
                                                </div>
                                                <div className="flex gap-3 justify-center">
                                                    <button
                                                        onClick={() => handleConfirmSend(record.id)}
                                                        className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        <FiCheckCircle className="text-sm" /> Verified
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmingSendId(null)}
                                                        className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all active:scale-95"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex items-center gap-1.5">
                                                    {record.status === 'verified' || record.status === 'shared_with_store' || record.status === 'handout_completed' ? (
                                                        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 shadow-sm animate-in zoom-in-95">
                                                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">
                                                                <FiCheckCircle />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Verified & Authorized</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-amber-600 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                                                            <FiClock className="animate-pulse" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Authorization</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {record.status !== 'verified' && record.status !== 'shared_with_store' && record.status !== 'handout_completed' && (
                                                    <button
                                                        onClick={() => setConfirmingSendId(record.id)}
                                                        className="bg-slate-900 text-white hover:bg-indigo-600 font-black uppercase tracking-widest text-[10px] px-8 py-3 rounded-2xl transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-95 flex items-center gap-2 group/btn"
                                                    >
                                                        <span>Verify</span>
                                                        <FiCheckCircle className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {record.created_at && (
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                            {record.created_at?.toDate().toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
