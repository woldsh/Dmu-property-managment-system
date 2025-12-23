'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch, FiUser, FiPackage, FiCalendar, FiClock,
    FiCheckCircle, FiChevronRight, FiArrowLeft, FiBox,
    FiActivity, FiInfo, FiTag, FiTruck, FiMapPin, FiDollarSign,
    FiLayers, FiShield, FiBriefcase, FiShoppingBag, FiMail, FiShield as FiRole
} from 'react-icons/fi';
import { getDocs, where } from 'firebase/firestore';
import Image from 'next/image';

interface ReportHistory {
    status: string;
    user: string;
    timestamp: string;
    note: string;
}

interface UserReportDocument {
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
    withdrawalDate: any;
    acceptedAt?: string; // String ISO format as per user sample
    approvedAt?: any;    // Timestamp
    approvedBy?: string;
    approvedByName?: string;
    createdAt?: any;     // Timestamp
    status: string;      // 'pending', 'accepted', etc.
    processedBy?: string;
    processedByName?: string;
    history?: ReportHistory[];
}

interface EmployeeSummary {
    uid: string;
    name: string;
    department: string;
    totalReports: number;
    lastReportDate: any;
    reportCount: number;
    photoURL?: string;
}

interface MaterialInventoryData {
    category: string;
    condition: string;
    createdAt: string;
    currency: string;
    description: string;
    expiryDate?: string;
    image: string;
    materialCode: string;
    materialName: string;
    materialType: string;
    purchaseDate: string;
    quantity: number;
    remarks: string;
    responsiblePerson: string;
    serialNumber: string;
    shelfNumber: string;
    storeLocation: string;
    tags: string;
    totalPrice: number;
    unit: string;
    unitPrice: number;
    vendorName: string;
}

interface EmployeeReportViewProps {
    filterType?: 'fixed' | 'consumable' | 'all';
    hidePending?: boolean;
    categorizeByType?: boolean;
    onlyAccepted?: boolean;
    userId?: string;
}

