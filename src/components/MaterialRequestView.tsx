'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    doc,
    addDoc,
    updateDoc,
    serverTimestamp,
    where,
    getDocs,
    getDoc,
    writeBatch,
    Firestore
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';
import {
    FiSearch,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiUser,
    FiCalendar,
    FiBox,
    FiChevronRight,
    FiAlertCircle,
    FiInfo,
    FiArrowRight,
    FiActivity
} from 'react-icons/fi';
import Image from 'next/image';

interface RequestItem {
    materialId: string;
    materialName: string;
    materialCode: string;
    quantity: number;
    condition: string;
    unit: string;
    materialType: string;
    image?: string; // Add image field
    AC_decition?: string;
}

interface RequestHistory {
    status: string;
    user: string;
    timestamp: string;
    note: string;
}

interface MaterialRequest {
    id: string;
    requesterId: string;
    requesterName: string;
    department: string;
    items: RequestItem[];
    currentApproverId: string;
    currentApproverName: string;
    currentApproverRole: string;
    status: string;
    createdAt: any;
    history: RequestHistory[];
    headApproverName?: string; // Track who approved as head
}

interface MaterialRequestViewProps {
    roleOverride?: 'department_head' | 'academic_coordinator' | 'managing_director' | 'general_service' | 'stock_clerk' | 'team_leader' | 'store_keeper' | 'student_service_leader' | 'consumable_item_stock_clerk' | 'fixed_asset_stock_clerk' | 'consumable_item_store_keeper' | 'fixed_asset_store_keeper';
    materialTypeFilter?: 'fixed_asset' | 'consumable';
}

type RoleType = 'department_head' | 'academic_coordinator' | 'requester' | 'procurement_md' | 'chief_executive' | 'managing_director' | 'general_service' | 'stock_clerk' | 'team_leader' | 'store_keeper' | 'dormitory_leader' | 'cafeteria_leader' | 'sports_leader' | 'student_service_leader' | 'hrm_leader' | 'finance_leader' | 'consumable_item_stock_clerk' | 'fixed_asset_stock_clerk' | 'consumable_item_store_keeper' | 'fixed_asset_store_keeper';

