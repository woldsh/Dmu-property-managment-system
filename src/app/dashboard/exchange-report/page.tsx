'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import {
    collection, query, where, getDocs, orderBy, or
} from 'firebase/firestore';
import {
    FiCheckCircle, FiXCircle, FiClock, FiUser, FiArrowRight,
    FiBox, FiRepeat
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
    materials: any[];
    status: string;
    reason: string;
    createdAt: any;
}

export default function DashboardExchangeReportPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [transfers, setTransfers] = useState<TransferRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransfers = async () => {
            if (!user || !db) return;

            try {
                const email = user.email?.toLowerCase() || '';
                const transfersRef = collection(db, 'Material_transfers');

                // Fetch transfers where user is sender
                const sentQuery = query(
                    transfersRef,
                    where('senderId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const sentSnapshot = await getDocs(sentQuery);
                const sentTransfers = sentSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as TransferRecord));

                // Fetch transfers where user is receiver
                const receivedQuery = query(
                    transfersRef,
                    where('receiverEmail', '==', email),
                    orderBy('createdAt', 'desc')
                );
                const receivedSnapshot = await getDocs(receivedQuery);
                const receivedTransfers = receivedSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as TransferRecord));

                // Merge and deduplicate
                const allMap = new Map<string, TransferRecord>();
                [...sentTransfers, ...receivedTransfers].forEach(t => allMap.set(t.id, t));
                const all = Array.from(allMap.values()).sort((a, b) => {
                    const aTime = a.createdAt?.seconds || 0;
                    const bTime = b.createdAt?.seconds || 0;
                    return bTime - aTime;
                });

                setTransfers(all);
            } catch (error) {
                console.error('Error fetching transfers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransfers();
    }, [user]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_receiver': return { label: t('pending_receiver_approval'), color: 'bg-amber-100 text-amber-700', icon: FiClock };
            case 'approved_by_receiver': return { label: t('approved_by_receiver_label'), color: 'bg-blue-100 text-blue-700', icon: FiCheckCircle };
            case 'rejected_by_receiver': return { label: t('rejected_by_receiver_label'), color: 'bg-red-100 text-red-700', icon: FiXCircle };
            case 'completed': return { label: t('completed_label'), color: 'bg-emerald-100 text-emerald-700', icon: FiCheckCircle };
            default: return { label: status, color: 'bg-slate-100 text-slate-700', icon: FiClock };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-purple-600/5 to-indigo-600/5" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

                <div className="relative px-8 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <FiRepeat className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('exchange_report')}</h1>
                            <p className="text-slate-500 font-medium">{t('transfer_history')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 space-y-8">
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                                <FaExchangeAlt className="text-lg text-violet-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{t('transfer_history')}</h2>
                                <p className="text-sm text-slate-500">{transfers.length} {t('total_requests').toLowerCase()}</p>
                            </div>
                        </div>
                    </div>

                    {transfers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <FaExchangeAlt className="text-3xl text-slate-400" />
                            </div>
                            <h3 className="font-bold text-slate-700 text-lg">{t('no_transfers_yet')}</h3>
                            <p className="text-slate-500 mt-1">{t('no_transfers_desc')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {transfers.map((transfer) => {
                                const badge = getStatusBadge(transfer.status);
                                const BadgeIcon = badge.icon;
                                const isSender = transfer.senderId === user?.uid;

                                return (
                                    <div key={transfer.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isSender ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                        <FiUser className="text-[10px]" />
                                                        {isSender ? 'Sent' : 'Received'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <span className="font-bold">{transfer.senderName}</span>
                                                        <FiArrowRight className="text-slate-400 text-xs" />
                                                        <span className="font-bold">{transfer.receiverName}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5 mb-1">
                                                    {transfer.materials?.map((item: any, idx: number) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                                                            <FiBox className="inline text-[10px] mr-1" />
                                                            {item.name} ×{item.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                                {transfer.reason && (
                                                    <p className="text-xs text-slate-500 italic mt-1">"{transfer.reason}"</p>
                                                )}
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
                    )}
                </div>
            </div>
        </div>
    );
}
