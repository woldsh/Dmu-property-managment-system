'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import {
    collection, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy, getDoc
} from 'firebase/firestore';
import {
    FiDownloadCloud, FiCheckCircle, FiXCircle, FiClock, FiUser,
    FiMail, FiBox, FiArrowRight, FiPackage, FiFileText
} from 'react-icons/fi';
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
}

export default function ReceiveGoodsPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [pendingTransfers, setPendingTransfers] = useState<TransferRecord[]>([]);
    const [historyTransfers, setHistoryTransfers] = useState<TransferRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const fetchTransfers = async () => {
            if (!user || !db) return;

            try {
                const email = user.email?.toLowerCase() || '';
                setUserEmail(email);

                const transfersRef = collection(db, 'Material_transfers');

                // Fetch pending transfers for this user
                const pendingQuery = query(
                    transfersRef,
                    where('receiverEmail', '==', email),
                    where('status', '==', 'pending_receiver')
                );
                const pendingSnapshot = await getDocs(pendingQuery);
                setPendingTransfers(pendingSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as TransferRecord)));

                // Fetch transfer history (approved/rejected)
                const historyQuery = query(
                    transfersRef,
                    where('receiverEmail', '==', email),
                    orderBy('createdAt', 'desc')
                );
                const historySnapshot = await getDocs(historyQuery);
                const allTransfers = historySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as TransferRecord));
                setHistoryTransfers(allTransfers.filter(t => t.status !== 'pending_receiver'));

            } catch (error) {
                console.error('Error fetching transfers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransfers();
    }, [user]);

    const handleApprove = async (transferId: string) => {
        if (!user || !db) return;
        setProcessingId(transferId);

        try {
            const transferRef = doc(db, 'Material_transfers', transferId);
            await updateDoc(transferRef, {
                status: 'approved_by_receiver',
                receiverId: user.uid,
                approvedByReceiverAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Move from pending to history
            const transfer = pendingTransfers.find(t => t.id === transferId);
            if (transfer) {
                setPendingTransfers(prev => prev.filter(t => t.id !== transferId));
                setHistoryTransfers(prev => [{ ...transfer, status: 'approved_by_receiver' }, ...prev]);
            }
        } catch (error) {
            console.error('Error approving transfer:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (transferId: string) => {
        if (!user || !db) return;
        setProcessingId(transferId);

        try {
            const transferRef = doc(db, 'Material_transfers', transferId);
            await updateDoc(transferRef, {
                status: 'rejected_by_receiver',
                receiverId: user.uid,
                updatedAt: serverTimestamp(),
            });

            const transfer = pendingTransfers.find(t => t.id === transferId);
            if (transfer) {
                setPendingTransfers(prev => prev.filter(t => t.id !== transferId));
                setHistoryTransfers(prev => [{ ...transfer, status: 'rejected_by_receiver' }, ...prev]);
            }
        } catch (error) {
            console.error('Error rejecting transfer:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved_by_receiver': return { label: t('transfer_approved'), color: 'bg-blue-100 text-blue-700', icon: FiCheckCircle };
            case 'rejected_by_receiver': return { label: t('transfer_rejected'), color: 'bg-red-100 text-red-700', icon: FiXCircle };
            case 'completed': return { label: t('transfer_completed'), color: 'bg-emerald-100 text-emerald-700', icon: FiCheckCircle };
            default: return { label: status, color: 'bg-slate-100 text-slate-700', icon: FiClock };
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-teal-600/5 to-cyan-600/5" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

                <div className="relative px-8 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <FiDownloadCloud className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('receive_goods')}</h1>
                            <p className="text-slate-500 font-medium">{t('incoming_transfers')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 space-y-8">
                {/* Pending Transfers */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <FiClock className="text-lg text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{t('pending_transfers')}</h2>
                                <p className="text-sm text-slate-500">{pendingTransfers.length} {t('items_label')}</p>
                            </div>
                            {pendingTransfers.length > 0 && (
                                <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold animate-pulse">
                                    {pendingTransfers.length}
                                </span>
                            )}
                        </div>
                    </div>

                    {pendingTransfers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <FiDownloadCloud className="text-3xl text-slate-400" />
                            </div>
                            <h3 className="font-bold text-slate-700 text-lg">{t('no_incoming_transfers')}</h3>
                            <p className="text-slate-500 mt-1 max-w-md mx-auto">{t('no_incoming_desc')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {pendingTransfers.map((transfer) => (
                                <div key={transfer.id} className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <FiUser className="text-xl text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-800">{transfer.senderName}</span>
                                                <FiArrowRight className="text-slate-400 text-sm" />
                                                <span className="text-sm text-slate-500">{t('to_label')} {t('receiver_name')}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                                                <FiMail className="text-xs" /> {transfer.senderEmail}
                                            </p>

                                            {/* Materials */}
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

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleApprove(transfer.id)}
                                                    disabled={processingId === transfer.id}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                                >
                                                    {processingId === transfer.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <FiCheckCircle className="text-base" />
                                                    )}
                                                    {t('approve_transfer')}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(transfer.id)}
                                                    disabled={processingId === transfer.id}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
                                                >
                                                    <FiXCircle className="text-base" />
                                                    {t('reject_transfer')}
                                                </button>
                                            </div>
                                        </div>

                                        <span className="text-xs text-slate-400 flex-shrink-0">
                                            {transfer.createdAt?.seconds
                                                ? new Date(transfer.createdAt.seconds * 1000).toLocaleDateString()
                                                : 'Recently'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* History */}
                {historyTransfers.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                                    <FiClock className="text-lg text-violet-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">{t('transfer_history')}</h2>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {historyTransfers.map((transfer) => {
                                const badge = getStatusBadge(transfer.status);
                                const BadgeIcon = badge.icon;
                                return (
                                    <div key={transfer.id} className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-bold text-slate-800">{transfer.senderName}</span>
                                                    <FiArrowRight className="text-slate-400 text-sm" />
                                                    <span className="text-sm text-slate-500">{t('to_label')} you</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                    {transfer.materials?.map((item: any, idx: number) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                                                            {item.name} ×{item.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                                                    <BadgeIcon className="text-[10px]" /> {badge.label}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {transfer.createdAt?.seconds
                                                        ? new Date(transfer.createdAt.seconds * 1000).toLocaleDateString()
                                                        : 'Recently'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
