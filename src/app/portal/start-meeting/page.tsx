'use client';


import JitsiMeetingComponent from '../../../components/JitsiMeetingComponent';
import MeetingAgenda from '../../../components/MeetingAgenda';
import MemberSelection from '../../../components/MemberSelection';
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { doc, setDoc, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';
import { FaStop, FaLink, FaGlobe, FaLock } from 'react-icons/fa';

export default function ChiefMeetingPage() {
    const { user } = useAuth();
    const [activeSession, setActiveSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        const unsubscribe = onSnapshot(doc(db, "meeting_sessions", "current_executive_meeting"), (doc) => {
            if (doc.exists()) setActiveSession(doc.data());
            else setActiveSession(null);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const startMeeting = async (invitedRoles: string[], isPublic: boolean) => {
        if (!db || !user) return;
        const roomID = `Meeting-${Math.random().toString(36).substring(7).toUpperCase()}`;
        const sessionData = {
            roomName: roomID,
            hostId: user.uid,
            hostName: user.displayName || 'Chief',
            isPublic: isPublic,
            invitedRoles: invitedRoles,
            createdAt: serverTimestamp(),
            status: 'active'
        };
        try {
            await setDoc(doc(db, "meeting_sessions", "current_executive_meeting"), sessionData);
        } catch (error) {
            console.error("Error starting meeting session:", error);
        }
    };

    const endMeeting = async () => {
        if (!db) return;
        try {
            await deleteDoc(doc(db, "meeting_sessions", "current_executive_meeting"));
        } catch (error) {
            console.error("Error ending meeting:", error);
        }
    };

    // Layout provides sidebar and context
    return (
        <div className="flex flex-col h-full relative">
            <div className="relative z-10 flex flex-col h-full">
                <div className="px-8 py-6">
                    <div className="pb-8">
                        {!activeSession ? (
                            <MemberSelection onStartMeeting={startMeeting} />
                        ) : (
                            <>
                                <div className={`mb-6 flex items-center justify-between p-6 rounded-3xl border shadow-sm transition-all duration-500 ${activeSession.isPublic
                                    ? 'bg-emerald-50 border-emerald-100'
                                    : 'bg-indigo-50 border-indigo-100'
                                    }`}>
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${activeSession.isPublic
                                            ? 'bg-emerald-600 text-white shadow-emerald-200'
                                            : 'bg-indigo-600 text-white shadow-indigo-200'
                                            }`}>
                                            {activeSession.isPublic ? <FaGlobe size={24} /> : <FaLock size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full animate-ping ${activeSession.isPublic ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                <h2 className={`text-xl font-black uppercase tracking-tight ${activeSession.isPublic ? 'text-emerald-900' : 'text-indigo-900'}`}>
                                                    {activeSession.isPublic ? 'Active Public Meeting' : 'Active Private Meeting'}
                                                </h2>
                                            </div>
                                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-1.5 font-medium">
                                                <FaLink className={activeSession.isPublic ? 'text-emerald-500' : 'text-indigo-500'} />
                                                Room ID: <span className="font-mono bg-white/60 px-2 py-1 rounded border border-gray-100">{activeSession.roomName}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={endMeeting}
                                        className="px-8 py-3 bg-white text-red-600 rounded-2xl font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <FaStop /> END SESSION
                                    </button>
                                </div>
                                <div className="flex flex-col lg:flex-row gap-6 h-[700px] lg:h-[600px]">
                                    <div className="flex-1 min-w-0">
                                        <JitsiMeetingComponent roomName={activeSession.roomName} />
                                    </div>
                                    <div className="w-full lg:w-80 flex-shrink-0">
                                        <MeetingAgenda />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
