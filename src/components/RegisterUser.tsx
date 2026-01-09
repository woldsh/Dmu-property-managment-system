'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiLock,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiShield,
  FiLayers,
  FiCommand,
  FiTarget,
  FiCpu,
  FiHardDrive
} from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

interface RegisterUserProps {
  onSuccess?: () => void;
}

export default function RegisterUser({ onSuccess }: RegisterUserProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mainRole, setMainRole] = useState('');

  // Dynamic sub-selection states
  const [academicSelection, setAcademicSelection] = useState('');
  const [departmentSelection, setDepartmentSelection] = useState('');
  const [deptRoleSelection, setDeptRoleSelection] = useState('');

  const [procurementSelection, setProcurementSelection] = useState('');
  const [stockStoreType, setStockStoreType] = useState('');

  const [adminSelection, setAdminSelection] = useState('');
  const [studentServiceSelection, setStudentServiceSelection] = useState('');
  const [adminRoleSelection, setAdminRoleSelection] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Reset sub-selections when main role changes
  useEffect(() => {
    setAcademicSelection('');
    setDepartmentSelection('');
    setDeptRoleSelection('');
    setProcurementSelection('');
    setStockStoreType('');
    setAdminSelection('');
    setStudentServiceSelection('');
    setAdminRoleSelection('');
  }, [mainRole]);

  // Reset student service sub-selection when admin selection changes
  useEffect(() => {
    setStudentServiceSelection('');
    setAdminRoleSelection('');
  }, [adminSelection]);

  // Derived Logic for Final Roles
  const getRoleData = () => {
    switch (mainRole) {
      case 'managing_director':
        return {
          mainRole: 'managing_director',
          userRole: 'managing_director_leader',
          subRole: 'executive'
        };
      case 'general_service':
        return {
          mainRole: 'general_service',
          userRole: 'general_service_leader',
          subRole: 'service_supervisor'
        };
      case 'chief':
        return {
          mainRole: 'chief',
          userRole: 'chief',
          subRole: 'institution_head'
        };
      case 'academic_staff':
        if (academicSelection === 'academic_coordinator') {
          return {
            mainRole: 'academic_staff',
            userRole: 'academic_coordinator',
            subRole: 'academic_management'
          };
        } else if (academicSelection === 'department') {
          const deptMap: { [key: string]: string } = {
            accounting_finance: 'accounting_finance',
            agribusiness: 'agribusiness',
            animal_science: 'animal_science',
            computer_science: 'computer_science',
            economics: 'economics',
            general_forester: 'general_forester',
            horticulture: 'horticulture',
            management: 'management',
            natural_resource_management: 'natural_resource_management',
            plant_science: 'plant_science',
            peace_development: 'peace_development',
            veterinary_science: 'veterinary_science',
            common_course: 'common_course'
          };

          const rolePrefix = deptMap[departmentSelection];
          if (rolePrefix) {
            if (deptRoleSelection === 'head') {
              return {
                mainRole: 'academic_staff',
                userRole: `${rolePrefix}_head`,
                subRole: 'department_head',
                department: departmentSelection
              };
            }
            if (deptRoleSelection === 'teacher') {
              return {
                mainRole: 'academic_staff',
                userRole: `${rolePrefix}_teacher`,
                subRole: 'instructor',
                department: departmentSelection
              };
            }
          }
        }
        break;
      case 'procurement_management':
        if (procurementSelection === 'team_leader') {
          return {
            mainRole: 'procurement_management',
            userRole: 'procurement_team_leader',
            subRole: 'procurement_supervisor'
          };
        } else if (procurementSelection === 'stock_clerk') {
          if (stockStoreType === 'fixed_assets') {
            return { mainRole: 'procurement_management', userRole: 'fixed_asset_stock_clerk', subRole: 'inventory_controller', stockType: 'fixed_assets' };
          } else if (stockStoreType === 'consumable_items') {
            return { mainRole: 'procurement_management', userRole: 'consumable_item_stock_clerk', subRole: 'inventory_controller', stockType: 'consumable_items' };
          }
        } else if (procurementSelection === 'store_keeper') {
          if (stockStoreType === 'fixed_assets') {
            return { mainRole: 'procurement_management', userRole: 'fixed_asset_store_keeper', subRole: 'store_management', storeType: 'fixed_assets' };
          } else if (stockStoreType === 'consumable_items') {
            return { mainRole: 'procurement_management', userRole: 'consumable_item_store_keeper', subRole: 'store_management', storeType: 'consumable_items' };
          }
        }
        break;
      case 'admin_staff':
        if (adminSelection === 'hrm') {
          if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: 'hrm_leader', subRole: 'human_resource_manager' };
          if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: 'hrm_employee', subRole: 'human_resource_staff' };
        } else if (adminSelection === 'finance') {
          if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: 'finance_leader', subRole: 'finance_manager' };
          if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: 'finance_employee', subRole: 'finance_staff' };
        } else if (adminSelection === 'student_service') {
          if (studentServiceSelection === 'overall') {
            return {
              mainRole: 'admin_staff',
              userRole: 'student_service_leader',
              subRole: 'student_service_manager'
            };
          }
          if (studentServiceSelection && adminRoleSelection) {
            const roleKey = `student_service_${studentServiceSelection}_${adminRoleSelection}`;
            return {
              mainRole: 'admin_staff',
              userRole: roleKey,
              subRole: `student_service_${adminRoleSelection}`,
              service: studentServiceSelection
            };
          }
        }
        break;
    }
    return null;
  };

  const currentRoleData = getRoleData();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!currentRoleData) {
      setError('Please complete role selection');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await updateProfile(newUser, {
        displayName: `${firstName} ${lastName}`
      });

      const userDocData = {
        firstName,
        lastName,
        email,
        displayName: `${firstName} ${lastName}`,
        ...currentRoleData,
        createdAt: new Date(),
        updatedAt: new Date(),
        uid: newUser.uid
      };

      await setDoc(doc(db, 'users', newUser.uid), userDocData);

      setSuccess(`User ${email} created successfully!`);

      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setMainRole('');
      setAcademicSelection('');
      setDepartmentSelection('');
      setDeptRoleSelection('');
      setProcurementSelection('');
      setStockStoreType('');
      setAdminSelection('');
      setStudentServiceSelection('');
      setAdminRoleSelection('');

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered.');
      } else {
        setError(err.message || 'Failed to register user.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl overflow-hidden max-w-5xl mx-auto border border-white/5 transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[150px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[120px] -ml-32 -mb-32 pointer-events-none" />

      {/* Premium Dark Header */}
      <div className="px-10 py-16 text-white relative border-b border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
        <div className="relative z-10 flex items-center gap-10">
          <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] shadow-2xl ring-1 ring-white/20 transform hover:rotate-12 transition-transform duration-500">
            <div className="text-5xl text-white">
              <FiUser />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 leading-none">Registry Console</span>
            </div>
            <h2 className="text-4xl italic font-black tracking-tighter uppercase leading-none">System <span className="text-blue-500 not-italic">Enrollment</span></h2>
            <p className="mt-4 text-slate-400 font-medium max-w-xl text-lg leading-relaxed">Map institutional identities to secure permission nodes within the DC-DMU cloud cluster.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-12 space-y-16">
        {/* Phase 01: Core Identity */}
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-[1.2rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-xl shadow-inner">
                <FiTarget />
              </div>
              <div>
                <h3 className="font-black text-white text-2xl tracking-tight leading-none">Identity Core</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Biographical Data Mapping</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-black/40 rounded-full border border-white/10 text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase">Phase 01</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">First Name <span className="text-blue-500">*</span></label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Ex: Abebe"
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-bold text-white shadow-xl hover:bg-white/[0.08]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Last Name <span className="text-blue-500">*</span></label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Ex: Kebede"
                className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-bold text-white shadow-xl hover:bg-white/[0.08]"
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Institutional Uplink (Email) <span className="text-blue-500">*</span></label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none text-xl">
                  <FiMail />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@institutional-relay.edu"
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-black text-white font-mono text-sm tracking-tight shadow-xl hover:bg-white/[0.08]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Phase 02: Permission Mapping */}
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 text-xl shadow-inner">
                <FiCpu />
              </div>
              <div>
                <h3 className="font-black text-white text-2xl tracking-tight leading-none">Logic Mapping</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Permission Node Assignment</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-black/40 rounded-full border border-white/10 text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase">Phase 02</div>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/5 space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block italic">Institutional Functional Domain</label>
              <div className="relative group/select">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 text-xl pointer-events-none group-focus-within/select:scale-110 transition-transform">
                  <FiCommand />
                </div>
                <select
                  value={mainRole}
                  onChange={(e) => setMainRole(e.target.value)}
                  required
                  className="w-full pl-16 pr-10 py-5 bg-black border border-white/10 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer font-black text-white text-lg tracking-tight hover:border-indigo-500/40"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\' opacity=\'0.3\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'3\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 2rem center', backgroundSize: '1.5rem' }}
                >
                  <option value="" disabled className="bg-slate-900 border-none">Select Primary Domain...</option>
                  <option value="academic_staff" className="bg-slate-900">Education & Academic Research</option>
                  <option value="managing_director" className="bg-slate-900">Executive / Directorate Office</option>
                  <option value="general_service" className="bg-slate-900">Functional & General Operations</option>
                  <option value="chief" className="bg-slate-900">Institutional High Command (Chief)</option>
                  <option value="procurement_management" className="bg-slate-900">Supply Chain / Logistics Cluster</option>
                  <option value="admin_staff" className="bg-slate-900">Departmental Administration</option>
                </select>
              </div>
            </div>

            {/* Dynamic Branching Logic with Advanced Motion */}
            <AnimatePresence mode="wait">
              {mainRole && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8 pt-8 border-t border-white/5"
                >
                  {/* Academic Branching */}
                  {mainRole === 'academic_staff' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2">Position Model</label>
                        <div className="flex bg-black p-1.5 rounded-2xl border border-white/5 gap-1.5">
                          {['academic_coordinator', 'department'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAcademicSelection(type)}
                              className={`flex-1 py-4 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${academicSelection === type
                                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                              {type === 'academic_coordinator' ? 'Coordinator' : 'Departmental'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {academicSelection === 'department' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2">Select Faculty Node</label>
                          <select
                            value={departmentSelection}
                            onChange={(e) => setDepartmentSelection(e.target.value)}
                            required
                            className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-black text-white tracking-tight"
                          >
                            <option value="">Choose Node...</option>
                            <option value="accounting_finance">Accounting and Finance</option>
                            <option value="agribusiness">Agribusiness and Value Chain Management</option>
                            <option value="animal_science">Animal Science</option>
                            <option value="computer_science">Computer Science</option>
                            <option value="economics">Economics</option>
                            <option value="general_forester">General Forester</option>
                            <option value="horticulture">Horticulture</option>
                            <option value="management">Management</option>
                            <option value="natural_resource_management">Natural Resource Management</option>
                            <option value="plant_science">Plant Science</option>
                            <option value="peace_development">Peace and Development</option>
                            <option value="veterinary_science">Veterinary Science</option>
                            <option value="common_course">Common Course</option>
                          </select>
                        </motion.div>
                      )}

                      {academicSelection === 'department' && departmentSelection && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 grid grid-cols-2 gap-6 bg-black/40 p-6 rounded-[2rem] border border-white/5">
                          {[
                            { id: 'head', label: 'Faculty Lead', desc: 'Authoritative oversight.' },
                            { id: 'teacher', label: 'Instructor', desc: 'Standard data relay.' }
                          ].map((role) => (
                            <label key={role.id} className={`group relative flex flex-col p-6 rounded-3xl border-2 cursor-pointer transition-all duration-500 ${deptRoleSelection === role.id ? 'border-blue-600 bg-blue-600/5 shadow-2xl shadow-blue-600/10' : 'border-white/5 hover:bg-white/5'}`}>
                              <input type="radio" className="absolute opacity-0" checked={deptRoleSelection === role.id} onChange={() => setDeptRoleSelection(role.id)} />
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${deptRoleSelection === role.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                                  {deptRoleSelection === role.id ? <FiCheckCircle /> : <FiLayers />}
                                </div>
                                <span className={`font-black text-sm uppercase tracking-tight ${deptRoleSelection === role.id ? 'text-blue-500' : 'text-slate-400'}`}>{role.label}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-bold leading-none">{role.desc}</span>
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Procurement Logic */}
                  {mainRole === 'procurement_management' && (
                    <div className="space-y-8">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2 leading-none">Supply Chain Vector</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'team_leader', label: 'Lead' },
                          { id: 'stock_clerk', label: 'Clerk' },
                          { id: 'store_keeper', label: 'Keeper' }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => setProcurementSelection(btn.id)}
                            className={`py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] italic border transition-all duration-500 ${procurementSelection === btn.id
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-2xl shadow-emerald-600/30 -translate-y-1'
                              : 'bg-black border-white/5 text-slate-500 hover:text-white hover:bg-white/5'
                              }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      {(procurementSelection === 'stock_clerk' || procurementSelection === 'store_keeper') && (
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 rounded-[2rem] bg-black border border-white/10 flex flex-col gap-6">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] leading-none mb-2 italic">Specialized Asset Domain</p>
                          <div className="grid grid-cols-2 gap-4">
                            {['fixed_assets', 'consumable_items'].map((type) => (
                              <button key={type} type="button" onClick={() => setStockStoreType(type)} className={`py-5 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all duration-500 ${stockStoreType === type ? 'border-emerald-600 bg-emerald-600/10 text-emerald-400 shadow-2xl shadow-emerald-600/10' : 'border-white/5 text-slate-500 hover:bg-white/5'}`}>
                                {type === 'fixed_assets' ? 'Infinite Assets' : 'Resource Tokens'}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Admin Brach */}
                  {mainRole === 'admin_staff' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2 leading-none italic">Admin Relay Cluster</label>
                        <div className="flex bg-black p-2 rounded-2xl border border-white/5 gap-2">
                          {[
                            { id: 'hrm', label: 'HRM Hub' },
                            { id: 'finance', label: 'Finance Hub' },
                            { id: 'student_service', label: 'Student Service' }
                          ].map((unit) => (
                            <button key={unit.id} type="button" onClick={() => setAdminSelection(unit.id)} className={`flex-1 py-4 font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-500 ${adminSelection === unit.id ? 'bg-purple-600 text-white shadow-2xl' : 'text-slate-500 hover:bg-white/5'}`}>
                              {unit.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {adminSelection === 'student_service' && (
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2 leading-none italic">Service Level</label>
                            <div className="flex bg-black p-2 rounded-2xl border border-white/5 gap-2">
                              {[
                                { id: 'overall', label: 'Overall Unit' },
                                { id: 'node', label: 'Sub-Service Node' }
                              ].map((lvl) => (
                                <button key={lvl.id} type="button" onClick={() => {
                                  setStudentServiceSelection(lvl.id === 'overall' ? 'overall' : '');
                                  setAdminRoleSelection(lvl.id === 'overall' ? 'leader' : '');
                                }} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all duration-500 ${studentServiceSelection === 'overall' && lvl.id === 'overall' ? 'bg-purple-600 text-white shadow-2xl' : (studentServiceSelection !== 'overall' && studentServiceSelection !== '' && lvl.id === 'node') ? 'bg-purple-600 text-white shadow-2xl' : 'text-slate-400 hover:bg-white/5'}`}>
                                  {lvl.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {studentServiceSelection !== 'overall' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2 leading-none italic">Select Service Node</label>
                              <div className="flex bg-black p-2 rounded-2xl border border-white/5 gap-2">
                                {[
                                  { id: 'dormitory', label: 'Dormitory' },
                                  { id: 'cafeteria', label: 'Cafeteria' },
                                  { id: 'sport', label: 'Sport' }
                                ].map((svc) => (
                                  <button key={svc.id} type="button" onClick={() => setStudentServiceSelection(svc.id)} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all duration-500 ${studentServiceSelection === svc.id ? 'bg-purple-600 text-white shadow-2xl' : 'text-slate-400 hover:bg-white/5'}`}>
                                    {svc.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          {studentServiceSelection && studentServiceSelection !== 'overall' && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2 leading-none italic">Security Hierarchy</label>
                              <div className="flex bg-black p-2 rounded-2xl border border-white/5 gap-2">
                                {[{ id: 'leader', label: 'Leader' }, { id: 'employee', label: 'Base staff' }].map((lvl) => (
                                  <button key={lvl.id} type="button" onClick={() => setAdminRoleSelection(lvl.id)} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all duration-500 ${adminRoleSelection === lvl.id ? 'bg-purple-600 text-white shadow-2xl shadow-purple-600/30' : 'text-slate-500 hover:bg-white/5'}`}>
                                    {lvl.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {(adminSelection === 'hrm' || adminSelection === 'finance') && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-2 leading-none italic">Security Hierarchy</label>
                          <div className="flex bg-black p-2 rounded-2xl border border-white/5 gap-2">
                            {[{ id: 'leader', label: 'Leader' }, { id: 'employee', label: 'Base staff' }].map((lvl) => (
                              <button key={lvl.id} type="button" onClick={() => setAdminRoleSelection(lvl.id)} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all duration-500 ${adminRoleSelection === lvl.id ? 'bg-purple-600 text-white shadow-2xl shadow-purple-600/30' : 'text-slate-500 hover:bg-white/5'}`}>
                                {lvl.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Role Signature Preview */}
            <div className={`mt-10 p-8 rounded-[2rem] border transition-all duration-1000 flex items-center justify-between group/sig ${currentRoleData ? 'bg-white text-black translate-y-0 shadow-[0_30px_60px_rgba(255,255,255,0.1)]' : 'bg-black border-white/5 text-slate-700 opacity-40'}`}>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 ${currentRoleData ? 'bg-black text-white shadow-2xl ring-4 ring-blue-500/20 rotate-6' : 'bg-white/5 text-slate-800'}`}>
                  <FiShield className="text-3xl" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.4em] mb-2 opacity-60 italic">Node Signature</p>
                  <p className="font-mono text-lg font-black tracking-tighter uppercase italic flex items-center gap-4">
                    {currentRoleData ? currentRoleData.userRole.replace(/_/g, ' • ') : 'AWAITING CONFIGURATION...'}
                    {currentRoleData && <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,1)]"></span>}
                  </p>
                </div>
              </div>
              {currentRoleData && (
                <div className="hidden sm:flex flex-col items-end gap-1 font-black text-[10px] uppercase tracking-widest italic opacity-40">
                  <p>Verified Module</p>
                  <p className="text-blue-600 font-black">S-772_READY</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phase 03: Security Protocol */}
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-[1.2rem] bg-slate-100/5 border border-white/10 flex items-center justify-center text-white text-xl shadow-inner">
                <FiLock />
              </div>
              <div>
                <h3 className="font-black text-white text-2xl tracking-tight leading-none">Access Protocol</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Infrastructure Key Generation</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-black/40 rounded-full border border-white/10 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Phase 03</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block leading-none">Secure Key Phrase</label>
              <div className="relative group/pass">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/pass:text-blue-500 transition-colors pointer-events-none text-xl">
                  <FiLock />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Cipher Key (Min 6 chars)"
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-black text-white font-mono text-sm leading-none shadow-xl hover:bg-white/[0.08]"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block leading-none">Verify Key Phrase</label>
              <div className="relative group/pass">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/pass:text-blue-500 transition-colors pointer-events-none text-xl">
                  <FiShield />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Match Cipher Exactly"
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-black text-white font-mono text-sm leading-none shadow-xl hover:bg-white/[0.08]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback & Final Trigger */}
        <div className="pt-16 border-t border-white/10 space-y-10">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-6 bg-rose-600/10 border border-rose-500/20 text-rose-500 p-8 rounded-3xl text-sm font-black italic tracking-tight shadow-[0_20px_40px_rgba(244,63,94,0.1)]">
                <FiAlertCircle className="text-3xl animate-pulse" />
                <div>
                  <p className="uppercase text-[10px] tracking-[0.3em] mb-1 leading-none">Access Alert</p>
                  <p className="text-lg leading-tight uppercase font-black italic font-mono">{error}</p>
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-6 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 p-8 rounded-3xl text-sm font-black italic tracking-tight shadow-[0_20px_40px_rgba(16,185,129,0.1)]">
                <FiCheckCircle className="text-3xl" />
                <div>
                  <p className="uppercase text-[10px] tracking-[0.3em] mb-1 leading-none">Registry Update</p>
                  <p className="text-lg leading-tight uppercase font-black italic font-mono">{success}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />

            <button
              type="submit"
              disabled={loading}
              className="w-full relative bg-white py-8 px-10 rounded-[2.25rem] text-black font-black text-2xl tracking-tighter italic uppercase shadow-2xl transition-all hover:scale-[1.02] hover:-translate-y-2 active:scale-[0.98] active:translate-y-0 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-700 pointer-events-none" />
              <span className="relative z-10 flex items-center justify-center gap-5 group-hover:text-white transition-colors duration-500">
                {loading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    Deploying Identity...
                  </>
                ) : (
                  <>
                    Initialize Core Identity
                    <FiChevronRight className="text-3xl group-hover:translate-x-3 transition-transform duration-500" />
                  </>
                )}
              </span>
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex items-center gap-6 w-full opacity-10">
              <div className="h-px flex-1 bg-white" />
              <FiShield className="text-sm" />
              <div className="h-px flex-1 bg-white" />
            </div>
            <p className="text-[9px] uppercase font-black tracking-[0.5em] text-slate-500 flex items-center gap-3">
              Institutional Proxy Enabled • End-to-End Encrypted Tunnel Active
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