export default function EmployeeReportView({
    filterType = 'all',
    hidePending = false,
    categorizeByType = false,
    onlyAccepted = false,
    userId = ''
}: EmployeeReportViewProps) {
    const [allReports, setAllReports] = useState<UserReportDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSummary | null>(null);
    const [employeeProfiles, setEmployeeProfiles] = useState<Record<string, { photoURL?: string; email?: string; role?: string }>>({});
    const [materialDetails, setMaterialDetails] = useState<Record<string, MaterialInventoryData>>({});

    // Filter reports based on component props
    const reports = useMemo(() => {
        return allReports.filter(report => {
            const matchesStatus = hidePending ? report.status !== 'pending' : true;

            // Apply onlyAccepted filter (Show only 'accepted' records, hide 'completed' and 'pending')
            const matchesAcceptedOnly = onlyAccepted ? report.status === 'accepted' : true;

            const matchesType = filterType === 'all' ? true :
                filterType === 'fixed' ? (report.materialType === 'fixed_asset' || report.materialType === 'fixed') :
                    filterType === 'consumable' ? (report.materialType === 'consumable_item' || report.materialType === 'consumable') : true;

            const matchesUser = userId ? report.requesterId === userId : true;

            return matchesStatus && matchesAcceptedOnly && matchesType && matchesUser;
        });
    }, [allReports, filterType, hidePending, onlyAccepted, userId]);

    // Real-time tracking of User-Report collection
    useEffect(() => {
        const q = query(
            collection(db, 'User-Report'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as UserReportDocument[];

            setAllReports(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching User-Report:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Derive unique employees and their stats
    const employees = useMemo(() => {
        const empMap = new Map<string, EmployeeSummary>();

        reports.forEach(report => {
            if (!report.requesterId) return;

            const existing = empMap.get(report.requesterId);
            if (existing) {
                existing.totalReports += 1;
                // Update last report date if this one is newer
                const currentLast = existing.lastReportDate?.toDate?.() || new Date(0);
                const reportDate = report.createdAt?.toDate?.() || new Date(0);
                if (reportDate > currentLast) {
                    existing.lastReportDate = report.createdAt;
                }
            } else {
                empMap.set(report.requesterId, {
                    uid: report.requesterId,
                    name: report.requesterName || 'Unknown Employee',
                    department: report.department || 'General Staff',
                    totalReports: 1,
                    lastReportDate: report.createdAt,
                    reportCount: 1
                });
            }
        });

        return Array.from(empMap.values());
    }, [reports]);

    // Automatically select the specific user if userId is provided
    useEffect(() => {
        if (userId && employees.length > 0 && !selectedEmployee) {
            const mySelf = employees.find(e => e.uid === userId);
            if (mySelf) {
                setSelectedEmployee(mySelf);
            }
        }
    }, [userId, employees, selectedEmployee]);

    // Fetch material inventory details for the reports shown
    useEffect(() => {
        const fetchMaterialDetails = async () => {
            const uniqueCodes = Array.from(new Set(reports.map(r => r.materialCode).filter(Boolean)));
            const newDetails: Record<string, MaterialInventoryData> = { ...materialDetails };
            let updated = false;

            const codesToFetch = uniqueCodes.filter(code => !newDetails[code]);

            if (codesToFetch.length > 0) {
                try {
                    // Firestore 'in' query supports up to 10-30 items depending on version, 
                    // splitting into chunks of 10 for safety
                    for (let i = 0; i < codesToFetch.length; i += 10) {
                        const chunk = codesToFetch.slice(i, i + 10);
                        const q = query(
                            collection(db, 'materials'),
                            where('materialCode', 'in', chunk)
                        );
                        const snap = await getDocs(q);
                        snap.forEach(doc => {
                            const data = doc.data() as MaterialInventoryData;
                            newDetails[data.materialCode] = data;
                            updated = true;
                        });
                    }
                } catch (e) {
                    console.error("Error fetching material details:", e);
                }
            }

            if (updated) {
                setMaterialDetails(newDetails);
            }
        };

        if (reports.length > 0) {
            fetchMaterialDetails();
        }
    }, [reports]);

    // Fetch employee profiles (avatars, emails, roles)
    useEffect(() => {
        const fetchProfiles = async () => {
            const newProfiles: Record<string, { photoURL?: string; email?: string; role?: string }> = { ...employeeProfiles };
            let updated = false;

            for (const emp of employees) {
                if (!newProfiles[emp.uid]) {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', emp.uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            newProfiles[emp.uid] = {
                                photoURL: data.photoURL,
                                email: data.email,
                                role: data.userRole
                            };
                            updated = true;
                        }
                    } catch (e) {
                        console.error("Error fetching profile for", emp.uid, e);
                    }
                }
            }

            if (updated) {
                setEmployeeProfiles(newProfiles);
            }
        };

        if (employees.length > 0) {
            fetchProfiles();
        }
    }, [employees]);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const employeeReports = useMemo(() => {
        if (!selectedEmployee) return [];
        return reports.filter(r => r.requesterId === selectedEmployee.uid);
    }, [reports, selectedEmployee]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
            <AnimatePresence mode="wait">
                {!selectedEmployee ? (
                    /* Directory View */
                    <motion.div
                        key="directory"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                    >
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/60 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-[100px]"></div>

                            <div className="relative z-10 flex-1">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                                    <FiActivity className="animate-pulse" /> Personnel Logistics Tracking
                                </div>
                                <h2 className="text-5xl font-black text-slate-800 tracking-tight leading-none italic uppercase">
                                    Employee <span className="text-indigo-600 not-italic">Directory</span>
                                </h2>
                                <p className="text-slate-500 font-bold mt-4 uppercase text-[10px] tracking-[0.4em] opacity-60">
                                    Consolidated Material Withdrawal Intelligence
                                </p>
                            </div>

                            <div className="relative group w-full md:w-[28rem] z-10">
                                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors text-xl" />
                                <input
                                    type="text"
                                    placeholder="Search by name or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-16 pr-8 py-6 bg-white/80 border-2 border-white/50 rounded-[2rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-xl"
                                />
                            </div>
                        </div>

                        {/* Grid View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredEmployees.map((emp, index) => {
                                const profile = employeeProfiles[emp.uid];
                                return (
                                    <motion.div
                                        key={emp.uid}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => setSelectedEmployee(emp)}
                                        className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 cursor-pointer overflow-hidden p-8 flex flex-col items-center text-center"
                                    >
                                        {/* Card Header Gradient */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="relative mb-6">
                                            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                {profile?.photoURL ? (
                                                    <img src={profile.photoURL} alt={emp.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiUser className="text-4xl text-slate-300" />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-lg">
                                                <FiPackage className="text-indigo-600" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="space-y-1">
                                                <h3 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-none">
                                                    {emp.name}
                                                </h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {emp.department}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 mt-2">
                                                {profile?.email && (
                                                    <p className="text-[9px] font-bold text-slate-400 lowercase tracking-tight flex items-center gap-1">
                                                        <FiMail className="text-[10px]" /> {profile?.email}
                                                    </p>
                                                )}
                                                {profile?.role && (
                                                    <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                            <FiRole className="text-[9px]" /> {profile?.role?.replace(/_/g, ' ')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-50 w-full flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-slate-300">Total Items</span>
                                                <span className="text-indigo-600 text-sm">{emp.totalReports}</span>
                                            </div>
                                            <FiChevronRight className="text-lg group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {filteredEmployees.length === 0 && (
                                <div className="col-span-full py-40 text-center space-y-6 bg-white/20 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-white/40">
                                    <div className="w-24 h-24 bg-white/40 rounded-full flex items-center justify-center mx-auto">
                                        <FiTag className="text-5xl text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest">System Clear</h3>
                                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest opacity-60">No matching deployment signals found</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    /* Detailed View */
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {/* Detail Header */}
                        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="absolute top-8 left-8 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all text-slate-400 z-20 shadow-sm active:scale-95"
                            >
                                <FiArrowLeft className="text-xl" />
                            </button>

                            {(() => {
                                const profile = employeeProfiles[selectedEmployee.uid];
                                return (
                                    <>
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl relative z-10 flex-shrink-0">
                                            {profile?.photoURL ? (
                                                <img src={profile.photoURL} alt={selectedEmployee.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FiUser className="text-5xl text-slate-300" />
                                            )}
                                        </div>

                                        <div className="text-center md:text-left flex-1 relative z-10 pt-12 md:pt-0">
                                            <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                                                {selectedEmployee.name}
                                            </h3>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                                                <div className="px-5 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-2">
                                                    <FiMapPin className="text-indigo-500" />
                                                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{selectedEmployee.department}</span>
                                                </div>
                                                {profile?.email && (
                                                    <div className="px-5 py-2 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                                                        <FiMail className="text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest lowercase tracking-tight">{profile?.email}</span>
                                                    </div>
                                                )}
                                                {profile?.role && (
                                                    <div className="px-5 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                                                        <FiRole className="text-emerald-500" />
                                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{profile?.role?.replace(/_/g, ' ')}</span>
                                                    </div>
                                                )}
                                                <div className="px-5 py-2 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                                                    <FiBox className="text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{selectedEmployee.totalReports} Items Total</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}

                            <div className="hidden xl:flex flex-col items-end gap-2 pr-4 relative z-10 text-right">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Lifecycle Data</span>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <FiClock />
                                    <span className="text-[10px] font-bold uppercase tracking-widest italic">
                                        Last Sync: {selectedEmployee.lastReportDate?.toDate?.()?.toLocaleDateString() || 'Never'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reports List */}
                        <div className="space-y-12">
                            {(() => {
                                if (!categorizeByType) {
                                    return (
                                        <div className="space-y-6">
                                            {employeeReports.map((report, idx) => {
                                                const material = materialDetails[report.materialCode];
                                                const isFixed = report.materialType === 'fixed_asset' || report.materialType === 'fixed';
                                                const accentColor = isFixed ? 'indigo' : 'cyan';

                                                return (
                                                    <motion.div
                                                        key={report.id}
                                                        initial={{ opacity: 0, y: 30 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className="group bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col overflow-hidden relative"
                                                    >
                                                        {/* Glassy Background Accents */}
                                                        <div className={`absolute top-0 right-0 w-64 h-64 bg-${accentColor}-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                                                        <div className={`absolute bottom-0 left-0 w-64 h-64 bg-${isFixed ? 'emerald' : 'sky'}-500/5 rounded-full -ml-32 -mb-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                                                        {/* Main Content Area */}
                                                        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                                                            {/* Visual & Name Block */}
                                                            <div className="lg:col-span-4 flex items-center gap-6">
                                                                <div className="relative group/img flex-shrink-0">
                                                                    <div className={`w-28 h-28 rounded-[2rem] bg-slate-50 border-2 border-white shadow-inner flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-${accentColor}-500/10`}>
                                                                        {report.image ? (
                                                                            <img src={report.image} alt={report.materialName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                                        ) : (
                                                                            <FiBox className="text-4xl text-slate-200" />
                                                                        )}
                                                                    </div>
                                                                    <div className={`absolute -inset-1 rounded-[2.2rem] border-2 border-dashed ${report.status === 'accepted' ? 'border-green-200/50' : 'border-amber-200/50'} animate-[spin_20s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <div className="space-y-1">
                                                                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">
                                                                            {report.materialName}
                                                                        </h4>
                                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                                            <span className={`px-3 py-1 rounded-lg bg-${accentColor}-50 border border-${accentColor}-100 text-[9px] font-black text-${accentColor}-500 uppercase tracking-widest`}>
                                                                                {report.materialType.replace('_', ' ')}
                                                                            </span>
                                                                            {material?.category && (
                                                                                <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                                                    {material?.category}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 shadow-sm">
                                                                            <FiTag className={`text-${accentColor}-400`} />
                                                                            <span className="text-xs font-black text-slate-700">{report.quantity} {report.unit}</span>
                                                                        </div>
                                                                        {material?.unitPrice && (
                                                                            <span className="text-[10px] font-bold text-slate-300 italic">
                                                                                @ {material?.unitPrice} {material?.currency}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Logistics & Timeline */}
                                                            <div className="lg:col-span-4 lg:border-x border-slate-100 px-0 lg:px-10 space-y-6">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Deployment Status</span>
                                                                    <motion.div
                                                                        whileHover={{ scale: 1.05 }}
                                                                        className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 flex items-center gap-2 shadow-lg ${report.status === 'accepted'
                                                                            ? 'bg-green-50 border-green-200 text-green-600 shadow-green-500/5'
                                                                            : 'bg-amber-50 border-amber-200 text-amber-600 shadow-amber-500/5'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-2 h-2 rounded-full animate-pulse ${report.status === 'accepted' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                                        {report.status}
                                                                    </motion.div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                                                                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">
                                                                            <FiCalendar /> Handover
                                                                        </div>
                                                                        <p className="text-xs font-black text-slate-800">
                                                                            {report.acceptedAt ? new Date(report.acceptedAt).toLocaleDateString() : 'Pending'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                                                                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">
                                                                            <FiClock /> Approved
                                                                        </div>
                                                                        <p className="text-xs font-black text-slate-800">
                                                                            {report.approvedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Validation Matrix Block */}
                                                            <div className="lg:col-span-4 space-y-6">
                                                                <div className={`flex items-center gap-3 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 group-hover:border-${accentColor}-100 transition-all duration-500 relative overflow-hidden`}>
                                                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${accentColor}-500/5 rounded-full -mr-12 -mt-12`}></div>
                                                                    <div className={`w-14 h-14 rounded-2xl bg-${accentColor}-600 flex items-center justify-center text-white shadow-lg shadow-${accentColor}-200 flex-shrink-0 relative z-10`}>
                                                                        <FiCheckCircle className="text-2xl" />
                                                                    </div>
                                                                    <div className="relative z-10">
                                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Authorization</p>
                                                                        <p className={`text-sm font-black text-${accentColor}-600 uppercase tracking-tight truncate max-w-[150px]`}>
                                                                            {report.approvedByName}
                                                                        </p>
                                                                        <p className="text-[8px] font-bold text-slate-400 mt-0.5">Verified System Controller</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap gap-4">
                                                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                                                                        <FiActivity className={`text-${accentColor}-400 text-xs`} />
                                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Quality:</span>
                                                                        <span className={`text-[9px] font-black text-slate-600 uppercase tracking-widest underline decoration-${accentColor}-200 underline-offset-4`}>{report.condition}</span>
                                                                    </div>
                                                                    {material?.vendorName && (
                                                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                                                                            <FiShoppingBag className={`text-${accentColor}-400 text-xs`} />
                                                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Supplier:</span>
                                                                            <span className={`text-[9px] font-black text-slate-600 uppercase tracking-widest underline decoration-${accentColor}-200 underline-offset-4`}>{material?.vendorName}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Technical Specification Bar */}
                                                        {material && (
                                                            <div className="bg-slate-50 border-t border-slate-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden group-hover:bg-slate-100/50 transition-colors duration-700">
                                                                <div className="absolute top-0 right-10 transform -translate-y-1/2 px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-mono font-black text-slate-400 shadow-sm opacity-50 group-hover:opacity-100 transition-opacity">
                                                                    #{report.materialCode}
                                                                </div>

                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                                        <FiTag className={`text-${accentColor}-500`} /> Serial Signature
                                                                    </div>
                                                                    <div className={`p-3 bg-white rounded-2xl border border-slate-100 font-mono text-[11px] font-black text-slate-700 text-center tracking-widest group-hover:border-${accentColor}-200 transition-colors`}>
                                                                        {material?.serialNumber || 'NON_SERIALIZED'}
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                                        <FiMapPin className="text-emerald-500" /> Nexus Location
                                                                    </div>
                                                                    <div className="p-3 bg-white rounded-2xl border border-slate-100 font-black text-[10px] text-slate-700 flex justify-between items-center group-hover:border-emerald-200 transition-colors">
                                                                        <span className="uppercase text-slate-400">Station {material?.storeLocation}</span>
                                                                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px]">Shelf {material?.shelfNumber}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                                        <FiActivity /> System Narrative
                                                                    </div>
                                                                    <div className="p-3 bg-white rounded-2xl border border-slate-100 italic text-[10px] font-medium text-slate-500 line-clamp-1 group-hover:text-slate-800 transition-colors">
                                                                        {material?.remarks || "No supplementary operational data provided."}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                            {employeeReports.length === 0 && (
                                                <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100">
                                                    <FiPackage className="text-5xl text-slate-100 mx-auto mb-4" />
                                                    <p className="text-slate-400 font-black uppercase tracking-widest">No detailed records found</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                const fixedReports = employeeReports.filter(r => r.materialType === 'fixed_asset' || r.materialType === 'fixed');
                                const consumableReports = employeeReports.filter(r => r.materialType === 'consumable_item' || r.materialType === 'consumable');

                                const renderReportGroup = (title: string, icon: any, reportsList: UserReportDocument[], accentColor: string) => (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 px-8">
                                            <div className={`w-12 h-12 rounded-2xl bg-${accentColor}-50 border border-${accentColor}-100 flex items-center justify-center text-${accentColor}-600 shadow-sm`}>
                                                {icon}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">
                                                    {title}
                                                </h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                    {reportsList.length} Items Documented
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {reportsList.map((report, idx) => {
                                                const material = materialDetails[report.materialCode];
                                                return (
                                                    <motion.div
                                                        key={report.id}
                                                        initial={{ opacity: 0, y: 30 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className="group bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col overflow-hidden relative"
                                                    >
                                                        {/* Glassy Background Accents */}
                                                        <div className={`absolute top-0 right-0 w-64 h-64 bg-${accentColor}-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                                                        {/* Main Content Area */}
                                                        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                                                            {/* Visual & Name Block */}
                                                            <div className="lg:col-span-4 flex items-center gap-6">
                                                                <div className="relative group/img flex-shrink-0">
                                                                    <div className={`w-28 h-28 rounded-[2rem] bg-slate-50 border-2 border-white shadow-inner flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-${accentColor}-500/10`}>
                                                                        {report.image ? (
                                                                            <img src={report.image} alt={report.materialName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                                        ) : (
                                                                            <FiBox className="text-4xl text-slate-200" />
                                                                        )}
                                                                    </div>
                                                                    <div className={`absolute -inset-1 rounded-[2.2rem] border-2 border-dashed ${report.status === 'accepted' ? 'border-green-200/50' : 'border-amber-200/50'} animate-[spin_20s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <div className="space-y-1">
                                                                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">
                                                                            {report.materialName}
                                                                        </h4>
                                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                                            <span className={`px-3 py-1 rounded-lg bg-${accentColor}-50 border border-${accentColor}-100 text-[9px] font-black text-${accentColor}-500 uppercase tracking-widest`}>
                                                                                {report.materialType.replace('_', ' ')}
                                                                            </span>
                                                                            {material?.category && (
                                                                                <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                                                    {material?.category}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 shadow-sm">
                                                                            <FiTag className={`text-${accentColor}-400`} />
                                                                            <span className="text-xs font-black text-slate-700">{report.quantity} {report.unit}</span>
                                                                        </div>
                                                                        {material?.unitPrice && (
                                                                            <span className="text-[10px] font-bold text-slate-300 italic">
                                                                                @ {material?.unitPrice} {material?.currency}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Logistics & Timeline */}
                                                            <div className="lg:col-span-4 lg:border-x border-slate-100 px-0 lg:px-10 space-y-6">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Deployment Status</span>
                                                                    <motion.div
                                                                        whileHover={{ scale: 1.05 }}
                                                                        className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 flex items-center gap-2 shadow-lg ${report.status === 'accepted'
                                                                            ? 'bg-green-50 border-green-200 text-green-600 shadow-green-500/5'
                                                                            : 'bg-amber-50 border-amber-200 text-amber-600 shadow-amber-500/5'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-2 h-2 rounded-full animate-pulse ${report.status === 'accepted' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                                        {report.status}
                                                                    </motion.div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                                                                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">
                                                                            <FiCalendar /> Handover
                                                                        </div>
                                                                        <p className="text-xs font-black text-slate-800">
                                                                            {report.acceptedAt ? new Date(report.acceptedAt).toLocaleDateString() : 'Pending'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                                                                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">
                                                                            <FiClock /> Approved
                                                                        </div>
                                                                        <p className="text-xs font-black text-slate-800">
                                                                            {report.approvedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Validation Matrix Block */}
                                                            <div className="lg:col-span-4 space-y-6">
                                                                <div className={`flex items-center gap-3 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 group-hover:border-${accentColor}-100 transition-all duration-500 relative overflow-hidden`}>
                                                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${accentColor}-500/5 rounded-full -mr-12 -mt-12`}></div>
                                                                    <div className={`w-14 h-14 rounded-2xl bg-${accentColor}-600 flex items-center justify-center text-white shadow-lg shadow-${accentColor}-200 flex-shrink-0 relative z-10`}>
                                                                        <FiCheckCircle className="text-2xl" />
                                                                    </div>
                                                                    <div className="relative z-10">
                                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Authorization</p>
                                                                        <p className={`text-sm font-black text-${accentColor}-600 uppercase tracking-tight truncate max-w-[150px]`}>
                                                                            {report.approvedByName}
                                                                        </p>
                                                                        <p className="text-[8px] font-bold text-slate-400 mt-0.5">Verified System Controller</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap gap-4">
                                                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                                                                        <FiActivity className={`text-${accentColor}-400 text-xs`} />
                                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Quality:</span>
                                                                        <span className={`text-[9px] font-black text-slate-600 uppercase tracking-widest underline decoration-${accentColor}-200 underline-offset-4`}>{report.condition}</span>
                                                                    </div>
                                                                    {material?.vendorName && (
                                                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                                                                            <FiShoppingBag className={`text-${accentColor}-400 text-xs`} />
                                                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Supplier:</span>
                                                                            <span className={`text-[9px] font-black text-slate-600 uppercase tracking-widest underline decoration-${accentColor}-200 underline-offset-4`}>{material?.vendorName}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Technical Specification Bar */}
                                                        {material && (
                                                            <div className="bg-slate-50 border-t border-slate-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden group-hover:bg-slate-100/50 transition-colors duration-700">
                                                                <div className="absolute top-0 right-10 transform -translate-y-1/2 px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-mono font-black text-slate-400 shadow-sm opacity-50 group-hover:opacity-100 transition-opacity">
                                                                    #{report.materialCode}
                                                                </div>

                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                                        <FiTag className={`text-${accentColor}-500`} /> Serial Signature
                                                                    </div>
                                                                    <div className={`p-3 bg-white rounded-2xl border border-slate-100 font-mono text-[11px] font-black text-slate-700 text-center tracking-widest group-hover:border-${accentColor}-200 transition-colors`}>
                                                                        {material?.serialNumber || 'NON_SERIALIZED'}
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                                        <FiMapPin className="text-emerald-500" /> Nexus Location
                                                                    </div>
                                                                    <div className="p-3 bg-white rounded-2xl border border-slate-100 font-black text-[10px] text-slate-700 flex justify-between items-center group-hover:border-emerald-200 transition-colors">
                                                                        <span className="uppercase text-slate-400">Station {material?.storeLocation}</span>
                                                                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px]">Shelf {material?.shelfNumber}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                                        <FiActivity /> System Narrative
                                                                    </div>
                                                                    <div className="p-3 bg-white rounded-2xl border border-slate-100 italic text-[10px] font-medium text-slate-500 line-clamp-1 group-hover:text-slate-800 transition-colors">
                                                                        {material?.remarks || "No supplementary operational data provided."}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );

                                return (
                                    <>
                                        {fixedReports.length > 0 && renderReportGroup("Fixed Assets", <FiShield />, fixedReports, "indigo")}
                                        {consumableReports.length > 0 && renderReportGroup("Consumable Materials", <FiLayers />, consumableReports, "cyan")}

                                        {fixedReports.length === 0 && consumableReports.length === 0 && (
                                            <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100">
                                                <FiPackage className="text-5xl text-slate-100 mx-auto mb-4" />
                                                <p className="text-slate-400 font-black uppercase tracking-widest">No detailed records found for current filters</p>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Policy Card */}
                        <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl mt-12">
                            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full -mr-80 -mt-80 blur-[150px]"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="w-24 h-24 bg-indigo-500/20 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 shadow-inner backdrop-blur-xl">
                                    <FiInfo className="text-5xl text-indigo-400" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <h4 className="text-3xl font-black italic tracking-tighter uppercase">Data Integrity Protocol</h4>
                                    <p className="text-indigo-200/60 font-medium text-lg max-w-4xl leading-relaxed">
                                        The report reflects real-time status updates from the DMU Property Management System. All material transitions are recorded from approval to user acceptance, ensuring a complete audit trail for institutional assets.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
