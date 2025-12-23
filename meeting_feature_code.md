# 📹 Jitsi Meeting Integration Code Guide

This guide contains all the code required to implement the real-time meeting system, including selective invitations, live chat, and agenda integration.

---

## 🛠 Prerequisites

### 📦 Dependencies
Ensure you have these installed in your `frontend` project:
```bash
npm install react-icons @jitsi/react-sdk lucide-react
```

### 🔥 Firebase Collections
The following collections are used in Firestore:
- `meeting_sessions`: Stores the active meeting metadata (`roomName`, `isPublic`, `invitedRoles`).
- `meeting_messages`: Stores the live chat messages.
- `users`: Used to fetch staff details for invitations.

---

## 🏗 Core Components

### 1. [MemberSelection.tsx](file:///c:/Users/hp/property-management-system/frontend/src/components/MemberSelection.tsx)
Handles the Chief's ability to pick specific members to invite.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { FaUserPlus, FaUsers, FaLock, FaGlobe, FaChevronRight, FaPaperPlane, FaUserTie, FaLaptopCode, FaChartLine, FaCalculator } from 'react-icons/fa';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface MemberSelectionProps {
    onStartMeeting: (invitedRoles: string[], isPublic: boolean) => void;
}

interface StaffUser {
    id: string;
    fullName: string;
    userRole: string;
    subRole: string;
    email: string;
}

