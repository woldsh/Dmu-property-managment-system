'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    getDocs,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
    FiSearch,
    FiClock,
    FiUser,
    FiCalendar,
    FiBox,
    FiAlertCircle,
    FiInfo,
    FiActivity,
    FiShield
} from 'react-icons/fi';
import Image from 'next/image';

interface RequestItem {
    materialId: string;
    materialName: string;
    materialCode: string;
    quantity: number;
    condition: string;
    unit: string;
    materialType: string;
    image?: string;
    AC_decition?: string;
}

interface MaterialRequest {
    id: string;
    requesterName: string;
    department: string;
    items: RequestItem[];
    status: string;
    createdAt: any;
    approvedAt?: any;
    coordinatorName?: string;
}

export default function NeedACDecisionView() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<MaterialRequest[]>([]);
    const [materialImages, setMaterialImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMaterialImages = async () => {
            const materialsSnap = await getDocs(collection(db, 'materials'));
            const imageMap: Record<string, string> = {};
            materialsSnap.docs.forEach(doc => {
                const data = doc.data();
                if (data.image) {
                    imageMap[doc.id] = data.image;
                }
            });
            setMaterialImages(imageMap);
        };
        fetchMaterialImages();
    }, []);

    useEffect(() => {
        const q = query(
            collection(db, 'Need_AC_decition')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requestList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MaterialRequest[];

            // Client-side sorting for consistency and to avoid index errors
            requestList.sort((a, b) => {
                const timeA = a.approvedAt?.toMillis() || 0;
                const timeB = b.approvedAt?.toMillis() || 0;
                return timeB - timeA;
            });

            setRequests(requestList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredRequests = requests.filter(r =>
        r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.items.some(item => item.materialName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-lime-50 rounded-full -mr-40 -mt-40 blur-[100px] opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full -ml-32 -mb-32 blur-[80px] opacity-40"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-100 text-lime-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                        <FiShield className="animate-pulse" /> Commission Oversight Active
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter flex items-center gap-4">
                        Commission <span className="text-lime-600">Review</span>
                    </h2>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em] opacity-60">
                        Tracking requests forwarded for Higher Executive Decision
                    </p>
                </div>

                <div className="relative group w-full md:w-[28rem] z-10">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lime-500 transition-colors text-xl" />
                    <input
                        type="text"
                        placeholder="Search commission queue..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-lime-500/5 focus:border-lime-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                    />
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-32 text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border-2 border-slate-50 shadow-inner">
                        <FiClock className="text-5xl" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Queue Clear</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No requests are currently pending commission decision.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12">
                    {filteredRequests.map(request => (
                        <div
                            key={request.id}
                            className="group relative bg-white border-2 border-slate-100 rounded-[2.5rem] transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:border-lime-200 hover:-translate-y-1 flex flex-col overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-40 transition-opacity group-hover:opacity-100"></div>

                            {/* Card Top Bar */}
                            <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:border-lime-100 transition-colors">
                                        <FiUser className="text-2xl text-lime-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-black transition-colors">{request.requesterName}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest">
                                                {request.department?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="mb-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-tighter shadow-sm border border-amber-200">
                                            <FiClock className="text-xs" /> Pending Commission
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-xl border border-slate-100/50">
                                        <FiCalendar className="text-lime-500" />
                                        Sent: {request.approvedAt?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="p-8 flex-1 space-y-6 relative z-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                        <FiBox className="text-lime-500" /> Items for Review ({request.items.length})
                                    </p>
                                    <div className="space-y-3">
                                        {request.items.map((item, idx) => (
                                            <div key={idx} className="group/item flex items-center justify-between p-4 bg-slate-50/50 rounded-3xl border-2 border-slate-100/50 hover:bg-white hover:border-lime-200 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-[1.25rem] bg-white border-2 border-slate-100 flex items-center justify-center relative overflow-hidden shadow-sm flex-shrink-0 group-hover/item:border-lime-100 transition-colors">
                                                        {(item.image || materialImages[item.materialId]) ? (
                                                            <Image
                                                                src={item.image || materialImages[item.materialId]}
                                                                alt={item.materialName}
                                                                fill
                                                                className="object-cover transition-transform duration-700 group-hover/item:scale-110"
                                                            />
                                                        ) : (
                                                            <FiBox className="text-slate-200 h-full w-full p-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 group-hover/item:text-black transition-colors">{item.materialName}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-mono">{item.materialCode}</span>
                                                            <span className="text-[10px] font-black bg-lime-600/10 text-lime-700 px-2.5 py-1 rounded-lg uppercase tracking-tighter border border-lime-200/50">{item.materialType?.replace('_', ' ')}</span>
                                                            <span className="text-[10px] font-black bg-red-500 text-white px-2.5 py-1 rounded-lg uppercase flex items-center gap-1.5 shadow-lg shadow-red-500/20">
                                                                <FiAlertCircle className="animate-pulse" /> Commission Review
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-lg font-black text-slate-800">{item.quantity}</span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.unit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="p-8 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 flex flex-col gap-2 relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forwarded By</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-lime-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-lime-600/20">
                                        AC
                                    </div>
                                    <p className="text-xs font-black text-slate-700">{request.coordinatorName || 'Academic Coordinator'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Information Card */}
            <div className="mt-12 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-lime-600">
                <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-lime-500/10 rounded-full -mr-60 -mt-60 blur-[120px]"></div>
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
                    <div className="w-28 h-28 bg-lime-500/20 rounded-[2.5rem] flex items-center justify-center flex-shrink-0 border-2 border-lime-500/20 shadow-2xl backdrop-blur-xl">
                        <FiInfo className="text-5xl text-lime-400" />
                    </div>
                    <div className="space-y-4">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-lime-500/10 text-lime-400 text-[10px] font-black uppercase tracking-[0.3em] border border-lime-500/20">
                            Commission Status Tracking
                        </div>
                        <h4 className="text-3xl font-black tracking-tighter italic">Pending Executive Decision</h4>
                        <p className="text-slate-400 text-lg font-medium max-w-4xl leading-relaxed opacity-80">
                            These requests contain fixed assets or large-scale requisitions that exceeded standard departmental thresholds. They are currently being reviewed by the Academic Commission for final budgetary and strategic alignment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
