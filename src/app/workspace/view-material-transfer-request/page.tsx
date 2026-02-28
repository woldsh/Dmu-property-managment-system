'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import {
    collection, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc
} from 'firebase/firestore';
import {
    FiCheckCircle, FiClock, FiUser, FiArrowRight,
    FiBox, FiFileText
} from 'react-icons/fi';
import { FaExchangeAlt } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

interface TransferRecord {
    id: string;
    senderId: string;
    senderName: string;
    senderEmail: string;
    receiverName: string;
    receiverEmail: string;
    receiverId: string | null;
    materials: any[];
    status: string;
    reason: string;
    createdAt: any;
    updatedAt: any;
    approvedByReceiverAt: any;
    completedAt: any;
}

export default function ViewMaterialTransferRequestPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [pendingTransfers, setPendingTransfers] = useState<TransferRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransfers = async () => {
            if (!user || !db) return;

            try {
                const transfersRef = collection(db, 'Material_transfers');

                // Fetch approved-by-receiver transfers (pending procurement completion)
                const pendingQuery = query(
                    transfersRef,
                    where('status', '==', 'approved_by_receiver')
                );
                const pendingSnapshot = await getDocs(pendingQuery);
                setPendingTransfers(pendingSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as TransferRecord)));

            } catch (error) {
                console.error('Error fetching transfers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransfers();
    }, [user]);

    const handleComplete = async (transferId: string) => {
        if (!user || !db) return;
        setProcessingId(transferId);

        try {
            const transfer = pendingTransfers.find(t => t.id === transferId);
            if (!transfer) throw new Error('Transfer not found');

            // 1. Get the receiver's department for the User-Report
            let receiverDepartment = 'General Staff';
            if (transfer.receiverId) {
                const userDoc = await getDoc(doc(db, 'users', transfer.receiverId));
                if (userDoc.exists()) {
                    receiverDepartment = userDoc.data().department || 'General Staff';
                }
            }

            // 2. Update each material in User-Report to belong to the new owner
            for (const material of transfer.materials) {
                if (material.userReportId) {
                    const userReportRef = doc(db, 'User-Report', material.userReportId);
                    await updateDoc(userReportRef, {
                        requesterId: transfer.receiverId,
                        requesterName: transfer.receiverName,
                        department: receiverDepartment,
                        // Add a history entry showing the transfer
                        history: [
                            {
                                status: 'transferred',
                                user: user.email,
                                timestamp: new Date().toISOString(),
                                note: `Transferred from ${transfer.senderName} to ${transfer.receiverName}. Reason: ${transfer.reason}`
                            }
                        ]
                    });
                }
            }

            // 3. Mark the transfer as completed
            const transferRef = doc(db, 'Material_transfers', transferId);
            await updateDoc(transferRef, {
                status: 'completed',
                completedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setPendingTransfers(prev => prev.filter(t => t.id !== transferId));
        } catch (error) {
            console.error('Error completing transfer:', error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-sky-600/5 to-indigo-600/5" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

                <div className="relative px-8 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <FaExchangeAlt className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('view_material_transfer_request')}</h1>
                            <p className="text-slate-500 font-medium">{t('pending_review')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 space-y-8">
                {/* Pending Approval */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <FiClock className="text-lg text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{t('approved_by_receiver_label')} — {t('pending_review')}</h2>
                                <p className="text-sm text-slate-500">{pendingTransfers.length} {t('items_label')}</p>
                            </div>
                        </div>
                    </div>

                    {pendingTransfers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <FaExchangeAlt className="text-3xl text-slate-400" />
                            </div>
                            <h3 className="font-bold text-slate-700 text-lg">{t('no_transfers_yet')}</h3>
                            <p className="text-slate-500 mt-1">{t('no_transfers_desc')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {pendingTransfers.map((transfer) => (
                                <div key={transfer.id} className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl">
                                                    <FiUser className="text-blue-500 text-sm" />
                                                    <span className="font-bold text-sm text-blue-800">{transfer.senderName}</span>
                                                </div>
                                                <FiArrowRight className="text-slate-400" />
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl">
                                                    <FiUser className="text-emerald-500 text-sm" />
                                                    <span className="font-bold text-sm text-emerald-800">{transfer.receiverName}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {transfer.materials?.map((item: any, idx: number) => (
                                                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                                                        <FiBox className="text-xs text-slate-400" />
                                                        {item.name} {item.model ? `(${item.model})` : ''} ×{item.quantity}
                                                    </span>
                                                ))}
                                            </div>

                                            {transfer.reason && (
                                                <div className="flex items-start gap-2 mb-4 bg-slate-50 rounded-lg p-3">
                                                    <FiFileText className="text-sm text-slate-400 mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm text-slate-600 italic">"{transfer.reason}"</p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleComplete(transfer.id)}
                                                    disabled={processingId === transfer.id}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                                >
                                                    {processingId === transfer.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <FiCheckCircle className="text-base" />
                                                    )}
                                                    {t('complete_transfer')}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 mb-1">
                                                <FiCheckCircle className="text-[10px]" /> {t('approved_by_receiver_label')}
                                            </span>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {transfer.createdAt?.seconds
                                                    ? new Date(transfer.createdAt.seconds * 1000).toLocaleDateString()
                                                    : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