export default function MemberSelection({ onStartMeeting }: MemberSelectionProps) {
    const [staff, setStaff] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(true);

    const departments = [
        { 
            id: 'computer_science', 
            label: 'Computer Science', 
            icon: <FaLaptopCode size={18} />, 
            color: 'from-cyan-500 to-blue-600',
            bg: 'bg-cyan-50',
            border: 'border-cyan-100',
            text: 'text-cyan-700',
            activeShadow: 'shadow-cyan-200'
        },
        { 
            id: 'economics', 
            label: 'Economics', 
            icon: <FaChartLine size={18} />, 
            color: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            text: 'text-amber-700',
            activeShadow: 'shadow-amber-200'
        },
        { 
            id: 'accounting', 
            label: 'Accounting', 
            icon: <FaCalculator size={18} />, 
            color: 'from-rose-500 to-red-600',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            text: 'text-rose-700',
            activeShadow: 'shadow-rose-200'
        },
    ];

    useEffect(() => {
        const fetchStaff = async () => {
            if (!db) return;
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const filteredStaff: StaffUser[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const subRole = (data.subRole || '').toLowerCase();
                    const userRole = (data.userRole || '').toLowerCase();
                    
                    if (subRole === 'department_head' || subRole === 'academic_coordinator' || 
                        userRole.includes('department_head') || userRole.includes('academic_coordinator') ||
                        userRole.endsWith('_head')) {
                        
                        filteredStaff.push({
                            id: doc.id,
                            fullName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown User',
                            userRole: userRole,
                            subRole: subRole,
                            email: data.email || ''
                        });
                    }
                });
                setStaff(filteredStaff);
            } catch (error) {
                console.error("Error fetching staff:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    const toggleRole = (roleId: string) => {
        setIsPublic(false);
        setSelectedRoles(prev =>
            prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
        );
    };

    const toggleDept = (deptId: string) => {
        setIsPublic(false);
        setSelectedDepartments(prev =>
            prev.includes(deptId) ? prev.filter(d => d !== deptId) : [...prev, deptId]
        );
    };

    const handleStart = () => {
        const finalInvites = [...selectedRoles];
        selectedDepartments.forEach(dept => {
            finalInvites.push(`department_head_${dept}`);
        });
        onStartMeeting(finalInvites, isPublic);
    };

    const getStaffByDept = (deptId: string) => {
        return staff.find(s => 
            s.userRole.includes(deptId.toLowerCase()) && 
            (s.subRole === 'department_head' || s.userRole.endsWith('_head'))
        );
    };

    const getAC = () => {
        return staff.find(s => s.subRole === 'academic_coordinator' || s.userRole.includes('academic_coordinator'));
    };

    const acUser = getAC();

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FaUserPlus className="text-indigo-600" /> Meeting Access Control
                    </h3>
                    <p className="text-sm text-gray-500">Pick participants below to invite them</p>
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner">
                    <button
                        onClick={() => { setIsPublic(true); setSelectedRoles([]); setSelectedDepartments([]); }}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all duration-300 ${isPublic 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                            : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <FaGlobe size={14} /> PUBLIC
                    </button>
                    <button
                        onClick={() => setIsPublic(false)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all duration-300 ${!isPublic 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                            : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <FaLock size={14} /> PRIVATE
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-24 bg-gray-50 rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-40 bg-gray-50 rounded-xl" />
                        <div className="h-40 bg-gray-50 rounded-xl" />
                        <div className="h-40 bg-gray-50 rounded-xl" />
                    </div>
                </div>
            ) : (
                <div className="space-y-6 mb-6">
                    {/* Academic Coordinator Section */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Academic Support</h4>
                        <button
                            onClick={() => toggleRole('academic_coordinator')}
                            className={`p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${selectedRoles.includes('academic_coordinator')
                                ? 'border-indigo-600 bg-indigo-50/50'
                                : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRoles.includes('academic_coordinator') ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-100'
                                    }`}>
                                    <FaUserTie size={20} />
                                </div>
                                <div>
                                    <span className={`text-sm font-bold block ${selectedRoles.includes('academic_coordinator') ? 'text-indigo-700' : 'text-gray-900'}`}>Academic Coordinator</span>
                                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-tighter">
                                        {acUser?.fullName || 'No user assigned'}
                                    </p>
                                </div>
                            </div>
                            {selectedRoles.includes('academic_coordinator') && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse mr-2" />}
                        </button>
                    </div>

                    {/* Department Head Specific Selection */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Department Heads</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {departments.map((dept) => {
                                const head = getStaffByDept(dept.id);
                                const isSelected = selectedDepartments.includes(dept.id);
                                return (
                                    <button
                                        key={dept.id}
                                        onClick={() => toggleDept(dept.id)}
                                        className={`p-5 rounded-3xl border-2 transition-all text-left group flex flex-col justify-between h-48 shadow-sm hover:shadow-md ${isSelected
                                            ? `border-transparent bg-white ${dept.activeShadow} ring-2 ring-offset-2 ring-indigo-500`
                                            : `${dept.bg}/40 ${dept.border} hover:border-indigo-200`
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6 shadow-sm ${isSelected 
                                                ? `bg-gradient-to-br ${dept.color} text-white scale-110` 
                                                : `${dept.bg} ${dept.text} border ${dept.border}`
                                                }`}>
                                                {dept.icon}
                                            </div>
                                            {isSelected && (
                                                <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full shadow-sm">
                                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">INVITED</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] block mb-1.5 ${dept.text}`}>
                                                {dept.label}
                                            </span>
                                            <p className={`text-base font-black leading-tight transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {head?.fullName || 'No head assigned'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${head ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                <p className={`text-[10px] truncate font-bold ${dept.text}`}>{head?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleStart}
                disabled={loading}
                className={`w-full py-4 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed ${isPublic 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                }`}
            >
                {isPublic ? 'START PUBLIC MEETING (EVERYONE)' : `START PRIVATE & SEND INVITES (${selectedRoles.length + selectedDepartments.length})`}
                <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>
    );
}
```

### 2. [JitsiMeetingComponent.tsx](file:///c:/Users/hp/property-management-system/frontend/src/components/JitsiMeetingComponent.tsx)
The main video conference component using `meet.ffmuc.net` (no time limit).

```tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useAuth } from '../contexts/AuthContext';
import { FaVideo } from 'react-icons/fa';

interface JitsiMeetingComponentProps {
    roomName?: string;
}

const JitsiMeetingComponent: React.FC<JitsiMeetingComponentProps> = ({
    roomName = 'PropertyManagementExecutiveMeeting'
}) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [api, setApi] = useState<any>(null);
    const { user, userRole } = useAuth();
    const domain = 'meet.ffmuc.net';
    const computedDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Executive User';

    const normalizedRole = userRole?.toLowerCase() || '';
    const isChief = normalizedRole === 'chief' || normalizedRole === 'admin';
    const connectionStatus = isChief ? 'Starting Meeting...' : 'Joining Meeting...';

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (api) {
                api.dispose();
            }
        };
    }, [api]);

    const loadJitsiScript = () => {
        if (!jitsiContainerRef.current || typeof window === 'undefined' || !(window as any).JitsiMeetExternalAPI) return;

        if (api) api.dispose();

        const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: true,
                prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'security'
                ],
            },
            userInfo: {
                displayName: `${computedDisplayName} (${userRole || 'Executive'})`,
                email: user?.email || '',
            }
        };

        const newApi = new (window as any).JitsiMeetExternalAPI(domain, options);
        setApi(newApi);
    };

    return (
        <div className="w-full h-[600px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
            <Script
                src="https://meet.ffmuc.net/external_api.js"
                onLoad={loadJitsiScript}
            />
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white pointer-events-auto">
                        <FaVideo />
                    </div>
                    <div>
                        <h3 className="text-white font-bold tracking-tight">Executive Live Video Conference</h3>
                        <p className="text-slate-300 text-xs font-medium uppercase tracking-widest">
                            Room: {roomName}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest pointer-events-auto ${isChief ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                    {connectionStatus}
                </div>
            </div>

            <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>
    );
};

export default JitsiMeetingComponent;
```

### 3. [MeetingChat.tsx](file:///c:/Users/hp/property-management-system/frontend/src/components/MeetingChat.tsx)
Real-time discussion panel synchronized with Firestore.

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';

export default function MeetingChat() {
    const { user, userRole } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!db) return;

        const q = query(
            collection(db, "meeting_messages"),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).reverse();
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !db) return;

        setSending(true);
        try {
            const displayName = user.displayName || user.email?.split('@')[0] || 'Executive';
            await addDoc(collection(db, "meeting_messages"), {
                text: newMessage,
                senderId: user.uid,
                senderName: displayName,
                senderRole: userRole || 'Executive',
                createdAt: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                style={{ maxHeight: 'calc(100% - 60px)' }}
            >
                {messages.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400 text-xs italic">Start the discussion...</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === user?.uid;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {msg.senderName} ({msg.senderRole})
                                    </span>
                                </div>
                                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${isMe
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
                >
                    <FaPaperPlane className={sending ? 'animate-pulse' : ''} />
                </button>
            </form>
        </div>
    );
}
```

### 4. [MeetingAgenda.tsx](file:///c:/Users/hp/property-management-system/frontend/src/components/MeetingAgenda.tsx)
A tabbed container for switching between the Live Agenda and Live Chat.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FaClipboardList, FaClock, FaUser, FaComments } from 'react-icons/fa';
import MeetingChat from './MeetingChat';

export default function MeetingAgenda() {
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab ] = useState<'agenda' | 'chat'>('agenda');

    useEffect(() => {
        fetchRecentIssues();
    }, []);

    const fetchRecentIssues = async () => {
        if (!db) return;
        try {
            const q = query(
                collection(db, "requested_materials"),
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
                    <FaClipboardList /> AGENDA
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'chat'
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <FaComments /> DISCUSSION
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
                                            {issue.materialName || 'Unnamed Request'}
                                        </h4>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <FaClock size={10} /> {issue.createdAt?.toDate ? new Date(issue.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <FaUser size={10} />
                                        <span>{issue.requestedBy || 'User'}</span>
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
```

---

## 📄 Meeting Pages

### Chief Meeting Page
`app/chief/meeting/page.tsx`

```tsx
'use client';

import Header from '../../../src/components/Header';
import ChiefSidebar from '../../../src/components/ChiefSidebar';
import { SidebarProvider } from '../../../src/contexts/SidebarContext';
import JitsiMeetingComponent from '../../../src/components/JitsiMeetingComponent';
import MeetingAgenda from '../../../src/components/MeetingAgenda';
import MemberSelection from '../../../src/components/MemberSelection';
import { useState, useEffect } from 'react';
import { db } from '../../../src/lib/firebase';
import { doc, setDoc, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../../src/contexts/AuthContext';
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

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <ChiefSidebar />
                <div className="flex-1 flex flex-col">
                    <Header title="Executive Meeting" subtitle="Selective Invitations Control" />
                    <main className="flex-1 px-8 py-6">
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
                                                Room ID: <span className="font-mono bg-white/60 px-2 py-0.5 rounded border border-gray-100">{activeSession.roomName}</span>
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
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
```

### Department Head Meeting Page
`app/academic-staff/department-head/meeting/page.tsx`

```tsx
'use client';

import Header from '../../../../src/components/Header';
import DepartmentHeadSidebar from '../../../../src/components/DepartmentHeadSidebar';
import { SidebarProvider } from '../../../../src/contexts/SidebarContext';
import JitsiMeetingComponent from '../../../../src/components/JitsiMeetingComponent';
import MeetingAgenda from '../../../../src/components/MeetingAgenda';
import { useState, useEffect } from 'react';
import { db } from '../../../../src/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { FaLock, FaClock } from 'react-icons/fa';

export default function DepartmentHeadMeetingPage() {
    const { userRole, department } = useAuth();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        const unsubscribe = onSnapshot(doc(db, "meeting_sessions", "current_executive_meeting"), (doc) => {
            if (doc.exists()) setSession(doc.data());
            else setSession(null);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const role = userRole?.toLowerCase() || '';
    const dept = department?.toLowerCase() || '';
    const isInvited = session && (
        session.isPublic || 
        session.invitedRoles.includes(role) || 
        session.invitedRoles.includes(`department_head_${dept}`)
    );

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <DepartmentHeadSidebar />
                <div className="flex-1 flex flex-col">
                    <Header title="Executive Meeting" subtitle="Live Participation" />
                    <main className="flex-1 px-8 py-6">
                        {!session ? (
                           <p>No Active Meeting</p>
                        ) : !isInvited ? (
                           <p>Private Session - You are not invited yet.</p>
                        ) : (
                            <div className="flex flex-col lg:flex-row gap-6 h-[700px] lg:h-[600px]">
                                <div className="flex-1 min-w-0">
                                    <JitsiMeetingComponent roomName={session.roomName} />
                                </div>
                                <div className="w-full lg:w-80 flex-shrink-0">
                                    <MeetingAgenda />
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
```

---

## 🔔 Sidebar Notification Logic
Add this `useEffect` to your Sidebar components to show the "Message from Chief" alert.

```tsx
    const { userRole, department } = useAuth();
    const [meetingInvite, setMeetingInvite] = useState<any>(null);

    useEffect(() => {
        if (!db) return;
        const unsubscribe = onSnapshot(doc(db, "meeting_sessions", "current_executive_meeting"), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const role = userRole?.toLowerCase() || '';
                const dept = department?.toLowerCase() || '';
                const isInvited = data.isPublic || data.invitedRoles.includes(role) || data.invitedRoles.includes(`department_head_${dept}`);
                if (isInvited) setMeetingInvite(data);
                else setMeetingInvite(null);
            } else {
                setMeetingInvite(null);
            }
        });
        return () => unsubscribe();
    }, [userRole, department]);
```

**JSX for Notification:**
```tsx
{meetingInvite && (
    <Link href={`${basePath}/meeting`} className="p-4 bg-indigo-600 rounded-2xl text-white block">
        Message from Chief: You are invited to the meeting!
    </Link>
)}
```

> [!TIP]
> Use the `useAuth` hook to get the user's role and department for accurate invitation checking.
