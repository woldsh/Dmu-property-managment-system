'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/firebase';
import {
    collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, doc, getDoc, onSnapshot
} from 'firebase/firestore';
import {
    FiRotateCcw, FiSend, FiCheckSquare, FiUser, FiMail,
    FiFileText, FiBox, FiClock, FiCheckCircle, FiXCircle, FiArrowRight,
    FiPackage, FiTag
} from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

interface UserReportItem {
    id: string;
    requestId: string;
    requesterId: string;
    requesterName: string;
    department: string;
    materialId: string;
    materialName: string;
    materialCode: string;
    quantity: number;
    unit: string;
    materialType: string;
    condition: string;
    image?: string;
    acceptedAt?: string;
    status: string;
}

interface TransferRecord {
    id: string;
    receiverName: string;
    receiverEmail: string;
    materials: any[];
    status: string;
    reason: string;
    createdAt: any;
}

export default function ReturnGoodsPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [materials, setMaterials] = useState<UserReportItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [receiverName, setReceiverName] = useState('');
    const [receiverEmail, setReceiverEmail] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [transfers, setTransfers] = useState<TransferRecord[]>([]);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (!user || !db) return;

        const fetchUserName = async () => {
            if (!db) return;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setUserName(userDoc.data().displayName || '');
            }
        };
        fetchUserName();

        // Real-time listener for User-Report (materials taken out from store)
        const q = query(
            collection(db, 'User-Report'),
            where('requesterId', '==', user.uid),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as UserReportItem))
                .filter(d => d.status === 'accepted'); // Only show accepted (handed-out) items
            setMaterials(data);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching materials:', error);
            setLoading(false);
        });

        // Fetch transfer history
        const fetchTransfers = async () => {
            if (!db) return;
            const transfersRef = collection(db, 'Material_transfers');
            const tq = query(transfersRef, where('senderId', '==', user.uid), orderBy('createdAt', 'desc'));
            const tSnapshot = await getDocs(tq);
            setTransfers(tSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as TransferRecord)));
        };
        fetchTransfers();

        return () => unsubscribe();
    }, [user]);

    const toggleMaterial = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const selectedMaterials = materials.filter(m => selectedIds.has(m.id));

    const handleSubmit = async () => {
        if (!user || !db || selectedMaterials.length === 0 || !receiverName || !receiverEmail) return;
        setSubmitting(true);

        try {
            const transferMaterials = selectedMaterials.map(m => ({
                name: m.materialName,
                materialCode: m.materialCode,
                quantity: m.quantity,
                unit: m.unit,
                materialType: m.materialType,
                condition: m.condition,
                image: m.image || '',
                userReportId: m.id,
            }));

            await addDoc(collection(db, 'Material_transfers'), {
                senderId: user.uid,
                senderName: userName || user.displayName || 'Unknown',
                senderEmail: user.email,
                receiverName: receiverName.trim(),
                receiverEmail: receiverEmail.trim().toLowerCase(),
                receiverId: null,
                materials: transferMaterials,
                status: 'pending_receiver',
                reason: reason.trim(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                approvedByReceiverAt: null,
                completedAt: null,
            });

            setSubmitted(true);
            setSelectedIds(new Set());
            setReceiverName('');
            setReceiverEmail('');
            setReason('');

            // Refresh transfers
            const transfersRef = collection(db, 'Material_transfers');
            const tq = query(transfersRef, where('senderId', '==', user.uid), orderBy('createdAt', 'desc'));
            const tSnapshot = await getDocs(tq);
            setTransfers(tSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as TransferRecord)));

            setTimeout(() => setSubmitted(false), 4000);
        } catch (error) {
            console.error('Error submitting transfer:', error);
        } finally {
            setSubmitting(false);
        }
    };

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
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-violet-600/5" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

                <div className="relative px-8 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <FiRotateCcw className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('return_goods')}</h1>
                            <p className="text-slate-500 font-medium">{t('select_materials')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 space-y-8">
                {/* Success Banner */}
                {submitted && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <FiCheckCircle className="text-2xl text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-800">{t('transfer_submitted')}</h3>
                            <p className="text-sm text-emerald-600">{t('transfer_submitted_desc')}</p>
                        </div>
                    </div>
                )}

                {/* Materials from Store (User-Report with status 'accepted') */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <FiPackage className="text-lg text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{t('my_materials')}</h2>
                                    <p className="text-sm text-slate-500">{materials.length} {t('items_label')}</p>
                                </div>
                            </div>
                            {selectedIds.size > 0 && (
                                <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                    {selectedIds.size} {t('selected_items')}
                                </span>
                            )}
                        </div>
                    </div>

                    {materials.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <FiBox className="text-3xl text-slate-400" />
                            </div>
                            <h3 className="font-bold text-slate-700 text-lg">{t('no_materials_found')}</h3>
                            <p className="text-slate-500 mt-1 max-w-md mx-auto">{t('no_materials_desc')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {materials.map((mat) => {
                                const isSelected = selectedIds.has(mat.id);
                                const isFixed = mat.materialType === 'fixed_asset' || mat.materialType === 'fixed';
                                return (
                                    <div
                                        key={mat.id}
                                        onClick={() => toggleMaterial(mat.id)}
                                        className={`p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 hover:bg-blue-50/50 ${isSelected ? 'bg-blue-50/80 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                                            }`}
                                    >
                                        {/* Checkbox */}
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'border-2 border-slate-300'
                                            }`}>
                                            {isSelected && <FiCheckSquare className="text-sm" />}
                                        </div>

                                        {/* Image */}
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200">
                                            {mat.image ? (
                                                <img src={mat.image} alt={mat.materialName} className="w-full h-full object-cover" />
                                            ) : (
                                                <FiBox className="text-2xl text-slate-300" />
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 text-base">{mat.materialName}</h3>
                                            <div className="flex items-center gap-2 flex-wrap mt-1.5">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                                                    <FiTag className="text-[10px] text-slate-400" />
                                                    {mat.materialCode}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${isFixed ? 'bg-indigo-50 text-indigo-600' : 'bg-cyan-50 text-cyan-600'}`}>
                                                    {mat.materialType.replace(/_/g, ' ')}
                                                </span>
                                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                                                    {mat.quantity} {mat.unit}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <FiClock className="text-[10px]" />
                                                    {mat.acceptedAt
                                                        ? new Date(mat.acceptedAt).toLocaleDateString()
                                                        : 'Recently'}
                                                </span>
                                                <span className="text-slate-400">•</span>
                                                <span>{mat.condition}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Transfer Form */}
                {materials.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                    <FiSend className="text-lg text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{t('transfer_to')}</h2>
                                    <p className="text-sm text-slate-500">{t('enter_receiver_name')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <FiUser className="inline mr-2 text-slate-400" />{t('receiver_name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={receiverName}
                                        onChange={(e) => setReceiverName(e.target.value)}
                                        placeholder={t('enter_receiver_name')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <FiMail className="inline mr-2 text-slate-400" />{t('receiver_email')}
                                    </label>
                                    <input
                                        type="email"
                                        value={receiverEmail}
                                        onChange={(e) => setReceiverEmail(e.target.value)}
                                        placeholder={t('enter_receiver_email')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    <FiFileText className="inline mr-2 text-slate-400" />{t('transfer_reason')}
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={t('enter_transfer_reason')}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                                />
                            </div>

                            {/* Selected items preview */}
                            {selectedMaterials.length > 0 && (
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <p className="text-sm font-bold text-blue-800 mb-2">{t('selected_items')} ({selectedMaterials.length})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMaterials.map((item) => (
                                            <span key={item.id} className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-blue-700 border border-blue-200 shadow-sm">
                                                {item.materialName} ({item.materialCode}) — {item.quantity} {item.unit}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || selectedMaterials.length === 0 || !receiverName || !receiverEmail}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 ${submitting || selectedMaterials.length === 0 || !receiverName || !receiverEmail
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5'
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t('submitting_transfer')}
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="text-lg" />
                                        {t('initiate_transfer')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Transfer History */}
                {transfers.length > 0 && (
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
                            {transfers.map((transfer) => {
                                const badge = getStatusBadge(transfer.status);
                                const BadgeIcon = badge.icon;
                                return (
                                    <div key={transfer.id} className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FiArrowRight className="text-slate-400" />
                                                    <span className="font-bold text-slate-800">{transfer.receiverName}</span>
                                                    <span className="text-sm text-slate-500">({transfer.receiverEmail})</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                    {transfer.materials?.map((item: any, idx: number) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                                                            {item.name} ({item.materialCode}) ×{item.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                                {transfer.reason && (
                                                    <p className="text-sm text-slate-500 italic">"{transfer.reason}"</p>
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
                    </div>
                )}
            </div>
        </div>
    );
}
