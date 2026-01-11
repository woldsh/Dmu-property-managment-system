'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { FaVideo, FaTimes, FaBell } from 'react-icons/fa';

export default function MeetingNotificationBanner() {
    const { userRole, department } = useAuth();
    const [meeting, setMeeting] = useState<any>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (!db) return;
        const unsubscribe = onSnapshot(doc(db!, "meeting_sessions", "current_executive_meeting"), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const role = userRole?.toLowerCase() || '';
                const deptNormalized = (department || '').toLowerCase().replace(/\s+/g, '_');

                const isHeadsOrAC = role.endsWith('_head') ||
                    role === 'academic_coordinator' ||
                    data.invitedRoles.includes(`department_head_${deptNormalized}`);

                const isInvited = (data.isPublic && isHeadsOrAC) ||
                    data.invitedRoles.includes(role) ||
                    data.invitedRoles.includes(`department_head_${deptNormalized}`) ||
                    (role.endsWith('_head') && data.invitedRoles.includes(`department_head_${role.replace('_head', '')}`)) ||
                    (role === 'academic_coordinator' && data.invitedRoles.includes('academic_coordinator'));

                if (isInvited) {
                    setMeeting(data);
                    setDismissed(false); // Reset dismissal when a new meeting starts
                } else {
                    setMeeting(null);
                }
            } else {
                setMeeting(null);
            }
        });
        return () => unsubscribe();
    }, [userRole, department]);

    if (!meeting || dismissed) return null;

    return (
        <div className="relative group overflow-hidden">
            {/* Animated Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 animate-gradient-x" />

            <div className="relative px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
                        <FaBell className="text-white text-xl" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black bg-white text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Urgent</span>
                            <h3 className="text-white font-black text-lg tracking-tight">Urgent Chief invite you to meeting</h3>
                        </div>
                        <p className="text-indigo-100 text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                            The Institution Head is requesting your presence in the executive session.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link
                        href="/dashboard/meeting"
                        className="flex-1 md:flex-none px-8 py-3 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                        <FaVideo className="group-hover:animate-bounce" />
                        JOIN NOW
                    </Link>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        title="Dismiss"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 3s ease infinite;
                }
            `}</style>
        </div>
    );
}
