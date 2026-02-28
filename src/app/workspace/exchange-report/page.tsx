'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import {
    collection, query, where, getDocs, orderBy
} from 'firebase/firestore';
import {
    FiCheckCircle, FiBox, FiClock
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

export default function ExchangeReportPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [completedTransfers, setCompletedTransfers] = useState<TransferRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransfers = async () => {
            if (!user || !db) return;

            try {
                const transfersRef = collection(db, 'Material_transfers');

                // Fetch only completed transfers for the report
                const completedQuery = query(
                    transfersRef,
                    where('status', '==', 'completed'),
                    orderBy('completedAt', 'desc')
                );
                const completedSnapshot = await getDocs(completedQuery);
                setCompletedTransfers(completedSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as TransferRecord)));

            } catch (error) {
                console.error('Error fetching transfers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransfers();
    }, [user]);

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
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('exchange_report')}</h1>
                            <p className="text-slate-500 font-medium">{t('transfer_history')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 space-y-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <FiCheckCircle className="text-lg text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-800">{completedTransfers.length}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('completed_label')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <FiBox className="text-lg text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-800">
                                    {completedTransfers.reduce((acc, curr) => acc + (curr.materials?.length || 0), 0)}
                                </p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Items Exchanged</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completed Transfers Table */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <FiCheckCircle className="text-lg text-emerald-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{t('transfer_completed')}</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('from_label')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('to_label')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('materials_label')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('status_label')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('date_label')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {completedTransfers.map((transfer) => (
                                    <tr key={transfer.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{transfer.senderName}</p>
                                                <p className="text-xs text-slate-500">{transfer.senderEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{transfer.receiverName}</p>
                                                <p className="text-xs text-slate-500">{transfer.receiverEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {transfer.materials?.map((item: any, idx: number) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                                                        {item.name} {item.model ? `(${item.model})` : ''} ×{item.quantity}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                <FiCheckCircle className="text-[10px]" /> {t('completed_label')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {transfer.completedAt?.seconds
                                                ? new Date(transfer.completedAt.seconds * 1000).toLocaleDateString()
                                                : transfer.createdAt?.seconds
                                                    ? new Date(transfer.createdAt.seconds * 1000).toLocaleDateString()
                                                    : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {completedTransfers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                                <FiClock className="text-2xl text-slate-300" />
                                            </div>
                                            <p className="text-slate-400 font-bold">{t('no_transfers_yet')}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