export default function MaterialRequestView({ roleOverride, materialTypeFilter }: MaterialRequestViewProps) {
    if (!db) return <div className="p-8 text-center text-red-500">Database connection error. Please refresh.</div>;
    const { user } = useAuth();
    const [requests, setRequests] = useState<MaterialRequest[]>([]);
    const [materialImages, setMaterialImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userData, setUserData] = useState<any>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<{ text: string, type: 'coordinator' | 'chief' | 'md' | 'general' } | null>(null);
    const pathname = usePathname();

    const effectiveRole = roleOverride || (
        pathname?.includes('/portal') ? 'managing_director' :
            pathname?.includes('/dashboard') ? (
                userData?.userRole?.includes('_head') ? 'department_head' :
                    userData?.userRole === 'academic_coordinator' ? 'academic_coordinator' :
                        'academic_coordinator'
            ) :
                pathname?.includes('/service') ? 'general_service' :
                    pathname?.includes('/workspace') ? (
                        userData?.userRole === 'procurement_team_leader' ? 'team_leader' :
                            userData?.userRole?.includes('stock_clerk') ? (userData?.userRole || 'stock_clerk') :
                                userData?.userRole?.includes('store_keeper') ? (userData?.userRole || 'store_keeper') :
                                    'team_leader'
                    ) :
                        pathname?.includes('/admin-staff/team-leader') ? (
                            userData?.userRole === 'student_service_leader' ? 'student_service_leader' :
                                userData?.userRole === 'student_service_dormitory_leader' ? 'dormitory_leader' :
                                    userData?.userRole === 'student_service_cafeteria_leader' ? 'cafeteria_leader' :
                                        userData?.userRole === 'student_service_sport_leader' ? 'sports_leader' :
                                            userData?.userRole === 'hrm_leader' ? 'hrm_leader' :
                                                userData?.userRole === 'finance_leader' ? 'finance_leader' :
                                                    'team_leader'
                        ) :
                            // Check for Stock Clerk and Store Keeper specific roles in the URL or User Role?
                            // This part ensures effectiveRole carries the full role name like 'consumable_item_stock_clerk'
                            pathname?.includes('/procurement-management/stock-clerk') ? (
                                userData?.userRole || 'stock_clerk'
                            ) :
                                pathname?.includes('/procurement-management/store') ? (
                                    userData?.userRole || 'store_keeper'
                                ) :
                                    // Fallback to old path detection for compatibility
                                    pathname?.includes('/managing-director') ? 'managing_director' :
                                        pathname?.includes('/academic-coordinator') ? 'academic_coordinator' :
                                            pathname?.includes('/general-service') ? 'general_service' :
                                                pathname?.includes('/stock-clerk') ? 'stock_clerk' :
                                                    pathname?.includes('/team-leader') ? 'team_leader' :
                                                        userData?.userRole?.includes('_head') ? 'department_head' :
                                                            'academic_coordinator'
    );

    useEffect(() => {
        // Fetch material images for fallback
        const fetchMaterialImages = async () => {
            if (!db) return;
            const materialsSnap = await getDocs(collection(db!, 'materials'));
            const imageMap: Record<string, string> = {};
            materialsSnap.docs.forEach(doc => {
                const data = doc.data();
                if (data.image) {
                    imageMap[doc.id] = data.image;
                }
            });
            setMaterialImages(imageMap);
        };
        fetchMaterialImages();
    }, []); // Run once on mount to fetch material images

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user && db) {
                const userDoc = await getDoc(doc(db!, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            }
        };
        fetchUserProfile();
    }, [user]);

    useEffect(() => {
        if (!userData || !db) return;

        let q;
        const requestsRef = collection(db!, 'Request_materials');

        if (effectiveRole === 'department_head') {
            let dept = userData.department;
            if (!dept && userData.userRole) {
                dept = userData.userRole.replace('_head', '');
            }
            if (!dept) return;

            q = query(
                requestsRef,
                where('department', '==', dept),
                where('currentApproverRole', '==', 'department_head'),
                where('status', 'in', ['pending', 'pending_department_leader'])
            );
        } else if (effectiveRole === 'dormitory_leader') {
            q = query(requestsRef, where('currentApproverRole', '==', 'student_service_dormitory_leader'), where('status', '==', 'pending_department_leader'));
        } else if (effectiveRole === 'cafeteria_leader') {
            q = query(requestsRef, where('currentApproverRole', '==', 'student_service_cafeteria_leader'), where('status', '==', 'pending_department_leader'));
        } else if (effectiveRole === 'sports_leader') {
            q = query(requestsRef, where('currentApproverRole', '==', 'student_service_sport_leader'), where('status', '==', 'pending_department_leader'));
        } else if (effectiveRole === 'hrm_leader') {
            q = query(requestsRef, where('currentApproverRole', '==', 'hrm_leader'), where('status', '==', 'pending_department_leader'));
        } else if (effectiveRole === 'finance_leader') {
            q = query(requestsRef, where('currentApproverRole', '==', 'finance_leader'), where('status', '==', 'pending_department_leader'));
        } else if (effectiveRole === 'student_service_leader') {
            q = query(requestsRef, where('status', '==', 'pending_student_service_leader'));
        } else if (effectiveRole === 'managing_director') {
            q = query(
                requestsRef,
                where('status', 'in', ['approved_by_coordinator', 'pending_managing_director', 'approved_by_student_service_leader'])
            );
        } else if (effectiveRole === 'general_service') {
            q = query(
                requestsRef,
                where('status', 'in', ['approved_by_md', 'pending_general_service'])
            );
        } else if (effectiveRole.includes('stock_clerk')) {
            q = query(
                collection(db!, 'Request_materials'),
                where('currentApproverRole', '==', effectiveRole), // Filter by exact clerk role (consumable/fixed)
                where('status', '==', 'approved_by_procurement_team_leader')
            );
        } else if (effectiveRole.includes('store_keeper')) {
            q = query(
                collection(db!, 'Request_materials'),
                where('currentApproverRole', '==', effectiveRole), // Filter by exact keeper role
                where('status', '==', 'approved_by_clerk')
            );
        } else if (effectiveRole === 'team_leader') {
            q = query(
                collection(db!, 'Request_materials'),
                where('status', 'in', ['forwarded_to_team_leader', 'pending_procurement'])
            );
        } else {
            // Academic Coordinator view
            q = query(
                collection(db!, 'Request_materials'),
                where('currentApproverRole', '==', 'academic_coordinator'),
                where('status', '==', 'approved_by_head')
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let requestList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MaterialRequest[];

            // Filter by material type for stock clerks and store keepers
            if ((effectiveRole === 'stock_clerk' || effectiveRole === 'store_keeper') && materialTypeFilter) {
                requestList = requestList.filter(request => {
                    // Check if any item in the request matches the material type filter
                    const hasMatchingType = request.items?.some(item => {
                        const itemType = item.materialType?.toLowerCase() || '';
                        if (materialTypeFilter === 'fixed_asset') {
                            return itemType.includes('fixed') || itemType === 'fixed_asset';
                        } else if (materialTypeFilter === 'consumable') {
                            return itemType.includes('consumable') || itemType === 'consumable';
                        }
                        return true;
                    });
                    return hasMatchingType;
                });
            }

            // Also filter by user's stockType from userData if materialTypeFilter not explicitly set
            if ((effectiveRole === 'stock_clerk' || effectiveRole === 'store_keeper') && !materialTypeFilter && userData?.stockType) {
                requestList = requestList.filter(request => {
                    const hasMatchingType = request.items?.some(item => {
                        const itemType = item.materialType?.toLowerCase() || '';
                        if (userData.stockType === 'fixed_assets' || userData.userRole?.includes('fixed_asset')) {
                            return itemType.includes('fixed') || itemType === 'fixed_asset';
                        } else if (userData.stockType === 'consumable_items' || userData.userRole?.includes('consumable')) {
                            return itemType.includes('consumable') || itemType === 'consumable';
                        }
                        return true;
                    });
                    return hasMatchingType;
                });
            }

            requestList.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB.getTime() - dateA.getTime();
            });
            setRequests(requestList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData, effectiveRole]);

    const handleApprove = async (request: MaterialRequest) => {
        if (!user || !userData || !db) return;
        setProcessingId(request.id);

        try {
            const requestRef = doc(db!, 'Request_materials', request.id);

            if (effectiveRole === 'dormitory_leader' || effectiveRole === 'cafeteria_leader' || effectiveRole === 'sports_leader' || effectiveRole === 'hrm_leader' || effectiveRole === 'finance_leader') {
                // If it's a student service leader, forward to SSL. If it's HRM or Finance leader, forward to MD.
                const isStudentServiceSubLeader = effectiveRole === 'dormitory_leader' || effectiveRole === 'cafeteria_leader' || effectiveRole === 'sports_leader';

                const nextRole = isStudentServiceSubLeader ? 'student_service_leader' : 'managing_director';
                const nextStatus = isStudentServiceSubLeader ? 'pending_student_service_leader' : 'pending_managing_director';

                const nextQuery = query(collection(db!, 'users'), where('userRole', '==', nextRole));
                const nextSnapshot = await getDocs(nextQuery);
                const nextApproverId = nextSnapshot.empty ? `PENDING_${nextRole.toUpperCase()}_ASSIGNMENT` : nextSnapshot.docs[0].id;
                const nextApproverName = nextSnapshot.empty ? nextRole.replace(/_/g, ' ') : nextSnapshot.docs[0].data().displayName;

                await updateDoc(requestRef, {
                    status: nextStatus,
                    currentApproverId: nextApproverId,
                    currentApproverName: nextApproverName,
                    currentApproverRole: nextRole,
                    history: [
                        ...request.history,
                        {
                            status: nextStatus,
                            user: user.uid,
                            timestamp: new Date().toISOString(),
                            note: `Approved by ${effectiveRole.replace('_', ' ')}. Forwarded to ${nextApproverName}.`
                        }
                    ]
                });
                setSuccessMessage({ text: `Request approved and forwarded to ${nextApproverName}`, type: 'general' });
            } else if (effectiveRole === 'student_service_leader') {
                const mdQuery = query(collection(db!, 'users'), where('userRole', '==', 'managing_director'));
                const mdSnapshot = await getDocs(mdQuery);
                const nextApproverId = mdSnapshot.empty ? 'PENDING_MD_ASSIGNMENT' : mdSnapshot.docs[0].id;
                const nextApproverName = mdSnapshot.empty ? 'Managing Director' : mdSnapshot.docs[0].data().displayName;

                await updateDoc(requestRef, {
                    status: 'pending_managing_director',
                    currentApproverId: nextApproverId,
                    currentApproverName: nextApproverName,
                    currentApproverRole: 'managing_director',
                    history: [
                        ...request.history,
                        {
                            status: 'pending_managing_director',
                            user: user.uid,
                            timestamp: new Date().toISOString(),
                            note: 'Approved by Student Service Leader. Forwarded to Managing Director.'
                        }
                    ]
                });
                setSuccessMessage({ text: "Request approved and forwarded to Managing Director", type: 'general' });
            } else if (effectiveRole === 'department_head') {
                // Find the Academic Coordinator
                const acQuery = query(
                    collection(db!, 'users'),
                    where('userRole', '==', 'academic_coordinator')
                );
                const acSnapshot = await getDocs(acQuery);

                const nextApproverId = acSnapshot.empty ? 'PENDING_AC_ASSIGNMENT' : acSnapshot.docs[0].id;
                const nextApproverName = acSnapshot.empty ? 'Academic Coordinator' : acSnapshot.docs[0].data().displayName;

                await updateDoc(requestRef, {
                    status: 'approved_by_head',
                    currentApproverId: nextApproverId,
                    currentApproverName: nextApproverName,
                    currentApproverRole: 'academic_coordinator',
                    headApproverName: userData.displayName || 'Department Head',
                    history: [
                        ...request.history,
                        {
                            status: 'approved_by_head',
                            user: user.uid,
                            timestamp: new Date().toISOString(),
                            note: 'Request approved by Department Head and forwarded to Academic Coordinator'
                        }
                    ]
                });
                setSuccessMessage({
                    text: "Successfully sent message",
                    type: 'general'
                });
            } else if (effectiveRole === 'managing_director') {
                const gsQuery = query(collection(db!, 'users'), where('userRole', '==', 'general_service_leader'));
                const gsSnapshot = await getDocs(gsQuery);
                const nextApproverId = gsSnapshot.empty ? 'PENDING_GS_ASSIGNMENT' : gsSnapshot.docs[0].id;
                const nextApproverName = gsSnapshot.empty ? 'General Service' : gsSnapshot.docs[0].data().displayName;

                await updateDoc(requestRef, {
                    status: 'pending_general_service',
                    currentApproverId: nextApproverId,
                    currentApproverName: nextApproverName,
                    currentApproverRole: 'general_service_leader',
                    history: [
                        ...request.history,
                        {
                            status: 'pending_general_service',
                            user: user.uid,
                            timestamp: new Date().toISOString(),
                            note: 'Approved by Managing Director. Forwarded to General Service.'
                        }
                    ]
                });
                setSuccessMessage({ text: "Request approved and forwarded to General Service", type: 'md' });
            } else if (effectiveRole === 'general_service') {
                const ptlQuery = query(collection(db!, 'users'), where('userRole', '==', 'procurement_team_leader'));
                const ptlSnapshot = await getDocs(ptlQuery);
                const nextApproverId = ptlSnapshot.empty ? 'PENDING_PTL_ASSIGNMENT' : ptlSnapshot.docs[0].id;
                const nextApproverName = ptlSnapshot.empty ? 'Procurement Team Leader' : ptlSnapshot.docs[0].data().displayName;

                await updateDoc(requestRef, {
                    status: 'pending_procurement',
                    currentApproverId: nextApproverId,
                    currentApproverName: nextApproverName,
                    currentApproverRole: 'procurement_team_leader',
                    history: [
                        ...request.history,
                        {
                            status: 'pending_procurement',
                            user: user.uid,
                            timestamp: new Date().toISOString(),
                            note: 'Approved by General Service. Forwarded to Procurement Team Leader.'
                        }
                    ]
                });
                setSuccessMessage({ text: "Request approved and forwarded to Procurement Team Leader", type: 'general' });
            } else if (effectiveRole === 'team_leader') {
                // Procurement Team Leader -> Forward to Stock Clerk
                // Determine material type from items (assuming all items in a request are of similar type or taking the first one)
                // If mixed, default to fixed for safety or check logic. For now, checking the first item.
                const firstItem = request.items[0];
                const type = firstItem?.materialType?.toLowerCase() || '';
                const isConsumable = type.includes('consumable');

                const clerkRole = isConsumable ? 'consumable_item_stock_clerk' : 'fixed_asset_stock_clerk';

                // Find Clerk
                const clerkQuery = query(collection(db!, 'users'), where('userRole', '==', clerkRole));
                const clerkSnapshot = await getDocs(clerkQuery);
                const nextApproverId = clerkSnapshot.empty ? 'PENDING_CLERK_ASSIGNMENT' : clerkSnapshot.docs[0].id;
                const nextApproverName = clerkSnapshot.empty ? (isConsumable ? 'Consumable Stock Clerk' : 'Fixed Stock Clerk') : clerkSnapshot.docs[0].data().displayName;

                await updateDoc(requestRef, {
                    status: 'approved_by_procurement_team_leader',
                    currentApproverId: nextApproverId,
                    currentApproverName: nextApproverName,
                    currentApproverRole: clerkRole,
                    history: [
                        ...request.history,
                        {
                            status: 'approved_by_procurement_team_leader',
                            user: user.uid,
                            timestamp: new Date().toISOString(),
                            note: `Approved by Procurement Team Leader. Forwarded to ${nextApproverName}.`
                        }
                    ]
                });
                setSuccessMessage({ text: "Request approved and forwarded to Stock Clerk", type: 'general' });

            } else if (effectiveRole === 'stock_clerk' || effectiveRole.includes('stock_clerk')) {
                // Stock Clerk -> Forward to Store Keeper AND send verification to employee
                const firstItem = request.items[0];
                const type = firstItem?.materialType?.toLowerCase() || '';
                const isConsumable = type.includes('consumable');

                const keeperRole = isConsumable ? 'consumable_item_store_keeper' : 'fixed_asset_store_keeper';

                // Find Keeper
                const keeperQuery = query(collection(db!, 'users'), where('userRole', '==', keeperRole));
                const keeperSnapshot = await getDocs(keeperQuery);
                const nextApproverId = keeperSnapshot.empty ? 'PENDING_KEEPER_ASSIGNMENT' : keeperSnapshot.docs[0].id;
                const nextApproverName = keeperSnapshot.empty ? (isConsumable ? 'Consumable Store Keeper' : 'Fixed Store Keeper') : keeperSnapshot.docs[0].data().displayName;

                await updateDoc(requestRef, {
                    status: 'approved_by_clerk',
                    currentApproverId: nextApproverId,
                    currentApproverName: nextApproverName,
                    currentApproverRole: keeperRole,
                    history: [
                        ...request.history,
                        {
                            status: 'approved_by_clerk',
                            user: user.uid,
                            timestamp: new Date().toISOString(),
                            note: `Approved by Stock Clerk. Forwarded to ${nextApproverName} and verification sent to employee.`
                        }
                    ]
                });

                // Create User-Report entries and send verification code to employee
                try {
                    const userReportPromises = request.items.map(async (item) => {
                        await addDoc(collection(db!, 'User-Report'), {
                            requestId: request.id,
                            requesterId: request.requesterId,
                            requesterName: request.requesterName,
                            department: request.department,
                            materialId: item.materialId,
                            materialName: item.materialName,
                            materialCode: item.materialCode,
                            quantity: item.quantity,
                            unit: item.unit,
                            materialType: item.materialType,
                            condition: item.condition,
                            image: item.image || '',
                            withdrawalDate: serverTimestamp(),
                            status: 'approved_by_clerk',
                            approvedBy: user.uid,
                            approvedByName: userData.displayName || 'Stock Clerk',
                            approvedAt: serverTimestamp(),
                            createdAt: serverTimestamp(),
                            history: [
                                {
                                    status: 'approved_by_clerk',
                                    user: user.uid,
                                    timestamp: new Date().toISOString(),
                                    note: 'Approved by Stock Clerk. Awaiting employee verification.'
                                }
                            ]
                        });
                    });

                    await Promise.all(userReportPromises);

                    // Generate verification code and Send_to_Users entry
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    await addDoc(collection(db!, 'Send_to_Users'), {
                        request_id: request.id,
                        requester_user_id: request.requesterId,
                        requester_name: request.requesterName,
                        material_details: request.items.map(item => ({
                            materialName: item.materialName,
                            materialCode: item.materialCode,
                            materialType: item.materialType,
                            materialId: item.materialId,
                            quantity: item.quantity,
                            unit: item.unit
                        })),
                        verification_code: code,
                        created_at: serverTimestamp(),
                        status: 'ready_for_pickup'
                    });

                    setSuccessMessage({
                        text: "Request approved. Forwarded to Store Keeper and verification sent to employee.",
                        type: 'general'
                    });
                } catch (error) {
                    console.error("Error creating User-Report entries:", error);
                    throw error;
                }
            } else {
                // Academic Coordinator Logic
                const itemsWithACRule = request.items.filter(item => item.AC_decition === 'need AC decision');

                if (itemsWithACRule.length > 0) {
                    await addDoc(collection(db!, 'Need_AC_decition'), {
                        ...request,
                        originalRequestId: request.id,
                        coordinatorId: user.uid,
                        coordinatorName: userData.displayName || 'Academic Coordinator',
                        approvedAt: serverTimestamp(),
                        status: 'pending_chief_decision'
                    });

                    await updateDoc(requestRef, {
                        status: 'forwarded_to_chief',
                        currentApproverRole: 'chief_executive',
                        history: [
                            ...request.history,
                            {
                                status: 'forwarded_to_chief',
                                user: user.uid,
                                timestamp: new Date().toISOString(),
                                note: 'Fixed assets requiring Chief decision forwarded to executive collection.'
                            }
                        ]
                    });
                    setSuccessMessage({
                        text: "This request needs Academic Commission decision",
                        type: 'chief'
                    });
                } else {
                    await updateDoc(requestRef, {
                        status: 'approved_by_coordinator',
                        currentApproverRole: 'procurement_md',
                        history: [
                            ...request.history,
                            {
                                status: 'approved_by_coordinator',
                                user: user.uid,
                                timestamp: new Date().toISOString(),
                                note: 'Request approved by Academic Coordinator.'
                            }
                        ]
                    });
                    setSuccessMessage({
                        text: "Successfully sent message",
                        type: 'coordinator'
                    });
                }
            }

            // Clear message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error) {
            console.error("Error approving request:", error);
            alert("Failed to approve request.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (request: MaterialRequest) => {
        if (!user || !db) return;
        const note = prompt("Please enter a reason for rejection:");
        if (note === null) return;

        setProcessingId(request.id);
        try {
            const requestRef = doc(db!, 'Request_materials', request.id);
            const statusLabel = 'rejected';

            await updateDoc(requestRef, {
                status: statusLabel,
                history: [
                    ...request.history,
                    {
                        status: statusLabel,
                        user: user.uid,
                        timestamp: new Date().toISOString(),
                        note: note || `Rejected by ${effectiveRole.replace('_', ' ')}`
                    }
                ]
            });
            setSuccessMessage({
                text: "Successfully sent message",
                type: 'general'
            });
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error) {
            console.error("Error rejecting request:", error);
            alert("Failed to reject request.");
        } finally {
            setProcessingId(null);
        }
    };

    const generateVerificationCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleValidate = async (request: MaterialRequest) => {
        if (!user || !db) return;
        setProcessingId(request.id);

        try {
            // Step 1: Update Request_materials
            const requestRef = doc(db!, 'Request_materials', request.id);
            await updateDoc(requestRef, {
                status: 'approved_by_clerk',
                currentApproverRole: 'store_keeper',
                history: [
                    ...request.history,
                    {
                        status: 'approved_by_clerk',
                        user: user.uid,
                        timestamp: new Date().toISOString(),
                        note: 'Validated and Forwarded by Stock Clerk to Store Keeper. Verification code generated.'
                    }
                ]
            });

            // Step 2: Update User-Report
            const userReportQuery = query(collection(db!, 'User-Report'), where('requestId', '==', request.id));
            const userReportSnap = await getDocs(userReportQuery);

            const batch = writeBatch(db!);
            userReportSnap.docs.forEach((doc) => {
                const docData = doc.data();
                batch.update(doc.ref, {
                    status: 'completed',
                    history: [
                        ...(docData.history || []),
                        {
                            status: 'completed',
                            user: user.uid,
                            timestamp: new Date().toISOString(),
                            note: 'Material request validated and completed by Stock Clerk'
                        }
                    ]
                });
            });
            await batch.commit();

            // Step 3: Generate Verification Code
            const code = generateVerificationCode();

            // Step 5: Save Data to Send_to_Users Collection
            await addDoc(collection(db!, 'Send_to_Users'), {
                request_id: request.id,
                requester_user_id: request.requesterId,
                requester_name: request.requesterName,
                verification_code: code,
                material_details: request.items.map(item => ({
                    materialName: item.materialName,
                    materialCode: item.materialCode,
                    quantity: item.quantity,
                    unit: item.unit,
                    materialType: item.materialType
                })),
                status: 'code_sent',
                created_at: serverTimestamp(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });

            // Step 4: Success Message
            setSuccessMessage({
                text: "Successfully approved",
                type: 'general'
            });

        } catch (error) {
            console.error("Error validating request:", error);
            alert("Failed to validate request.");
        } finally {
            setProcessingId(null);
            setTimeout(() => setSuccessMessage(null), 10000);
        }
    };

    const filteredRequests = requests.filter(r => {
        // Search term filter
        const matchesSearch = r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.items.some(item => item.materialName.toLowerCase().includes(searchTerm.toLowerCase()));

        // Material type filter (only show requests where ALL items match the filter type)
        const matchesMaterialType = !materialTypeFilter ||
            r.items.every(item => (item.materialType?.toLowerCase() || '') === materialTypeFilter.toLowerCase());

        return matchesSearch && matchesMaterialType;
    });

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-12`}>
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${effectiveRole === 'department_head' ? 'border-orange-600' :
                    effectiveRole === 'managing_director' ? 'border-indigo-600' :
                        effectiveRole === 'general_service' ? 'border-violet-600' :
                            'border-lime-600'
                    }`}></div>
            </div>
        );
    }

    const themeColor = effectiveRole === 'academic_coordinator' ? 'amber' :
        effectiveRole === 'managing_director' ? 'indigo' :
            effectiveRole === 'general_service' ? 'emerald' :
                effectiveRole === 'dormitory_leader' ? 'blue' :
                    effectiveRole === 'cafeteria_leader' ? 'orange' :
                        effectiveRole === 'sports_leader' ? 'rose' :
                            effectiveRole === 'student_service_leader' ? 'violet' :
                                'blue';

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Notification Bar */}
            {successMessage && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-8 duration-500`}>
                    <div className={`flex items-center gap-5 px-8 py-5 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl border-2 ${successMessage.type === 'coordinator' ? 'bg-lime-600 border-lime-400 text-white shadow-lime-500/30' :
                        successMessage.type === 'md' ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/30' :
                            'bg-orange-600 border-orange-400 text-white shadow-orange-500/30'
                        }`}>
                        <FiCheckCircle className="text-3xl animate-bounce" />
                        <div className="flex flex-col text-left">
                            <span className="font-black uppercase tracking-[0.2em] text-[10px] opacity-80">Security Protocol</span>
                            <span className="font-bold text-sm tracking-tight">{successMessage.text}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-80 h-80 bg-${themeColor}-50 rounded-full -mr-40 -mt-40 blur-[100px] opacity-60`}></div>
                <div className={`absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full -ml-32 -mb-32 blur-[80px] opacity-40`}></div>

                <div className="relative z-10">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-${themeColor}-100 text-${themeColor}-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm`}>
                        <FiActivity className="animate-pulse" /> Security Protocol Active
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter flex items-center gap-4">
                        {effectiveRole === 'academic_coordinator' ? (
                            <>Departmental <span className={`text-${themeColor}-600`}>Submissions</span></>
                        ) : effectiveRole === 'managing_director' ? (
                            <>Executive <span className={`text-${themeColor}-600`}>Directives</span></>
                        ) : effectiveRole === 'general_service' ? (
                            <>Validated <span className={`text-${themeColor}-600`}>Requests</span></>
                        ) : effectiveRole === 'team_leader' ? (
                            <>Procurement <span className={`text-${themeColor}-600`}>Oversight</span></>
                        ) : (
                            <>Pending <span className={`text-${themeColor}-600`}>Requests</span></>
                        )}
                    </h2>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em] opacity-60">
                        {effectiveRole === 'academic_coordinator' ? 'Coordinator Protocol: Budgetary & Rule Validation' :
                            effectiveRole === 'managing_director' ? 'MD Protocol: Final Executive Authorization' :
                                effectiveRole === 'general_service' ? 'Service Protocol: Final Material Processing' :
                                    effectiveRole === 'team_leader' ? 'Team Leader Protocol: Administrative Verification' :
                                        'Department Head Protocol: Review and Verify Requisitions'}
                    </p>
                </div>

                <div className="relative group w-full md:w-[28rem] z-10">
                    <FiSearch className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-${themeColor}-500 transition-colors text-xl`} />
                    <input
                        type="text"
                        placeholder="Search by teacher or material..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-14 pr-6 py-5 bg-slate-50/50 border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-${themeColor}-500/5 focus:border-${themeColor}-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner`}
                    />
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-32 text-center space-y-6">
                    <div className={`w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border-2 border-slate-50 shadow-inner`}>
                        <FiClock className="text-5xl" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Queue Clear</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No pending material requests require your attention.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12">
                    {filteredRequests.map(request => (
                        <div
                            key={request.id}
                            className={`group relative bg-white border-2 rounded-[3rem] transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-2 flex flex-col overflow-hidden ${effectiveRole === 'academic_coordinator' ? 'border-slate-100 hover:border-lime-200 shadow-lime-500/5' :
                                effectiveRole === 'managing_director' ? 'border-slate-100 hover:border-indigo-200 shadow-indigo-500/5' :
                                    effectiveRole === 'general_service' ? 'border-slate-100 hover:border-violet-300 shadow-violet-500/5 bg-gradient-to-b from-white to-violet-50/20' :
                                        effectiveRole === 'team_leader' ? 'border-slate-100 hover:border-teal-300 shadow-teal-500/5 bg-gradient-to-b from-white to-teal-50/20' :
                                            'border-slate-100 hover:border-orange-200'
                                } ${processingId === request.id ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {/* Premium Glow Effect */}
                            <div className={`absolute -inset-1 bg-gradient-to-r ${effectiveRole === 'department_head' ? 'from-orange-500/20 to-amber-500/20' :
                                effectiveRole === 'general_service' ? 'from-violet-500/20 to-purple-500/20' :
                                    'from-transparent to-transparent'
                                } rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700`}></div>

                            {/* Decorative Corner Accent */}
                            <div className={`absolute top-0 right-0 w-48 h-48 bg-${themeColor}-50/50 rounded-full -mr-24 -mt-24 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>

                            {/* Request Card Top Bar */}
                            <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:border-${themeColor}-100 transition-colors`}>
                                        <FiUser className={`text-2xl text-${themeColor}-600`} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-black transition-colors">{request.requesterName}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest`}>
                                                {request.department?.replace('_', ' ')}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic opacity-60">
                                                Requester
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="mb-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-${themeColor}-100/50 text-${themeColor}-700 text-[10px] font-black uppercase tracking-tighter shadow-sm border border-${themeColor}-200/50`}>
                                            <FiCheckCircle className="text-xs" /> {request.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-xl border border-slate-100/50">
                                        <FiCalendar className={`text-${themeColor}-500`} />
                                        {request.createdAt?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="p-8 flex-1 space-y-6 relative z-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                        <FiBox className={`text-${themeColor}-500`} /> Material Payload ({request.items.length})
                                    </p>
                                    <div className="space-y-3">
                                        {request.items.map((item, idx) => (
                                            <div key={idx} className={`group/item flex items-center justify-between p-4 bg-slate-50/50 rounded-3xl border-2 border-slate-100/50 hover:bg-white hover:border-${themeColor}-200 hover:shadow-md transition-all`}>
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-[1.25rem] bg-white border-2 border-slate-100 flex items-center justify-center relative overflow-hidden shadow-sm flex-shrink-0 group-hover/item:border-${themeColor}-100 transition-colors">
                                                        {(item.image || materialImages[item.materialId]) ? (
                                                            <Image
                                                                src={item.image || materialImages[item.materialId]}
                                                                alt={item.materialName}
                                                                fill
                                                                className="object-cover transition-transform duration-700 group-hover/item:scale-110"
                                                            />
                                                        ) : (
                                                            <FiBox className="text-slate-200 h-full w-full p-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 group-hover/item:text-black transition-colors">{item.materialName}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                            {(effectiveRole === 'stock_clerk' || effectiveRole === 'team_leader') && (
                                                                <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-mono">{item.materialCode}</span>
                                                            )}
                                                            <span className={`text-[10px] font-black bg-${themeColor}-600/10 text-${themeColor}-700 px-2.5 py-1 rounded-lg uppercase tracking-tighter border border-${themeColor}-200/50`}>{item.materialType?.replace('_', ' ')}</span>
                                                            {item.AC_decition === 'need AC decision' && (
                                                                <span className="text-[10px] font-black bg-red-500 text-white px-2.5 py-1 rounded-lg uppercase flex items-center gap-1.5 shadow-lg shadow-red-500/20">
                                                                    <FiAlertCircle className="animate-pulse" /> Commission Review
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-lg font-black text-slate-800">{item.quantity}</span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.unit}</span>
                                                    </div>
                                                    <div className={`mt-2 px-2 py-0.5 rounded-lg inline-block text-[9px] font-black uppercase tracking-tighter border ${item.condition === 'New' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        {item.condition}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-8 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 flex items-center gap-4 relative z-10">
                                {effectiveRole.includes('stock_clerk') || effectiveRole.includes('store_keeper') ? (
                                    <>
                                        <button
                                            onClick={() => handleApprove(request)}
                                            className={`flex-1 py-5 bg-${themeColor}-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-${themeColor}-500 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0)] hover:shadow-[0_20px_40px_-5px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3 group/btn active:scale-95`}
                                        >
                                            {processingId === request.id ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Processing...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    {effectiveRole.includes('store_keeper') ? 'Finalize & Complete' : 'Validate & Forward'}
                                                    <FiArrowRight className="group-hover/btn:translate-x-2 transition-transform text-lg" />
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleReject(request)}
                                            className="px-8 py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3 group/reject"
                                        >
                                            <FiXCircle className="text-2xl group-hover/reject:rotate-90 transition-transform duration-500" />
                                        </button>
                                    </>
                                ) : effectiveRole === 'general_service' ? (
                                    <button
                                        onClick={() => handleApprove(request)}
                                        className={`flex-1 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 group/btn relative overflow-hidden shadow-xl bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/20`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        {processingId === request.id ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            <span className="relative z-10 flex items-center gap-2">
                                                Acknowledge & Process
                                                <FiArrowRight className="group-hover/btn:translate-x-2 transition-transform text-lg" />
                                            </span>
                                        )}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleApprove(request)}
                                            className={`flex-1 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 group/btn relative overflow-hidden shadow-xl ${effectiveRole === 'academic_coordinator' ? 'bg-lime-600 hover:bg-lime-500 text-white shadow-lime-600/20' :
                                                effectiveRole === 'managing_director' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' :
                                                    effectiveRole === 'team_leader' ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/20' :
                                                        'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20'
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            {processingId === request.id ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Processing...</span>
                                                </div>
                                            ) : (
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {effectiveRole === 'academic_coordinator' ? 'Authorize Requisition' :
                                                        effectiveRole === 'managing_director' ? 'Execute Final Approval' :
                                                            effectiveRole === 'team_leader' ? 'Approved & Forwarded to Clerk' :
                                                                'Validated & Forwarded'}
                                                    <FiCheckCircle className="text-lg group-hover/btn:scale-110 transition-transform" />
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleReject(request)}
                                            className="px-8 py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3 group/reject"
                                        >
                                            <FiXCircle className="text-2xl group-hover/reject:rotate-90 transition-transform duration-500" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Decorative Protocol Card */}
            <div className={`mt-12 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-${themeColor}-600`}>
                <div className={`absolute top-0 right-0 w-[30rem] h-[30rem] bg-${themeColor}-500/10 rounded-full -mr-60 -mt-60 blur-[120px]`}></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-800/20 rounded-full -ml-40 -mb-40 blur-[100px]"></div>

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
                    <div className={`w-28 h-28 bg-${themeColor}-500/20 rounded-[2.5rem] flex items-center justify-center flex-shrink-0 border-2 border-${themeColor}-500/20 shadow-2xl backdrop-blur-xl animate-float`}>
                        <FiInfo className={`text-5xl text-${themeColor}-400`} />
                    </div>
                    <div className="space-y-4">
                        <div className={`inline-block px-4 py-1.5 rounded-full bg-${themeColor}-500/10 text-${themeColor}-400 text-[10px] font-black uppercase tracking-[0.3em] border border-${themeColor}-500/20`}>
                            Operational Policy
                        </div>
                        <h4 className="text-3xl font-black tracking-tighter italic">
                            {effectiveRole === 'academic_coordinator' ? 'Coordinator Validation Protocol' :
                                effectiveRole === 'managing_director' ? 'Executive Approval Protocol' :
                                    effectiveRole === 'general_service' ? 'Service Fulfillment Protocol' :
                                        'Head Authorization Protocol'}
                        </h4>
                        <p className="text-slate-400 text-lg font-medium max-w-4xl leading-relaxed opacity-80">
                            {effectiveRole === 'academic_coordinator'
                                ? 'Review departmental requests for budgetary alignment and fixed asset governance. Your approval moves high-priority items to the Academic Commission for final executive decision.'
                                : effectiveRole === 'managing_director'
                                    ? 'As the Managing Director, your final authorization signals the formal commitment of resources. Approved requests are transmitted directly to the Procurement Unit for acquisition execution.'
                                    : effectiveRole === 'general_service'
                                        ? 'As General Service staff, you are responsible for the final processing and distribution of approved materials. Ensure all items are correctly cataloged and distributed to their respective departments.'
                                        : 'As a Department Head, your approval signals that the requested materials are essential for departmental operations. Once approved, requests are transmitted to the Academic Coordinator.'}
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
