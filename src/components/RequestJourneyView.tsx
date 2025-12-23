'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiBox,
    FiActivity,
    FiChevronDown,
    FiChevronUp,
    FiUserCheck,
    FiFileText,
    FiTruck,
    FiShield,
    FiBriefcase
} from 'react-icons/fi';
import Image from 'next/image';

interface RequestItem {
    materialName: string;
    quantity: number;
    unit: string;
    image?: string;
    materialCode: string;
}

interface RequestJourney {
    id: string;
    requesterId: string;
    items: RequestItem[];
    status: string;
    createdAt: any;
    currentApproverRole: string;
}

const JOURNEY_STEPS = [
    { id: 'submission', label: 'Submission', status: 'pending', icon: FiFileText, description: 'Request submitted to Dept Head' },
    { id: 'dept_head', label: 'Dept Head', status: 'approved_by_head', icon: FiUserCheck, description: 'Department Head Approval' },
    { id: 'coordinator', label: 'Coordinator', status: 'approved_by_coordinator', icon: FiShield, description: 'Academic Coordinator Review' },
    { id: 'md', label: 'Director', status: 'approved_by_md', icon: FiBriefcase, description: 'Managing Director Authorization' },
    { id: 'gs', label: 'General Service', status: 'forwarded_to_team_leader', icon: FiTruck, description: 'General Service Processing' },
    { id: 'team_leader', label: 'Team Leader', status: 'approved_by_procurement_team_leader', icon: FiActivity, description: 'Procurement Team Oversight' },
    { id: 'clerk', label: 'Store Clerk', status: 'approved_by_clerk', icon: FiBox, description: 'Clerk Verification' },
    { id: 'store', label: 'Store', status: 'completed', icon: FiCheckCircle, description: 'Final Store Fulfillment' }
];

