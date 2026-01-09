'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, where, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { FiSearch, FiUser, FiPackage, FiCheckCircle, FiClock, FiActivity, FiCopy, FiCheck } from 'react-icons/fi';

interface MaterialDetail {
    materialName: string;
    materialCode?: string;
    materialType: string;
    quantity: number;
    unit: string;
}

interface RequestRecord {
    id: string;
    request_id: string;
    verification_code: string;
    requester_name: string;
    material_details: MaterialDetail[];
    status: string;
    created_at: any;
    sharedAt?: string; // ISO string
}

interface StoreRequestVerificationProps {
    storeType: 'fixed_asset' | 'consumable';
}

export default function StoreRequestVerification({ storeType }: StoreRequestVerificationProps) {
    const [requests, setRequests] = useState<RequestRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Verification State
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);

    // Track processing IDs to prevent double-processing
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Fetch from Send_to_Users
        if (!db) return;
        const q = query(
            collection(db!, 'Send_to_Users'),
            orderBy('created_at', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RequestRecord[];

            setRequests(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Auto-verify logic
    useEffect(() => {
        // 1. Auto-verify input when 6 digits match
        if (inputCode.length === 6 && verifyingId) {
            const record = requests.find(r => r.id === verifyingId);
            if (record && !processingIds.has(record.id)) {
                handleVerify(record, inputCode);
            }
        }

        // 2. Immediate Auto-verify for "shared_with_store" status
        requests.forEach(req => {
            if (req.status === 'shared_with_store' && !processingIds.has(req.id)) {
                console.log(`Immediate auto-verifying request ${req.id}`);
                setProcessingIds(prev => new Set(prev).add(req.id));
                handleVerify(req, req.verification_code, true);
            }
        });

        // 3. Auto-verify timed out "shared_with_store" requests (every 10 seconds check for safety)
        const intervalId = setInterval(() => {
            requests.forEach(req => {
                if (req.status === 'shared_with_store' && req.sharedAt && !processingIds.has(req.id)) {
                    const sharedTime = new Date(req.sharedAt).getTime();
                    const now = new Date().getTime();
                    const minutesPassed = (now - sharedTime) / (1000 * 60);

                    if (minutesPassed >= 10) {
                        console.log(`Timeout auto-verifying request ${req.id}`);
                        setProcessingIds(prev => new Set(prev).add(req.id));
                        handleVerify(req, req.verification_code, true);
                    }
                }
            });
        }, 10000);

        return () => clearInterval(intervalId);
    }, [inputCode, verifyingId, requests, processingIds]);

    const handleVerify = async (record: RequestRecord, codeToCheck?: string, isAutoVerify: boolean = false) => {
        const verificationCode = codeToCheck || inputCode;

        if (verificationCode !== record.verification_code) {
            if (!isAutoVerify) setError('Incorrect verification code.');
            return;
        }

        try {
            if (!db) return;
            setLoading(true);
            const batch = writeBatch(db!);

            // 1. Update User_reports status from Completed to accepted
            const userReportQuery = query(
                collection(db!, 'User-Report'),
                where('requestId', '==', record.request_id)
            );
            const userReportSnap = await getDocs(userReportQuery);

            userReportSnap.docs.forEach((userRepDoc) => {
                batch.update(userRepDoc.ref, {
                    status: 'accepted',
                    acceptedAt: new Date().toISOString()
                });
            });

            // 2. Inventory Deduction: Reduce quantity in 'materials' collection
            for (const item of record.material_details) {
                const materialQuery = query(
                    collection(db!, 'materials'),
                    where('materialName', '==', item.materialName)
                );
                const materialSnap = await getDocs(materialQuery);

                if (!materialSnap.empty) {
                    const materialDoc = materialSnap.docs[0];
                    const currentQty = materialDoc.data().quantity || 0;
                    const newQty = Math.max(0, currentQty - item.quantity);

                    batch.update(materialDoc.ref, { quantity: newQty });
                }
            }

            // 3. Update Send_to_Users status to identify it as completed in this view
            const sendToUserRef = doc(db!, 'Send_to_Users', record.id);
            batch.update(sendToUserRef, { status: 'handout_completed' });

            // 4. Delete the original Request_materials document
            if (record.request_id) {
                const requestMaterialRef = doc(db!, 'Request_materials', record.request_id);
                batch.delete(requestMaterialRef);
            }

            await batch.commit();

            setSuccessId(record.id);
            setVerifyingId(null);
            setInputCode('');
            setError(null);

            // 5. Auto-Deletion: Delete document after 24 hours (86,400,000ms)
            setTimeout(async () => {
                try {
                    if (db) {
                        await deleteDoc(doc(db!, 'Send_to_Users', record.id));
                        console.log(`Document ${record.id} deleted automatically.`);
                    }
                } catch (delError) {
                    console.error('Failed to auto-delete document:', delError);
                }
            }, 86400000); // 24 hours

        } catch (err) {
            console.error(err);
            setError('Failed to update records.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.requester_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = req.material_details.some(m => m.materialType === storeType);
        return matchesSearch && matchesType;
    });

    if (loading && requests.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50"></div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <FiActivity className="text-xl animate-pulse" />
                        </div>
                        Store Verification
                    </h2>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2 ml-13">Automated Handout Pipeline</p>
                </div>
                <div className="relative w-full md:w-[450px] group/search">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors text-lg" />
                    <input
                        type="text"
                        placeholder="Search by requester name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all font-semibold text-slate-600 placeholder:text-slate-300 shadow-inner"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRequests.map(req => {
                    const isCompleted = req.status === 'handout_completed' || successId === req.id;

                    return (
                        <div key={req.id} className="group relative">
                            {/* Decorative Glow */}
                            <div className={`absolute -inset-0.5 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-500 ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`}></div>

                            <div className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8 flex flex-col h-full hover:shadow-2xl transition-all duration-500 overflow-hidden">

                                {/* Status Header */}
                                <div className={`absolute top-0 left-0 w-full h-1.5 ${isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-600' : 'bg-gradient-to-r from-indigo-400 to-violet-600'}`}></div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-green-50 border-green-100 text-green-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                            <FiUser className="text-2xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{req.requester_name}</h3>
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Authorized Requester</p>
                                        </div>
                                    </div>
                                    {isCompleted && (
                                        <div className="bg-green-100/50 p-2 rounded-xl text-green-600 animate-in zoom-in-50 duration-300">
                                            <FiCheckCircle className="text-xl" />
                                        </div>
                                    )}
                                </div>

                                {/* Materials Section */}
                                <div className="bg-slate-50/50 rounded-3xl p-6 space-y-4 border border-slate-100/50 relative overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-2">
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                            <FiPackage className="text-indigo-400" /> Manifest Items
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-1 bg-white rounded-lg border border-slate-200 text-slate-400 uppercase">
                                            {req.material_details.length} Items
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {req.material_details.map((item, idx) => (
                                            <div key={idx} className="flex flex-col group/item border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700 text-sm group-hover/item:text-indigo-600 transition-colors">{item.materialName}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">{item.materialType}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="px-3 py-1 bg-white border-2 border-slate-100 rounded-xl text-xs font-black text-slate-600 shadow-sm">
                                                            {item.quantity}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter w-12">{item.unit}</span>
                                                    </div>
                                                </div>

                                                {/* Material Code with Copy Feature - ONLY shown when completed */}
                                                {isCompleted && item.materialCode && (
                                                    <div className="mt-3 flex items-center gap-3 self-start">
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopy(item.materialCode!);
                                                            }}
                                                            className={`
                                                                flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer group/code
                                                                ${copiedCode === item.materialCode
                                                                    ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/20 scale-105'
                                                                    : 'bg-indigo-950 border-indigo-500/30 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300 opacity-60">Serial Code</span>
                                                                <span className={`text-xs font-mono font-black tracking-widest ${copiedCode === item.materialCode ? 'text-white' : 'text-indigo-100'}`}>
                                                                    {item.materialCode}
                                                                </span>
                                                            </div>
                                                            <div className={`
                                                                w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                                                                ${copiedCode === item.materialCode ? 'bg-white/20' : 'bg-indigo-500/20 group-hover/code:bg-indigo-500/40'}
                                                            `}>
                                                                {copiedCode === item.materialCode ? <FiCheck className="text-white text-sm" /> : <FiCopy className="text-indigo-300 group-hover/code:text-white text-sm" />}
                                                            </div>
                                                        </div>
                                                        {copiedCode === item.materialCode && (
                                                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-in fade-in zoom-in-50 duration-300">Copied!</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Action/Status Footer */}
                                <div className="mt-auto pt-4">
                                    {isCompleted ? (
                                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-green-100/50 rounded-[2rem] p-5 flex flex-col items-center justify-center gap-3 animate-in slide-in-from-bottom-4 duration-500 group-hover:shadow-lg group-hover:shadow-green-500/10 transition-all">
                                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-200">
                                                <FiCheckCircle className="text-2xl" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-green-800 font-black uppercase tracking-[0.2em] text-[10px]">Handout Successful</p>
                                                <p className="text-green-600/70 font-bold text-[10px] mt-1 italic">Verified & Deducted</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-indigo-600 rounded-[2rem] p-6 shadow-xl shadow-indigo-200 flex flex-col items-center justify-center gap-4 group-hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
                                            {/* Pulsing Glow Background */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-600 animate-pulse opacity-50"></div>
                                            <div className="relative flex flex-col items-center gap-3 w-full">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                                                    <span className="text-white font-black uppercase tracking-[0.3em] text-xs">Waiting for VERIFY</span>
                                                </div>

                                                {/* Visual indicator of automation */}
                                                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white/60 w-1/3 animate-[loading_2s_ease-in-out_infinite]"></div>
                                                </div>

                                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest text-center mt-1">Automatic monitoring active</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <style jsx>{`
                                    @keyframes loading {
                                        0% { transform: translateX(-100%); width: 30%; }
                                        50% { width: 60%; }
                                        100% { transform: translateX(400%); width: 30%; }
                                    }
                                `}</style>

                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredRequests.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 animate-in fade-in duration-700">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                        <FiPackage className="text-4xl" />
                    </div>
                    <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">No Active Handouts</h3>
                    <p className="text-slate-300 text-xs font-bold mt-2 italic">Scanning for incoming verification codes...</p>
                </div>
            )}
        </div>
    );
}
