'use client';

import JitsiMeetingComponent from '@/components/JitsiMeetingComponent';
import MeetingAgenda from '@/components/MeetingAgenda';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaLock, FaUserSlash } from 'react-icons/fa';

export default function MeetingPage() {
    const { userRole, department } = useAuth();
    const { t } = useLanguage();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        const unsubscribe = onSnapshot(doc(db!, "meeting_sessions", "current_executive_meeting"), (doc) => {
            if (doc.exists()) setSession(doc.data());
            else setSession(null);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[600px] text-gray-400">
            <p className="animate-pulse">{t('loading_meeting')}</p>
        </div>
    );

    const role = userRole?.toLowerCase() || '';
    const deptNormalized = (department || '').toLowerCase().replace(/\s+/g, '_');

    // Check invitations for both Department Head and Academic Coordinator
    const isInvited = session && (
        session.isPublic ||
        session.invitedRoles.includes(role) ||
        session.invitedRoles.includes(`department_head_${deptNormalized}`) ||
        (role.endsWith('_head') && session.invitedRoles.includes(`department_head_${role.replace('_head', '')}`)) ||
        (role === 'academic_coordinator' && session.invitedRoles.includes('academic_coordinator'))
    );

    return (
        <div className="flex-1 px-8 py-6">
            {!session ? (
                <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 font-sans">
                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                        <FaUserSlash size={32} className="opacity-20" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">{t('no_active_meeting')}</h3>
                    <p className="text-gray-500 font-medium">{t('no_ongoing_meeting_msg')}</p>
                </div>
            ) : !isInvited ? (
                <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 font-sans text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                        <FaLock size={32} className="text-red-400/40" />
                    </div>
                    <h3 className="text-2xl font-black text-red-600 mb-2">{t('access_denied')}</h3>
                    <p className="text-lg font-bold text-red-400/80 uppercase tracking-widest bg-red-50 px-6 py-2 rounded-full border border-red-100">
                        {t('not_invited_msg')}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 h-[700px] lg:h-[600px] animate-in fade-in duration-700">
                    <div className="flex-1 min-w-0 bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                        <JitsiMeetingComponent roomName={session.roomName} />
                    </div>
                    <div className="w-full lg:w-96 flex-shrink-0 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <MeetingAgenda />
                    </div>
                </div>
            )}
        </div>
    );
}
