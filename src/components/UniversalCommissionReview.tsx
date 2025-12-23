'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    getDocs,
    getDoc,
    doc
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
    FiClock,
    FiBox,
    FiAlertCircle,
    FiInfo,
    FiActivity,
    FiCalendar,
    FiUser
} from 'react-icons/fi';
import Image from 'next/image';

interface RequestItem {
    materialId: string;
    materialName: string;
    materialCode: string;
    quantity: number;
    unit: string;
    materialType: string;
    image?: string;
}

interface MaterialRequest {
    id: string;
    requesterName: string;
    requesterEmail: string;
    department: string;
    items: RequestItem[];
    status: string;
    createdAt: any;
    approvedAt?: any;
    coordinatorName?: string;
}

interface UniversalCommissionReviewProps {
    viewType?: 'personal' | 'department';
}

export default function UniversalCommissionReview({ viewType = 'personal' }: UniversalCommissionReviewProps) {
    const { user } = useAuth();
    const [requests, setRequests] = useState<MaterialRequest[]>([]);
    const [materialImages, setMaterialImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [userDept, setUserDept] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    // 1. Fetch User Profile to determine department and role
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user?.uid) {
                try {
                    const userDoc = await getDoc(doc(db, 'Users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        let dept = data.department;
                        // Fallback: extract department from userRole if missing
                        if (!dept && data.userRole) {
                            dept = data.userRole.replace('_head', '').replace('_teacher', '');
                        }
                        setUserDept(dept || 'unknown');
                        setUserRole(data.userRole || 'unknown');

                        // Automatically switch to department view if Department Head
                        if (data.userRole?.includes('_head') && viewType === 'personal') {
                            setLoading(true);
                        }
                    } else {
                        setUserDept('unknown');
                        setUserRole('unknown');
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUserDept('unknown');
                }
            }
        };
        fetchUserProfile();
    }, [user?.uid]);

    // 2. Fetch all material images once for lookup
    useEffect(() => {
        const fetchMaterialImages = async () => {
            try {
                const materialsSnap = await getDocs(collection(db, 'materials'));
                const imageMap: Record<string, string> = {};
                materialsSnap.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.image) {
                        imageMap[doc.id] = data.image;
                    }
                });
                setMaterialImages(imageMap);
            } catch (error) {
                console.error("Error fetching material images:", error);
            }
        };
        fetchMaterialImages();
    }, []);

    // 3. Set up the data listener
    useEffect(() => {
        if (!user?.uid) return;

        // Wait for userDept if searching by department, unless we already know it's unknown
        if (viewType === 'department' && userDept === null) return;

        // If department is unknown and required, stop loading and show empty state
        if (viewType === 'department' && userDept === 'unknown') {
            console.warn("ViewType is department but user department is unknown");
            setLoading(false);
            return;
        }

        // Determine effective view type
        const isDeptHead = userRole?.includes('_head');
        const effectiveViewType = isDeptHead ? 'department' : viewType;

        const q = effectiveViewType === 'department'
            ? query(collection(db, 'Need_AC_decition'), where('department', '==', userDept))
            : query(collection(db, 'Need_AC_decition'), where('requesterId', '==', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requestList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MaterialRequest[];

            // Client-side sorting to avoid missing composite index errors
            requestList.sort((a, b) => {
                const timeA = a.approvedAt?.toMillis() || 0;
                const timeB = b.approvedAt?.toMillis() || 0;
                return timeB - timeA;
            });

            setRequests(requestList);
            setLoading(false);
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid, userDept, viewType]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-lime-100 border-t-lime-600 rounded-full animate-spin"></div>
                    <div className="mt-4 text-slate-400 font-black uppercase text-[10px] tracking-widest text-center">Syncing...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto p-6 md:p-12 space-y-12 animate-in fade-in duration-700">
            {/* Dynamic Status Banner */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-lime-50 rounded-full -mr-48 -mt-48 blur-[100px] opacity-60 group-hover:bg-lime-100 transition-colors duration-700"></div>

                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                        <FiActivity className="animate-pulse" /> Live Status Tracking
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                        Waiting for <span className="bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">AC Decision</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] opacity-60 max-w-xl">
                        {viewType === 'department'
                            ? "Track your department's high-priority requests currently under review by the Academic Commission."
                            : "Your high-priority requests are currently under review by the Academic Commission."}
                    </p>
                </div>

                <div className="relative z-10 bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100/50 flex flex-col items-center gap-2 min-w-[160px]">
                    <span className="text-4xl font-black text-slate-800">{requests.length}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Requests in<br />Decision Queue</span>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] py-40 text-center space-y-8">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border-2 border-slate-50 shadow-inner group transition-all duration-500 hover:scale-110">
                        <FiClock className="text-5xl group-hover:text-lime-200 transition-colors" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">No Pending Reviews</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest max-w-xs mx-auto leading-relaxed">
                            {viewType === 'department'
                                ? "There are no items from your department currently waiting for commission decision."
                                : "You don't have any items currently waiting for commission decision."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {requests.map(request => (
                        <div
                            key={request.id}
                            className="group relative bg-white border-2 border-slate-100 rounded-[3rem] transition-all duration-500 hover:shadow-[0_50px_100px_-30px_rgba(0,0,0,0.1)] hover:border-lime-200 overflow-hidden flex flex-col"
                        >
                            {/* Card Glow */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-lime-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            {/* Header Section */}
                            <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between relative z-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                            <FiUser className="text-lime-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 tracking-tight">{request.requesterName}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{request.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-amber-200 text-amber-600 text-[10px] font-black uppercase tracking-tighter shadow-sm">
                                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
                                        Pending AC decision
                                    </span>
                                </div>
                            </div>

                            {/* Items Preview */}
                            <div className="p-8 flex-1 space-y-6 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <FiBox className="text-lime-500" /> Requested Materials
                                        </p>
                                        <span className="text-[10px] font-black text-slate-400 uppercase px-3 py-1 bg-slate-100 rounded-lg">
                                            {request.items.length} items
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {request.items.map((item, idx) => (
                                            <div key={idx} className="group/item flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border-2 border-slate-100/50 hover:bg-white hover:border-lime-200 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center relative overflow-hidden shadow-sm flex-shrink-0 group-hover/item:scale-105 transition-transform">
                                                        {(item.image || materialImages[item.materialId]) ? (
                                                            <Image
                                                                src={item.image || materialImages[item.materialId]}
                                                                alt={item.materialName}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <FiBox className="text-slate-100 h-full w-full p-3" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 group-hover/item:text-black transition-colors">{item.materialName}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[9px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded uppercase">{item.materialType?.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-black text-slate-800">{item.quantity}</span>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.unit}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Footer */}
                            <div className="p-8 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                        <FiCalendar className="text-lime-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sent to Commission</p>
                                        <p className="text-xs font-bold text-white">
                                            {request.approvedAt?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 relative z-10">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol Status</span>
                                        <span className="text-[11px] font-black text-lime-400 uppercase tracking-tight italic">Waiting AC Decision</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-lime-500/30 border-t-lime-500 animate-spin"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Global Information Bar */}
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group">
                <div className="w-16 h-16 bg-lime-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <FiInfo className="text-3xl text-lime-600" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                    <h5 className="font-black text-slate-800 tracking-tight">Need help with Commission Decisions?</h5>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-2xl">
                        High-priority requests (like fixed assets) require Academic Commission review for budgetary transparency. You will be notified as soon as a decision is reached.
                    </p>
                </div>
            </div>
        </div>
    );
}
