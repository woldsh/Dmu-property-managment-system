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
      if (!auth) throw new Error("Firebase auth not initialized");
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
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
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        uid: newUser.uid
      };

      if (!db) throw new Error("Firebase not initialized");
      await setDoc(doc(db!, 'users', newUser.uid), userDocData);

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
    <div className="bg-white rounded-[2.5rem] overflow-hidden max-w-5xl mx-auto relative">
      {/* Header - Simple & Clean */}
      <div className="px-10 py-12 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl text-white shadow-sm">
            <FiUser />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 mb-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Personnel Enrollment</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Registration</h2>
            <p className="mt-1 text-slate-500 font-medium">Create new user accounts and assign specific institutional roles.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-12">
        {/* Step 1: Identity */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <FiTarget />
            </div>
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Core Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="e.g. Abebe"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="e.g. Kebede"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-900"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="user@institution.edu"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Role Assignment */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <FiCommand />
            </div>
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Role Selection</h3>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Functional Domain</label>
              <select
                value={mainRole}
                onChange={(e) => setMainRole(e.target.value)}
                required
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTQ0QjU1IiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4=')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
              >
                <option value="" disabled>Select Domain...</option>
                <option value="academic_staff">Education & Academic Research</option>
                <option value="managing_director">Executive / Directorate Office</option>
                <option value="general_service">Functional & General Operations</option>
                <option value="chief">Institutional High Command</option>
                <option value="procurement_management">Supply Chain & Logistics</option>
                <option value="admin_staff">Institutional Administration</option>
              </select>
            </div>

            <AnimatePresence mode="wait">
              {mainRole && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-slate-200/60 space-y-8">
                  {/* Academic Options */}
                  {mainRole === 'academic_staff' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Assignment Type</label>
                        <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1 shadow-sm">
                          {['academic_coordinator', 'department'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAcademicSelection(type)}
                              className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${academicSelection === type ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                              {type === 'academic_coordinator' ? 'Coordinator' : 'Dept Head/Teacher'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {academicSelection === 'department' && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Department</label>
                          <select value={departmentSelection} onChange={(e) => setDepartmentSelection(e.target.value)} required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs font-bold text-slate-900">
                            <option value="">Select Faculty...</option>
                            <option value="accounting_finance">Accounting and Finance</option>
                            <option value="agribusiness">Agribusiness</option>
                            <option value="animal_science">Animal Science</option>
                            <option value="computer_science">Computer Science</option>
                            <option value="economics">Economics</option>
                            <option value="general_forester">General Forester</option>
                            <option value="horticulture">Horticulture</option>
                            <option value="management">Management</option>
                            <option value="natural_resource_management">Natural Resource</option>
                            <option value="plant_science">Plant Science</option>
                            <option value="peace_development">Peace and Dev</option>
                            <option value="veterinary_science">Veterinary Science</option>
                            <option value="common_course">Common Course</option>
                          </select>
                        </div>
                      )}

                      {academicSelection === 'department' && departmentSelection && (
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                          {[
                            { id: 'head', label: 'Department Head' },
                            { id: 'teacher', label: 'Faculty Teacher' }
                          ].map((role) => (
                            <button key={role.id} type="button" onClick={() => setDeptRoleSelection(role.id)} className={`p-4 rounded-2xl border-2 transition-all text-left ${deptRoleSelection === role.id ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                              <p className="text-xs font-black uppercase tracking-widest">{role.label}</p>
                              <p className={`text-[10px] mt-1 ${deptRoleSelection === role.id ? 'text-slate-400' : 'text-slate-400'}`}>{role.id === 'head' ? 'Managerial access' : 'Request-only access'}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Procurement Options */}
                  {mainRole === 'procurement_management' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-3">
                        {['team_leader', 'stock_clerk', 'store_keeper'].map((role) => (
                          <button key={role} type="button" onClick={() => setProcurementSelection(role)} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${procurementSelection === role ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500'}`}>
                            {role.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                      {(procurementSelection === 'stock_clerk' || procurementSelection === 'store_keeper') && (
                        <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1 shadow-sm">
                          {['fixed_assets', 'consumable_items'].map((type) => (
                            <button key={type} type="button" onClick={() => setStockStoreType(type)} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${stockStoreType === type ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                              {type.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin Options */}
                  {mainRole === 'admin_staff' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-3 gap-3">
                        {['hrm', 'finance', 'student_service'].map((unit) => (
                          <button key={unit} type="button" onClick={() => setAdminSelection(unit)} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adminSelection === unit ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500'}`}>
                            {unit.replace('_', ' ')}
                          </button>
                        ))}
                      </div>

                      {adminSelection === 'student_service' && (
                        <div className="grid grid-cols-2 gap-4">
                          <button type="button" onClick={() => { setStudentServiceSelection('overall'); setAdminRoleSelection('leader'); }} className={`p-4 rounded-xl border-2 transition-all text-center ${studentServiceSelection === 'overall' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-500'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest">Overall Leader</p>
                          </button>
                          <select value={studentServiceSelection === 'overall' ? '' : studentServiceSelection} onChange={(e) => setStudentServiceSelection(e.target.value)} className={`px-4 py-4 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${studentServiceSelection !== 'overall' && studentServiceSelection ? 'border-blue-600' : 'border-slate-200'}`}>
                            <option value="">Select Sub-Unit...</option>
                            <option value="dormitory">Dormitory</option>
                            <option value="cafeteria">Cafeteria</option>
                            <option value="sport">Sport</option>
                          </select>
                        </div>
                      )}

                      {((adminSelection && adminSelection !== 'student_service') || (adminSelection === 'student_service' && studentServiceSelection && studentServiceSelection !== 'overall')) && (
                        <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1 shadow-sm">
                          {['leader', 'employee'].map((role) => (
                            <button key={role} type="button" onClick={() => setAdminRoleSelection(role)} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${adminRoleSelection === role ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                              {role} Account
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selection Signature */}
            <div className={`mt-8 p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between ${currentRoleData ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-300'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${currentRoleData ? 'bg-white/10 text-white' : 'bg-slate-200'}`}>
                  <FiShield />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-widest mb-1 opacity-60">Generated Logic Key</p>
                  <p className="font-mono text-xs font-bold tracking-tight">
                    {currentRoleData ? currentRoleData.userRole.toUpperCase() : 'AWAITING SELECTION...'}
                  </p>
                </div>
              </div>
              {currentRoleData && <FiCheckCircle className="text-emerald-400 text-xl" />}
            </div>
          </div>
        </div>

        {/* Step 3: Security */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <FiLock />
            </div>
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Access Security</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-4 text-xs font-bold uppercase tracking-tight">
              <FiAlertCircle className="text-lg flex-shrink-0" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-4 text-xs font-bold uppercase tracking-tight">
              <FiCheckCircle className="text-lg flex-shrink-0" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 disabled:bg-slate-400 disabled:shadow-none disabled:translate-y-0"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Initializing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span>Complete Registration</span>
              <FiChevronRight className="text-xl" />
            </div>
          )}
        </button>
      </form>
    </div>
  );
}
