'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, getDoc, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
    FiSearch,
    FiShoppingCart,
    FiPlus,
    FiMinus,
    FiTrash2,
    FiChevronRight,
    FiCheckCircle,
    FiBox,
    FiInfo,
    FiArrowLeft,
    FiTag,
    FiMapPin,
    FiBookOpen,
    FiShield,
    FiActivity,
    FiLayers,
    FiStar
} from 'react-icons/fi';
import Image from 'next/image';

interface Material {
    id: string;
    materialName: string;
    materialCode: string;
    image: string;
    quantity: number;
    condition: string;
    category: string;
    unit: string;
    materialType: string;
    description?: string;
    remarks?: string;
    storeLocation?: string;
    tags?: string;
    shelfNumber?: string;
}

interface CartItem extends Material {
    requestedQuantity: number;
}

export default function MaterialRequestForm() {
    const { user } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [step, setStep] = useState(1); // 1: Listing, 2: Detail, 3: Review, 4: Success
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

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

        if (!db) return;
        const q = query(collection(db!, 'materials'), orderBy('materialName', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const materialList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Material[];
            setMaterials(materialList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addToCart = (material: Material) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === material.id);
            if (existing) {
                if (existing.requestedQuantity < material.quantity) {
                    return prev.map(item =>
                        item.id === material.id
                            ? { ...item, requestedQuantity: item.requestedQuantity + 1 }
                            : item
                    );
                }
                return prev;
            }
            return [...prev, { ...material, requestedQuantity: 1 }];
        });
        setStep(1);
        setSelectedMaterial(null);
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.requestedQuantity + delta;
                const material = materials.find(m => m.id === id);
                if (newQty > 0 && material && newQty <= material.quantity) {
                    return { ...item, requestedQuantity: newQty };
                }
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmit = async () => {
        if (!user || !userData || cart.length === 0 || !db) return;
        setSubmitting(true);

        try {
            let department = userData.department;
            if (!department && userData.userRole) {
                department = userData.userRole.replace('_teacher', '').replace('_head', '');
            }

            const isDeptHead = userData.userRole?.endsWith('_head');
            const isAC = userData.userRole === 'academic_coordinator';
            const isMD = userData.userRole === 'managing_director' || userData.userRole === 'managing_director_leader' || userData.userRole === 'chief';
            const isTL = userData.userRole?.includes('_leader') || userData.userRole?.includes('_team_leader') || userData.userRole === 'academic_coordinator';

            // Student Service Roles
            const isDormEmployee = userData.userRole === 'student_service_dormitory_employee';
            const isCafeteriaEmployee = userData.userRole === 'student_service_cafeteria_employee';
            const isSportEmployee = userData.userRole === 'student_service_sport_employee';

            // HRM and Finance Roles
            const isHRMEmployee = userData.userRole === 'hrm_employee';
            const isFinanceEmployee = userData.userRole === 'finance_employee';

            // Student Service Leader Roles (Dormitory, Sport, Cafeteria Leaders) - go to Student Service Leader first
            const isDormLeader = userData.userRole === 'student_service_dormitory_leader';
            const isCafeteriaLeader = userData.userRole === 'student_service_cafeteria_leader';
            const isSportLeader = userData.userRole === 'student_service_sport_leader';

            // Top-Level Leaders (Student Service, HRM, Finance) - go directly to Managing Director
            const isStudentServiceLeader = userData.userRole === 'student_service_leader';
            const isHRMLeader = userData.userRole === 'hrm_leader';
            const isFinanceLeader = userData.userRole === 'finance_leader';

            let roleLabel = 'Employee';
            if (isMD) roleLabel = 'Managing Director';
            else if (isAC) roleLabel = 'Academic Coordinator';
            else if (isTL) roleLabel = 'Leader';
            else if (isDeptHead) roleLabel = 'Department Head';
            else if (userData.userRole?.includes('teacher')) roleLabel = 'Teacher';

            let approverId = 'PENDING_ASSIGNMENT';
            let approverName = 'Approver';
            let approverRole = 'approver';
            let status = 'pending';
            let historyNote = `Request initiated by ${roleLabel}`;

            // Top-Level Leaders go directly to Managing Director
            if (isStudentServiceLeader || isHRMLeader || isFinanceLeader) {
                const mdQuery = query(collection(db!, 'users'), where('userRole', '==', 'managing_director'));
                const mdSnapshot = await getDocs(mdQuery);

                approverId = mdSnapshot.empty ? 'PENDING_MD_ASSIGNMENT' : mdSnapshot.docs[0].id;
                approverName = mdSnapshot.empty ? 'Managing Director' : mdSnapshot.docs[0].data().displayName;
                approverRole = 'managing_director';
                status = 'pending_managing_director';

                const leaderType = isStudentServiceLeader ? 'Student Service Leader' :
                    isHRMLeader ? 'HRM Leader' : 'Finance Leader';
                historyNote = `Request initiated by ${leaderType}`;
            }
            // Special handling for Dormitory/Sport/Cafeteria Leaders - they go to Student Service Leader first
            else if (isDormLeader || isCafeteriaLeader || isSportLeader) {
                const sslQuery = query(collection(db!, 'users'), where('userRole', '==', 'student_service_leader'));
                const sslSnapshot = await getDocs(sslQuery);

                approverId = sslSnapshot.empty ? 'PENDING_STUDENT_SERVICE_LEADER_ASSIGNMENT' : sslSnapshot.docs[0].id;
                approverName = sslSnapshot.empty ? 'Student Service Leader' : sslSnapshot.docs[0].data().displayName;
                approverRole = 'student_service_leader';
                status = 'pending_student_service_leader';
                historyNote = `Request initiated by ${isDormLeader ? 'Dormitory' : isCafeteriaLeader ? 'Cafeteria' : 'Sport'} Leader`;
            } else if (isDormEmployee || isCafeteriaEmployee || isSportEmployee) {
                const leaderRole = isDormEmployee ? 'student_service_dormitory_leader' :
                    isCafeteriaEmployee ? 'student_service_cafeteria_leader' :
                        'student_service_sport_leader';

                const leaderQuery = query(collection(db!, 'users'), where('userRole', '==', leaderRole));
                const leaderSnapshot = await getDocs(leaderQuery);

                approverId = leaderSnapshot.empty ? `PENDING_${leaderRole.toUpperCase()}_ASSIGNMENT` : leaderSnapshot.docs[0].id;
                approverName = leaderSnapshot.empty ? leaderRole.replace(/_/g, ' ') : leaderSnapshot.docs[0].data().displayName;
                approverRole = leaderRole;
                status = 'pending_department_leader';
            } else if (isHRMEmployee || isFinanceEmployee) {
                const leaderRole = isHRMEmployee ? 'hrm_leader' : 'finance_leader';

                const leaderQuery = query(collection(db!, 'users'), where('userRole', '==', leaderRole));
                const leaderSnapshot = await getDocs(leaderQuery);

                approverId = leaderSnapshot.empty ? `PENDING_${leaderRole.toUpperCase()}_ASSIGNMENT` : leaderSnapshot.docs[0].id;
                approverName = leaderSnapshot.empty ? leaderRole.replace(/_/g, ' ') : leaderSnapshot.docs[0].data().displayName;
                approverRole = leaderRole;
                status = 'pending_department_leader';
            } else if (isMD) {
                const clerkQuery = query(collection(db!, 'users'), where('userRole', '==', 'stock_clerk'));
                const clerkSnapshot = await getDocs(clerkQuery);
                approverId = clerkSnapshot.empty ? 'PENDING_CLERK_ASSIGNMENT' : clerkSnapshot.docs[0].id;
                approverName = clerkSnapshot.empty ? 'Stock Clerk' : clerkSnapshot.docs[0].data().displayName;
                approverRole = 'stock_clerk';
                status = 'approved_by_md';
                historyNote += ' (Auto-Approved)';
            } else if (isAC || isTL) {
                const mdQuery = query(collection(db!, 'users'), where('userRole', '==', 'managing_director'));
                const mdSnapshot = await getDocs(mdQuery);
                approverId = mdSnapshot.empty ? 'PENDING_MD_ASSIGNMENT' : mdSnapshot.docs[0].id;
                approverName = mdSnapshot.empty ? 'Managing Director' : mdSnapshot.docs[0].data().displayName;
                approverRole = 'managing_director';
                status = 'approved_by_coordinator';
                historyNote += ' (Auto-Approved)';
            } else if (isDeptHead) {
                const acQuery = query(collection(db!, 'users'), where('userRole', '==', 'academic_coordinator'));
                const acSnapshot = await getDocs(acQuery);
                approverId = acSnapshot.empty ? 'PENDING_AC_ASSIGNMENT' : acSnapshot.docs[0].id;
                approverName = acSnapshot.empty ? 'Academic Coordinator' : acSnapshot.docs[0].data().displayName;
                approverRole = 'academic_coordinator';
                status = 'approved_by_head';
                historyNote += ' (Auto-Approved)';
            } else {
                const deptHeadRole = `${department}_head`;
                const headQuery = query(collection(db!, 'users'), where('userRole', '==', deptHeadRole));
                const headSnapshot = await getDocs(headQuery);
                if (!headSnapshot.empty) {
                    approverId = headSnapshot.docs[0].id;
                    approverName = headSnapshot.docs[0].data().displayName;
                    approverRole = 'department_head';
                    status = 'pending';
                }
            }

            const ruledItems = cart.filter(item => item.materialType === 'fixed_asset');
            let acRules: Record<string, any> = {};

            if (ruledItems.length > 0) {
                const rulesSnapshot = await getDocs(collection(db!, 'AC_rules'));
                rulesSnapshot.docs.forEach(doc => {
                    acRules[doc.id] = doc.data();
                });
            }

            const requestItems = cart.map(item => {
                let acDecision = 'non';
                if (item.materialType === 'fixed_asset') {
                    const rule = acRules[item.id];
                    if (rule) {
                        const isLowStock = item.quantity <= rule.lowStockAmount;
                        const isOverMax = item.requestedQuantity >= rule.maxRequestAmount;
                        if (isLowStock || isOverMax) acDecision = 'need AC decision';
                    }
                }

                return {
                    materialId: item.id,
                    materialName: item.materialName,
                    materialCode: item.materialCode,
                    quantity: item.requestedQuantity,
                    condition: item.condition,
                    unit: item.unit,
                    materialType: item.materialType,
                    image: item.image,
                    AC_decition: acDecision
                };
            });

            const requestData = {
                requesterId: user.uid,
                requesterName: userData.displayName || user.displayName,
                department: department,
                items: requestItems,
                currentApproverId: approverId,
                currentApproverName: approverName,
                currentApproverRole: approverRole,
                status: status,
                createdAt: serverTimestamp(),
                history: [{
                    status: status === 'pending' ? 'submitted' : status,
                    user: user.uid,
                    timestamp: new Date().toISOString(),
                    note: historyNote
                }]
            };

            await addDoc(collection(db!, 'Request_materials'), requestData);
            setStep(4);
            setCart([]);
            setShowSuccess(true);
        } catch (error) {
            console.error("Error submitting request:", error);
            alert("Failed to submit request.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.materialName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-slate-50/30 pb-20 space-y-12 max-w-[1800px] mx-auto">

            {/* PROGRESS NAV - STICKY TOP-0 */}
            <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-3xl border-b border-slate-100 shadow-xl shadow-slate-200/20 px-4 md:px-14 py-4 md:py-6">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 lg:gap-10 overflow-x-auto no-scrollbar scroll-smooth">
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[9px] md:text-[10px] font-black transition-all duration-500 shadow-sm ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>01</div>
                            <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] ${step === 1 ? 'text-slate-800' : 'text-slate-400'}`}>Discovery</span>
                        </div>
                        <FiChevronRight className="text-slate-200 shrink-0" />
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[9px] md:text-[10px] font-black transition-all duration-500 shadow-sm ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>02</div>
                            <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] ${step === 2 ? 'text-slate-800' : 'text-slate-400'}`}>Profiling</span>
                        </div>
                        <FiChevronRight className="text-slate-200 shrink-0" />
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[9px] md:text-[10px] font-black transition-all duration-500 shadow-sm ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>03</div>
                            <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] ${step === 3 ? 'text-slate-800' : 'text-slate-400'}`}>Manifest</span>
                        </div>
                    </div>

                    {cart.length > 0 && step !== 3 && (
                        <button
                            onClick={() => setStep(3)}
                            className="bg-slate-900 text-white px-5 md:px-8 py-2 md:py-3 rounded-xl flex items-center gap-2 md:gap-3 hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 group shrink-0"
                        >
                            <FiShoppingCart className="text-indigo-400 text-sm md:text-base" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none hidden sm:inline">Review ({cart.length})</span>
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none sm:hidden">{cart.length}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="px-6 lg:px-14">
                {/* STEP 1: MATERIAL LISTING - LARGE RECTANGULAR CARDS */}
                {step === 1 && (
                    <div className="space-y-12 animate-in fade-in duration-700">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10">
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex items-center gap-3 text-indigo-600 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em]">
                                    <FiLayers /> Global Inventory Archive
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                                    Inventory <span className="text-indigo-600">Archive</span>
                                </h1>
                            </div>
                            <div className="relative w-full md:w-[450px] group">
                                <FiSearch className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors text-lg md:text-xl" />
                                <input
                                    type="text"
                                    placeholder="SEARCH MATERIALS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 bg-white border border-slate-200 rounded-2xl focus:ring-[12px] focus:ring-indigo-500/5 focus:border-indigo-500/50 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-lg shadow-slate-200/20 uppercase text-[10px] md:text-xs tracking-widest"
                                />
                            </div>
                        </div>

                        {/* Updated Grid for LARGER cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                            {filteredMaterials.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => { setSelectedMaterial(m); setStep(2); }}
                                    className="group cursor-pointer"
                                >
                                    <div className="space-y-6 transition-all duration-700">
                                        {/* Rectangular Card Container */}
                                        <div className="aspect-square bg-white rounded-3xl border-2 border-slate-50 p-6 shadow-2xl shadow-slate-200/30 group-hover:shadow-indigo-200/50 group-hover:border-indigo-100 transition-all duration-500 relative flex flex-col items-center justify-center overflow-hidden">
                                            <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner group-hover:scale-95 transition-all duration-700 z-10">
                                                {m.image ? (
                                                    <Image src={m.image} alt={m.materialName} fill className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-50/50 flex items-center justify-center">
                                                        <FiBox className="text-slate-100 text-[100px]" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Rectangular Hover Overlay */}
                                            <div className="absolute inset-x-8 bottom-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
                                                <div className="bg-slate-900/90 backdrop-blur-md px-6 py-4 rounded-xl flex items-center justify-center gap-4 shadow-2xl">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Identify Profile</span>
                                                    <FiArrowLeft className="text-indigo-400 rotate-180" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-2 space-y-1">
                                            <h3 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-[1.1] line-clamp-2">
                                                {m.materialName}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: MATERIAL DETAIL VIEW - RECTANGULAR CANVAS */}
                {step === 2 && selectedMaterial && (
                    <div className="animate-in slide-in-from-right-10 duration-700">
                        <button
                            onClick={() => { setStep(1); setSelectedMaterial(null); }}
                            className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-indigo-600 transition-all mb-10 group"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Return to Archives
                        </button>

                        <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                            {/* Rectangular Cinematic Canvas */}
                            <div className="lg:col-span-5 p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-50">
                                <div className="w-full aspect-square relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-white border border-white">
                                    {selectedMaterial.image ? (
                                        <Image src={selectedMaterial.image} alt={selectedMaterial.materialName} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                            <FiBox className="text-slate-100 text-[100px] md:text-[150px]" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-2 md:gap-3">
                                    {selectedMaterial.tags?.split(',').map((tag, idx) => (
                                        <span key={idx} className="text-[8px] md:text-[9px] font-black text-slate-500 bg-white px-4 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl border border-slate-100 uppercase tracking-widest shadow-sm">
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Metadata Mainframe */}
                            <div className="lg:col-span-7 p-8 md:p-12 lg:p-24 space-y-12 md:space-y-16 bg-white">
                                <div className="space-y-4 md:space-y-6">
                                    <span className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm
                                        ${selectedMaterial.materialType === 'fixed_asset' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                        {selectedMaterial.materialType?.replace('_', ' ')}
                                    </span>
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
                                        {selectedMaterial.materialName}
                                    </h1>
                                    <div className="border-l-4 border-slate-100 pl-6 md:pl-8 ml-1">
                                        <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-2xl italic">
                                            "{selectedMaterial.description || 'No specialized metadata logged for this identifier entity.'}"
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 md:gap-x-16 gap-y-10 md:gap-y-12">
                                    <div className="space-y-8 md:space-y-10">
                                        <div className="group">
                                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-2 md:mb-3">
                                                <FiTag className="text-indigo-500" /> Identifier Category
                                            </p>
                                            <p className="text-lg md:text-xl font-black text-slate-800 tracking-tight">{selectedMaterial.category}</p>
                                        </div>
                                        <div className="group">
                                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-2 md:mb-3">
                                                <FiActivity className="text-indigo-500" /> Physical Integrity
                                            </p>
                                            <p className="text-lg md:text-xl font-black text-slate-800 tracking-tight">{selectedMaterial.condition}</p>
                                        </div>
                                        {/* Added Remarks Node */}
                                        <div className="group">
                                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-2 md:mb-3">
                                                <FiBookOpen className="text-indigo-500" /> Administrative Remarks
                                            </p>
                                            <p className="text-xs md:text-sm font-bold text-slate-500 italic leading-relaxed">
                                                {selectedMaterial.remarks || 'Standard requisition protocols apply.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-8 md:space-y-10">
                                        <div className="group">
                                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-2 md:mb-3">
                                                <FiLayers className="text-indigo-500" /> Archive Stock Level
                                            </p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{selectedMaterial.quantity}</p>
                                                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{selectedMaterial.unit}</p>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-2 md:mb-3">
                                                <FiMapPin className="text-indigo-500" /> Archive Coordinates
                                            </p>
                                            <p className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Zone {selectedMaterial.storeLocation}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => addToCart(selectedMaterial)}
                                    disabled={selectedMaterial.quantity === 0}
                                    className="w-full py-6 md:py-8 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-sm hover:bg-white hover:text-slate-900 border-2 md:border-4 border-transparent hover:border-slate-900 transition-all shadow-[0_30px_60px_-10px_rgba(0,0,0,0.3)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 md:gap-6"
                                >
                                    {selectedMaterial.quantity === 0 ? 'Exhausted' : (
                                        <>
                                            <FiShoppingCart className="text-xl md:text-2xl" />
                                            Add to Requisition Manifest
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: REQUEST REVIEW */}
                {step === 3 && (
                    <div className="animate-in slide-in-from-bottom-10 duration-700 space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10">
                            <div className="space-y-3 md:space-y-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-3 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-indigo-600 transition-all"
                                >
                                    <FiArrowLeft /> Back to Archives
                                </button>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">Review <span className="text-indigo-600">Manifest</span></h1>
                            </div>
                            <div className="bg-white px-6 md:px-10 py-4 md:py-6 rounded-2xl border border-slate-200 shadow-xl text-left md:text-right w-full md:w-auto">
                                <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1 md:mb-2 leading-none">Manifest Volume</p>
                                <div className="flex items-baseline md:justify-end gap-2 leading-none">
                                    <p className="text-4xl md:text-5xl font-black text-indigo-600">{cart.length}</p>
                                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Entities</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-12 items-start">
                            <div className="xl:col-span-8 space-y-8">
                                {cart.map((item, idx) => (
                                    <div key={item.id} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                                        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                                            <div className="w-32 h-32 rounded-2xl overflow-hidden relative border border-slate-50 shadow-2xl bg-white shrink-0">
                                                {item.image ? (
                                                    <Image src={item.image} alt={item.materialName} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                                        <FiBox className="text-slate-100 text-5xl" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-6 w-full">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{item.materialName}</h3>
                                                        <p className="text-[10px] font-mono text-slate-300 font-black tracking-widest uppercase mt-3">ID: {item.id.slice(0, 12)}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <FiTrash2 className="text-2xl" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-3 gap-8 pt-6 border-t border-slate-50">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Condition</p>
                                                        <p className="font-black text-slate-700 text-xs uppercase">{item.condition}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Quantity</p>
                                                        <div className="flex items-center gap-4">
                                                            <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-300 hover:text-indigo-600 transition-colors"><FiMinus className="text-sm" /></button>
                                                            <span className="text-sm font-black text-slate-900 w-4 text-center">{item.requestedQuantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-300 hover:text-indigo-600 transition-colors"><FiPlus className="text-sm" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="xl:col-span-4 lg:sticky lg:top-32 h-fit w-full">
                                <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white space-y-8 md:space-y-10 shadow-2xl relative overflow-hidden">
                                    <div className="space-y-2">
                                        <p className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Dispatch Sequence</p>
                                        <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">Authorize <br />Manifest</h2>
                                    </div>

                                    <div className="space-y-5 md:space-y-6">
                                        <div className="flex justify-between items-center py-4 md:py-6 border-b border-white/5">
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Faculty Entity</span>
                                            <span className="font-black text-white text-[10px] md:text-xs uppercase">{userData?.department?.replace('_', ' ') || 'Academic'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 md:py-6 border-b border-white/5">
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Registry Target</span>
                                            <span className="font-black text-[10px] md:text-xs text-indigo-300 uppercase tracking-widest">Dept Head</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || cart.length === 0}
                                        className="w-full py-5 md:py-8 bg-indigo-600 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-xs hover:bg-white hover:text-slate-900 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin mx-auto"></div>
                                        ) : (
                                            <span className="flex items-center justify-center gap-3 md:gap-4">Initialize Dispatch <FiCheckCircle className="text-lg md:text-xl" /></span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: SUCCESS REQUISITION */}
                {step === 4 && (
                    <div className="max-w-2xl mx-auto py-20 md:py-40 px-6 text-center space-y-8 md:space-y-12 animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-50 text-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200">
                            <FiCheckCircle className="text-5xl md:text-[75px]" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase">Dispatched</h3>
                            <p className="text-slate-500 font-medium text-base md:text-lg max-w-sm mx-auto">
                                Your requisition manifest has been securely transmitted to the faculty head registry.
                            </p>
                        </div>

                        <div className="pt-6 md:pt-10 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                            <button
                                onClick={() => setStep(1)}
                                className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-indigo-600 transition-all shadow-2xl"
                            >
                                New Requisition
                            </button>
                            <button
                                onClick={() => window.location.href = '/academic-staff/teachers'}
                                className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-white text-slate-400 border border-slate-100 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-slate-50 transition-all"
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-right { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes slide-in-bottom { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes zoom-in { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                
                .animate-in { animation-fill-mode: forwards; }
                .fade-in { animation: fade-in 0.6s ease-out; }
                .slide-in-from-right-10 { animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .slide-in-from-bottom-10 { animation: slide-in-bottom 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .zoom-in-95 { animation: zoom-in 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
}
