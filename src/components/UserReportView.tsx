'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    doc,
    updateDoc,
    serverTimestamp,
    where,
    getDoc,
    addDoc
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
    FiSearch,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiUser,
    FiCalendar,
    FiBox,
    FiPackage,
    FiAlertCircle,
    FiInfo,
    FiArrowRight,
    FiActivity,
    FiTruck
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

interface RequestHistory {
    status: string;
    user: string;
    timestamp: string;
    note: string;
}

interface MaterialRequest {
    id: string;
    requesterId: string;
    requesterName: string;
    department: string;
    items: RequestItem[];
    currentApproverId: string;
    currentApproverName: string;
    currentApproverRole: string;
    status: string;
    createdAt: any;
    history: RequestHistory[];
    headApproverName?: string;
}

export default function UserReportView() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<MaterialRequest[]>([]);
    const [materialImages, setMaterialImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userData, setUserData] = useState<any>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchMaterialImages = async () => {
            const materialsSnap = await getDoc(doc(db, 'materials', 'all'));
            // Simplified - adjust based on your materials structure
            setMaterialImages({});
        };
        fetchMaterialImages();
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            }
        };
        fetchUserProfile();
    }, [user]);

    useEffect(() => {
        if (!userData) return;

        // Query Request_materials collection for processed requests
        const q = query(
            collection(db, 'Request_materials'),
            where('status', '==', 'processed_by_general_service')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requestList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MaterialRequest[];

            // Sort in memory by createdAt (newest first)
            requestList.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB.getTime() - dateA.getTime();
            });

            setRequests(requestList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData]);

    const handleApprove = async (request: MaterialRequest) => {
        if (!user || !userData) return;
        setProcessingId(request.id);

        try {
            // Fetch requester email from users collection
            let requesterEmail = '';
            try {
                const requesterDoc = await getDoc(doc(db, 'users', request.requesterId));
                if (requesterDoc.exists()) {
                    requesterEmail = requesterDoc.data().email || '';
                }
            } catch (emailError) {
                console.error("Error fetching requester email:", emailError);
            }

            // Create a User_reports entry for each material item
            const userReportPromises = request.items.map(async (item) => {
                await addDoc(collection(db, 'User-Report'), {
                    requestId: request.id,
                    requesterId: request.requesterId,
                    requesterName: request.requesterName,
                    requesterEmail: requesterEmail,
                    department: request.department,
                    materialId: item.materialId,
                    materialName: item.materialName,
                    materialCode: item.materialCode,
                    materialImage: item.image || '',
                    quantity: item.quantity,
                    unit: item.unit,
                    materialType: item.materialType,
                    condition: item.condition,
                    withdrawalDate: serverTimestamp(),
                    status: 'pending',
                    processedBy: user.uid,
                    processedByName: userData.displayName || 'Team Leader',
                    createdAt: serverTimestamp(),
                    history: [
                        {
                            status: 'pending',
                            user: user.uid,
                            timestamp: new Date().toISOString(),
                            note: 'Material withdrawal request created by Team Leader. Awaiting store processing.'
                        }
                    ]
                });
            });

            // Wait for all User_reports entries to be created
            await Promise.all(userReportPromises);

            // Update Request_materials status
            const requestRef = doc(db, 'Request_materials', request.id);
            await updateDoc(requestRef, {
                status: 'approved_by_procurement_team_leader',
                currentApproverRole: 'completed',
                history: [
                    ...request.history,
                    {
                        status: 'approved_by_procurement_team_leader',
                        user: user.uid,
                        timestamp: new Date().toISOString(),
                        note: `Request approved by Team Leader. ${request.items.length} material withdrawal record(s) created for store processing.`
                    }
                ]
            });

            setSuccessMessage(`Request approved! ${request.items.length} withdrawal record(s) created successfully`);
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error) {
            console.error("Error approving request:", error);
            alert("Failed to approve request.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (request: MaterialRequest) => {
        if (!user) return;
        const note = prompt("Please enter a reason for rejection:");
        if (note === null) return;

        setProcessingId(request.id);
        try {
            const requestRef = doc(db, 'Request_materials', request.id);

            await updateDoc(requestRef, {
                status: 'rejected_by_team_leader',
                history: [
                    ...request.history,
                    {
                        status: 'rejected_by_team_leader',
                        user: user.uid,
                        timestamp: new Date().toISOString(),
                        note: note || 'Rejected by Team Leader'
                    }
                ]
            });

            setSuccessMessage('Request rejected');
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error) {
            console.error("Error rejecting request:", error);
            alert("Failed to reject request.");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = requests.filter(r =>
        r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.items.some(item => item.materialName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Success Notification */}
            {successMessage && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-8 duration-500">
                    <div className="flex items-center gap-4 px-8 py-4 rounded-full shadow-2xl backdrop-blur-xl border bg-teal-600/90 border-teal-400 text-white">
                        <FiCheckCircle className="text-2xl" />
                        <span className="font-black uppercase tracking-widest text-sm">{successMessage}</span>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50 rounded-full -mr-40 -mt-40 blur-[100px] opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full -ml-32 -mb-32 blur-[80px] opacity-40"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                        <FiActivity className="animate-pulse" /> Material Withdrawal Protocol
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter flex items-center gap-4">
                        Pending <span className="text-teal-600">Withdrawals</span>
                    </h2>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em] opacity-60">
                        Team Leader Protocol: Review and Approve Material Distribution
                    </p>
                </div>

                <div className="relative group w-full md:w-[28rem] z-10">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors text-xl" />
                    <input
                        type="text"
                        placeholder="Search by requester, material, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
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
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No pending requests require your attention.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12">
                    {filteredRequests.map(request => (
                        <div
                            key={request.id}
                            className={`group relative bg-white border-2 rounded-[2.5rem] transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-1 flex flex-col overflow-hidden border-slate-100 hover:border-teal-200 ${processingId === request.id ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {/* Decorative Corner Accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-40 transition-opacity group-hover:opacity-100"></div>

                            {/* Request Card Top Bar */}
                            <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:border-teal-100 transition-colors">
                                        <FiUser className="text-2xl text-teal-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-black transition-colors">{request.requesterName}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest">
                                                {request.department?.replace('_', ' ')}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic opacity-60">
                                                Requester
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="mb-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/50 text-amber-700 text-[10px] font-black uppercase tracking-tighter shadow-sm border border-amber-200/50">
                                            <FiTruck className="text-xs" /> Processed by General Service
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-xl border border-slate-100/50">
                                        <FiCalendar className="text-teal-500" />
                                        {request.createdAt?.toDate?.()?.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Material Items List */}
                            <div className="p-8 flex-1 space-y-6 relative z-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                        <FiPackage className="text-teal-500" /> Material Payload ({request.items.length})
                                    </p>
                                    <div className="space-y-3">
                                        {request.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-3xl border-2 border-slate-100/50 hover:bg-white hover:border-teal-200 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-[1.25rem] bg-white border-2 border-slate-100 flex items-center justify-center relative overflow-hidden shadow-sm flex-shrink-0 group-hover:border-teal-100 transition-colors">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.materialName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <FiBox className="text-slate-200 h-full w-full p-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 group-hover:text-black transition-colors">{item.materialName}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-mono">{item.materialCode}</span>
                                                            <span className="text-[10px] font-black bg-teal-600/10 text-teal-700 px-2.5 py-1 rounded-lg uppercase tracking-tighter border border-teal-200/50">{item.materialType?.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-lg font-black text-slate-800">{item.quantity}</span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.unit}</span>
                                                    </div>
                                                    <div className={`mt-2 px-2 py-0.5 rounded-lg inline-block text-[9px] font-black uppercase tracking-tighter border ${item.condition === 'New' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                        {item.condition}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-8 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 flex items-center gap-4 relative z-10">
                                <button
                                    onClick={() => handleApprove(request)}
                                    className="flex-1 py-5 bg-teal-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-teal-500 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0)] hover:shadow-[0_20px_40px_-5px_rgba(20,184,166,0.3)] flex items-center justify-center gap-3 group/btn active:scale-95"
                                >
                                    {processingId === request.id ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            Approve Request
                                            <FiArrowRight className="group-hover/btn:translate-x-2 transition-transform text-lg" />
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleReject(request)}
                                    className="px-8 py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3 group/reject"
                                >
                                    <FiXCircle className="text-2xl group-hover/reject:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Card */}
            <div className="mt-12 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-teal-600">
                <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full -mr-60 -mt-60 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-800/20 rounded-full -ml-40 -mb-40 blur-[100px]"></div>

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
                    <div className="w-28 h-28 bg-teal-500/20 rounded-[2.5rem] flex items-center justify-center flex-shrink-0 border-2 border-teal-500/20 shadow-2xl backdrop-blur-xl animate-float">
                        <FiInfo className="text-5xl text-teal-400" />
                    </div>
                    <div className="space-y-4">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] border border-teal-500/20">
                            Operational Policy
                        </div>
                        <h4 className="text-3xl font-black tracking-tighter italic">
                            Team Leader Approval Protocol
                        </h4>
                        <p className="text-slate-400 text-lg font-medium max-w-4xl leading-relaxed opacity-80">
                            Review material withdrawal requests processed by General Service. Your approval authorizes the final distribution of materials to requesting departments. Ensure all quantities and conditions are verified before approval.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