export default function RequestJourneyView() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<RequestJourney[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'Request_materials'),
            where('requesterId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RequestJourney[];

            // Sort client-side to avoid Firestore index requirement
            fetchedRequests.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setRequests(fetchedRequests);
            setLoading(false);

            // Auto-expand the most recent request
            if (fetchedRequests.length > 0 && expandedIds.size === 0) {
                setExpandedIds(new Set([fetchedRequests[0].id]));
            }
        });

        // Fetch user role for conditional step rendering
        async function fetchUserData() {
            const userDoc = await getDoc(doc(db, 'users', user!.uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            }
        }
        fetchUserData();

        return () => unsubscribe();
    }, [user]);

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const getStepStatus = (requestStatus: string, stepIndex: number) => {
        // Map current request status to an index in our JOURNEY_STEPS array
        const statusMap: Record<string, number> = {
            'pending': 0,
            'approved_by_head': 1,
            'approved_by_coordinator': 2,
            'approved_by_md': 3,
            'forwarded_to_team_leader': 4,
            'approved_by_procurement_team_leader': 5,
            'approved_by_clerk': 6,
            'completed': 7
        };

        const currentStepIndex = statusMap[requestStatus] ?? -1;

        if (stepIndex < currentStepIndex) return 'completed';
        if (stepIndex === currentStepIndex) return 'current';
        return 'pending';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full -mr-40 -mt-40 blur-[100px] opacity-60"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                        <FiActivity className="animate-pulse" /> Live Tracking
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter flex items-center gap-4">
                        Request <span className="text-indigo-600">Journey</span>
                    </h2>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em] opacity-60">
                        Real-time Material Request Tracking Protocol
                    </p>
                </div>
            </div>

            {/* Requests List */}
            <div className="space-y-6">
                {requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        <FiBox className="mx-auto text-4xl text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No Requests Found</h3>
                        <p className="text-slate-400 text-sm">You haven't submitted any material requests yet.</p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                            {/* Request Summary Header */}
                            <div
                                onClick={() => toggleExpand(request.id)}
                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner
                                        ${request.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {request.status === 'completed' ? <FiCheckCircle /> : <FiClock />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">
                                            {request.items[0]?.materialName}
                                            {request.items.length > 1 && <span className="text-slate-400 text-sm font-normal ml-2">+{request.items.length - 1} more</span>}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID: {request.id.slice(0, 8)}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                {request.createdAt?.toDate().toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider
                                        ${request.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {request.status.replace(/_/g, ' ')}
                                    </div>
                                    {expandedIds.has(request.id) ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
                                </div>
                            </div>

                            {/* Expanded Journey Timeline */}
                            {expandedIds.has(request.id) && (
                                <div className="p-8 border-t border-slate-100 bg-slate-50/30">
                                    {/* Items Grid */}
                                    <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {request.items.map((item, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 relative overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        <Image src={item.image} alt={item.materialName} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400"><FiBox /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm">{item.materialName}</p>
                                                    <p className="text-xs text-slate-400 font-bold mt-1">Qty: {item.quantity} {item.unit}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Timeline */}
                                    <div className="relative">
                                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 lg:left-0 lg:top-8 lg:w-full lg:h-0.5 hidden lg:block"></div>

                                        <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 relative z-10">
                                            {JOURNEY_STEPS.filter(step => {
                                                // For Dept Head, skip ONLY the 'submission' step. 
                                                // 'dept_head' becomes Step 1.
                                                if (userData?.userRole?.includes('_head') && step.id === 'submission') return false;

                                                // For Academic Coordinator, skip 'submission' and 'dept_head' steps (Start at Step 3: Coordinator as Submission)
                                                if (userData?.userRole === 'academic_coordinator' && (step.id === 'submission' || step.id === 'dept_head')) return false;

                                                // For Managing Director, skip 'submission', 'dept_head', and 'coordinator' steps (Start at Step 4: MD as Submission)
                                                // Check for both possible role strings to be safe
                                                const isMD = userData?.userRole === 'managing_director' || userData?.userRole === 'managing_director_leader';
                                                if (isMD && (step.id === 'submission' || step.id === 'dept_head' || step.id === 'coordinator')) return false;

                                                // For Team Leader, skip 'submission', 'dept_head', 'coordinator', 'md', and 'gs' (Start at Step 5: Team Leader as Submission)
                                                if (userData?.userRole === 'procurement_team_leader' && (step.id === 'submission' || step.id === 'dept_head' || step.id === 'coordinator' || step.id === 'md' || step.id === 'gs')) return false;

                                                // For General Service, skip 'submission', 'dept_head', 'coordinator', and 'md' (Start at Step 4 (Index 4): GS as Submission)
                                                if (userData?.userRole === 'general_service_leader' && (step.id === 'submission' || step.id === 'dept_head' || step.id === 'coordinator' || step.id === 'md')) return false;

                                                return true;
                                            }).map((step, index) => {
                                                // Calculate status using absolute index in original JOURNEY_STEPS
                                                // This ensures correct status even when steps are filtered out
                                                const currentStatusIndex = JOURNEY_STEPS.findIndex(s => s.status === request.status);
                                                const thisStepIndex = JOURNEY_STEPS.findIndex(s => s.id === step.id);

                                                let stepStatus = 'pending';
                                                if (currentStatusIndex >= thisStepIndex) {
                                                    stepStatus = 'completed';
                                                } else if (currentStatusIndex === thisStepIndex - 1) {
                                                    stepStatus = 'current';
                                                }

                                                // Special case: If status is 'pending' (0) and we are showing Coordinator (2) as first step for Dept Head
                                                // We want Coordinator to be 'current' effectively if Dept Head auto-approved (so effectively status 1)
                                                // But usually Dept Head submits -> status becomes 'approved_by_head' (1) if logic is correct.
                                                // If logic is 'pending', we might see nothing current. 
                                                // Let's assume request status handles this, or add a fallback if needed.

                                                const Icon = step.icon;

                                                let label = step.label;
                                                let description = step.description;

                                                if (userData?.userRole?.includes('_head') && step.id === 'dept_head') {
                                                    label = 'Submission';
                                                    description = 'Request submitted to academic coordinator';
                                                }

                                                if (userData?.userRole === 'academic_coordinator') {
                                                    if (step.id === 'coordinator') {
                                                        label = 'Submission';
                                                        description = 'Request submitted to managing director';
                                                    }
                                                    if (step.id === 'md') {
                                                        label = 'Managing Director Authorization';
                                                    }
                                                }

                                                const isMD = userData?.userRole === 'managing_director' || userData?.userRole === 'managing_director_leader';
                                                if (isMD && step.id === 'md') {
                                                    label = 'Submission';
                                                    description = 'Request submitted to general service';
                                                }

                                                if (userData?.userRole === 'procurement_team_leader' && step.id === 'team_leader') {
                                                    label = 'Submission';
                                                    description = 'Request submitted to store clerk';
                                                }

                                                if (userData?.userRole === 'general_service_leader' && step.id === 'gs') {
                                                    label = 'Submission';
                                                    description = 'Request submitted to procurement team leader';
                                                }

                                                return (
                                                    <div key={step.id} className="flex lg:flex-col items-center gap-6 lg:gap-4 relative group">
                                                        {/* Vertical Line for Mobile */}
                                                        <div className="absolute left-8 -top-8 -bottom-8 w-0.5 bg-slate-200 lg:hidden group-first:top-0 group-last:bottom-0"></div>

                                                        {/* Step Circle */}
                                                        <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl transition-all duration-500 relative z-10 border-4
                                                            ${stepStatus === 'completed'
                                                                ? 'bg-emerald-500 border-white text-white shadow-lg shadow-emerald-500/30'
                                                                : stepStatus === 'current'
                                                                    ? 'bg-indigo-600 border-white text-white shadow-xl shadow-indigo-600/40 scale-110'
                                                                    : 'bg-white border-slate-100 text-slate-300'
                                                            }`}>
                                                            <Icon />
                                                            {stepStatus === 'current' && (
                                                                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
                                                            )}
                                                        </div>

                                                        {/* Step Info */}
                                                        <div className="text-left lg:text-center flex-1 py-4 lg:py-0">
                                                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1
                                                                ${stepStatus === 'completed' ? 'text-emerald-600' : stepStatus === 'current' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                                Step {index + 1}
                                                            </p>
                                                            <h4 className={`font-bold text-sm mb-1
                                                                ${stepStatus === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                                                                {label}
                                                            </h4>
                                                            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[150px] lg:mx-auto">
                                                                {description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

