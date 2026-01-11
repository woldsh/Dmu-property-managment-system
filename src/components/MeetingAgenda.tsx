'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { FaClipboardList, FaClock, FaUser, FaComments } from 'react-icons/fa';
import MeetingChat from './MeetingChat';

export default function MeetingAgenda() {
    const { t, language } = useLanguage();
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'agenda' | 'chat'>('agenda');

    useEffect(() => {
        fetchRecentIssues();
    }, []);

    const fetchRecentIssues = async () => {
        if (!db) return;
        try {
            const q = query(
                collection(db!, "Request_materials"),
                where("status", "in", ["pending", "pending_head", "pending_md", "approved_by_head"]),
                orderBy("createdAt", "desc"),
                limit(5)
            );
            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIssues(items);
        } catch (error: any) {
            console.error("Error fetching agenda issues:", error);
            if (error.message?.includes('index')) {
                setError('DATABASE_INDEX_REQUIRED');
            } else {
                setError('FAILED_TO_LOAD');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('agenda')}
                    className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'agenda'
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <FaClipboardList /> {t('agenda_label')}
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'chat'
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <FaComments /> {t('discussion_label')}
                </button>
            </div>

            {activeTab === 'agenda' ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : error === 'DATABASE_INDEX_REQUIRED' ? (
                            <div className="text-center py-6 px-4 bg-amber-50 rounded-xl border border-amber-100">
                                <p className="text-amber-800 text-xs font-bold mb-1">Index Required</p>
                                <p className="text-amber-600 text-[10px] leading-relaxed">
                                    The meeting agenda requires a Firestore index.
                                </p>
                            </div>
                        ) : (
                            issues.map((issue) => (
                                <div key={issue.id} className="p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 transition-colors cursor-default group">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate max-w-[150px]">
                                            {issue.materialName || t('unnamed_request')}
                                        </h4>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <FaClock size={10} /> {issue.createdAt?.toDate ? new Date(issue.createdAt.toDate()).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US') : t('recent')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <FaUser size={10} />
                                        <span>{issue.requestedBy || t('employee')}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span className={`font-medium ${issue.status?.includes('pending') ? 'text-amber-500' : 'text-blue-500'}`}>
                                            {issue.status?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    <MeetingChat />
                </div>
            )}
        </div>
    );
}
