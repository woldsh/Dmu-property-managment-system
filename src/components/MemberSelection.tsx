'use client';

import { useState, useEffect } from 'react';
import React from 'react';
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
    department?: string;
}

export default function MemberSelection({ onStartMeeting }: MemberSelectionProps) {
    const [staff, setStaff] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(true);
    const [departments, setDepartments] = useState<Array<{
        id: string;
        label: string;
        icon: React.ReactElement;
        color: string;
        bg: string;
        border: string;
        text: string;
        activeShadow: string;
    }>>([]);

    // Department icon and color mapping
    const getDepartmentStyle = (deptId: string) => {
        const styles: { [key: string]: any } = {
            computer_science: {
                icon: <FaLaptopCode size={18} />,
                color: 'from-cyan-500 to-blue-600',
                bg: 'bg-cyan-50',
                border: 'border-cyan-100',
                text: 'text-cyan-700',
                activeShadow: 'shadow-cyan-200'
            },
            economics: {
                icon: <FaChartLine size={18} />,
                color: 'from-amber-500 to-orange-600',
                bg: 'bg-amber-50',
                border: 'border-amber-100',
                text: 'text-amber-700',
                activeShadow: 'shadow-amber-200'
            },
            accounting_finance: {
                icon: <FaCalculator size={18} />,
                color: 'from-rose-500 to-red-600',
                bg: 'bg-rose-50',
                border: 'border-rose-100',
                text: 'text-rose-700',
                activeShadow: 'shadow-rose-200'
            },
            management: {
                icon: <FaUserTie size={18} />,
                color: 'from-purple-500 to-indigo-600',
                bg: 'bg-purple-50',
                border: 'border-purple-100',
                text: 'text-purple-700',
                activeShadow: 'shadow-purple-200'
            }
        };

        // Default style for departments not in the mapping
        return styles[deptId] || {
            icon: <FaUserTie size={18} />,
            color: 'from-gray-500 to-gray-600',
            bg: 'bg-gray-50',
            border: 'border-gray-100',
            text: 'text-gray-700',
            activeShadow: 'shadow-gray-200'
        };
    };

    const formatDepartmentName = (deptId: string) => {
        return deptId.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    useEffect(() => {
        const fetchStaff = async () => {
            if (!db) return;
            try {
                const querySnapshot = await getDocs(collection(db!, "users"));
                const filteredStaff: StaffUser[] = [];
                const deptSet = new Set<string>();

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const subRole = (data.subRole || '').toLowerCase();
                    const userRole = (data.userRole || '').toLowerCase();

                    if (subRole === 'department_head' || subRole === 'academic_management' ||
                        userRole.includes('department_head') || userRole.includes('academic_coordinator') ||
                        userRole.endsWith('_head')) {

                        // Extract department from userRole if department field is missing
                        let department = data.department || '';
                        if (!department && userRole.endsWith('_head')) {
                            department = userRole.replace('_head', '');
                        }

                        filteredStaff.push({
                            id: doc.id,
                            fullName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown User',
                            userRole: userRole,
                            subRole: subRole,
                            email: data.email || '',
                            department: department
                        });

                        // Collect unique departments from department heads
                        if (subRole === 'department_head' || userRole.endsWith('_head')) {
                            let deptId = data.department;

                            // If no department field, try to extract from userRole
                            if (!deptId && userRole.endsWith('_head')) {
                                deptId = userRole.replace('_head', '');
                            }

                            if (deptId) {
                                deptSet.add(deptId);
                            }
                        }
                    }
                });

                // Build dynamic departments array
                const dynamicDepts = Array.from(deptSet).map(deptId => {
                    const style = getDepartmentStyle(deptId);
                    return {
                        id: deptId,
                        label: formatDepartmentName(deptId),
                        ...style
                    };
                });

                console.log('🔍 DEBUG: Found departments:', Array.from(deptSet));
                console.log('🔍 DEBUG: Dynamic departments array:', dynamicDepts);
                console.log('🔍 DEBUG: Filtered staff:', filteredStaff);

                setDepartments(dynamicDepts);
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
            (s.subRole === 'department_head' || s.userRole.endsWith('_head')) &&
            (s.department === deptId || s.userRole.includes(deptId.toLowerCase()))
        );
    };

    const getAC = () => {
        return staff.find(s => s.subRole === 'academic_management' || s.userRole.includes('academic_coordinator'));
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
                        <FaGlobe size={14} /> PUBLIC (HEADS & AC)
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
                {isPublic ? 'START PUBLIC MEETING (HEADS & AC)' : `START PRIVATE & SEND INVITES (${selectedRoles.length + selectedDepartments.length})`}
                <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>
    );
}
