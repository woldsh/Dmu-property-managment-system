'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { FaBoxOpen, FaTimes, FaBell } from 'react-icons/fa';

interface PendingRequest {
    id: string;
    requesterName: string;
    department: string;
    items: { materialName: string }[];
    createdAt: any;
}

export default function RequestNotificationBanner() {
    const { userRole, department } = useAuth();
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [dismissed, setDismissed] = useState(false);
    const [lastSeenCount, setLastSeenCount] = useState(0);
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        if (!db || !userRole) return;

        const role = userRole.toLowerCase();
        const requestsRef = collection(db!, 'Request_materials');
        let q;

        // Determine query based on role
        if (role === 'student_service_dormitory_leader') {
            q = query(requestsRef, where('currentApproverRole', '==', 'student_service_dormitory_leader'), where('status', '==', 'pending_department_leader'));
        } else if (role === 'student_service_cafeteria_leader') {
            q = query(requestsRef, where('currentApproverRole', '==', 'student_service_cafeteria_leader'), where('status', '==', 'pending_department_leader'));
        } else if (role === 'student_service_sport_leader') {
            q = query(requestsRef, where('currentApproverRole', '==', 'student_service_sport_leader'), where('status', '==', 'pending_department_leader'));
        } else if (role === 'hrm_leader') {
            q = query(requestsRef, where('currentApproverRole', '==', 'hrm_leader'), where('status', '==', 'pending_department_leader'));
        } else if (role === 'finance_leader') {
            q = query(requestsRef, where('currentApproverRole', '==', 'finance_leader'), where('status', '==', 'pending_department_leader'));
        } else if (role === 'student_service_leader') {
            q = query(requestsRef, where('status', '==', 'pending_student_service_leader'));
        } else if (role.endsWith('_leader')) {
            // Dynamic leaders (e.g. quality_assurance_leader)
            q = query(requestsRef, where('currentApproverRole', '==', userRole), where('status', '==', 'pending_department_leader'));
        } else if (role.endsWith('_head')) {
            let dept = department;
            if (!dept) dept = role.replace('_head', '');
            if (dept) {
                q = query(requestsRef, where('department', '==', dept), where('currentApproverRole', '==', 'department_head'), where('status', 'in', ['pending', 'pending_department_leader']));
            }
        } else if (role === 'academic_coordinator') {
            q = query(requestsRef, where('currentApproverRole', '==', 'academic_coordinator'), where('status', '==', 'approved_by_head'));
        } else if (role === 'managing_director' || role === 'managing_director_leader') {
            q = query(requestsRef, where('status', 'in', ['approved_by_coordinator', 'pending_managing_director', 'approved_by_student_service_leader']));
        } else if (role === 'general_service_leader') {
            q = query(requestsRef, where('status', 'in', ['approved_by_md', 'pending_general_service']));
        } else if (role === 'procurement_team_leader') {
            q = query(requestsRef, where('status', 'in', ['forwarded_to_team_leader', 'pending_procurement']));
        } else if (role.includes('stock_clerk')) {
            q = query(requestsRef, where('currentApproverRole', '==', userRole), where('status', '==', 'approved_by_procurement_team_leader'));
        } else if (role.includes('store_keeper')) {
            q = query(requestsRef, where('currentApproverRole', '==', userRole), where('status', '==', 'approved_by_clerk'));
        }

        if (!q) return;

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PendingRequest[];

            // Detect new requests
            if (requests.length > lastSeenCount && lastSeenCount > 0) {
                setIsNew(true);
                setDismissed(false); // Re-show banner for new requests
            }
            setLastSeenCount(requests.length);
            setPendingRequests(requests);
        });

        return () => unsubscribe();
    }, [userRole, department]);

    // Auto-hide after 15 seconds for non-new notifications
    useEffect(() => {
        if (pendingRequests.length > 0 && isNew) {
            const timer = setTimeout(() => setIsNew(false), 15000);
            return () => clearTimeout(timer);
        }
    }, [isNew, pendingRequests.length]);

    if (pendingRequests.length === 0 || dismissed) return null;

    const latestRequest = pendingRequests[0];
    const totalItems = pendingRequests.reduce((sum, r) => sum + (r.items?.length || 0), 0);

    // Dynamic Base Path Logic
    let basePath = '/admin-staff/team-leader';
    if (userRole) {
        if (userRole === 'academic_coordinator') basePath = '/dashboard';
        else if (userRole.endsWith('_head') || userRole.endsWith('_teacher')) basePath = '/dashboard';
        else if (userRole === 'managing_director' || userRole === 'chief') basePath = '/portal';
        else if (userRole === 'general_service_leader') basePath = '/service';
        else if (userRole === 'procurement_team_leader') basePath = '/procurement-management/team-leader';
        else if (userRole.includes('stock_clerk')) {
            basePath = userRole.includes('consumable') ? '/procurement-management/stock-clerk/consumable-material' : '/procurement-management/stock-clerk/fixed-material';
        }
        else if (userRole.includes('store_keeper')) basePath = '/workspace'; // Or specific store path
    }

    return (
        <div className={`relative group overflow-hidden transition-all duration-700 ${isNew ? 'animate-in slide-in-from-top-4' : ''}`}>
            {/* Animated Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 animate-gradient-x" />

            <div className="relative px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                            <FaBell className="text-white text-xl" />
                        </div>
                        {/* Pulse ring for new notifications */}
                        {isNew && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <span className="text-white text-[10px] font-black">{pendingRequests.length}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black bg-white text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {isNew ? 'New' : 'Pending'}
                            </span>
                            <h3 className="text-white font-black text-lg tracking-tight">
                                {pendingRequests.length === 1
                                    ? `Material Request from ${latestRequest?.requesterName || 'Employee'}`
                                    : `${pendingRequests.length} Pending Material Requests`
                                }
                            </h3>
                        </div>
                        <p className="text-emerald-100 text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                            {pendingRequests.length === 1
                                ? `${totalItems} item${totalItems !== 1 ? 's' : ''} awaiting your review and approval`
                                : `${totalItems} total items across ${pendingRequests.length} requests need your attention`
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link
                        href={`${basePath}/view-requests`}
                        className="flex-1 md:flex-none px-8 py-3 bg-white text-emerald-600 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                        <FaBoxOpen className="group-hover:animate-bounce" />
                        REVIEW NOW
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
