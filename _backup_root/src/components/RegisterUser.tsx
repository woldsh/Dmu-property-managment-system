'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {
  FiUser,
  FiMail,
  FiLock,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiShield,
  FiLayers
} from 'react-icons/fi';

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
    setAdminRoleSelection('');
  }, [mainRole]);

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
            computer_science: 'computer_science',
            agribusiness: 'agribusiness',
            accounting_finance: 'accounting_finance',
            animal_science: 'animal_science',
            economics: 'economics',
            general_forestry: 'general_forestry',
            horticulture: 'horticulture',
            management: 'management',
            natural_resource_management: 'natural_resource_management',
            peace_development: 'peace_development',
            plant_science: 'plant_science',
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
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
      {/* Premium Header */}
      <div className="bg-slate-900 px-8 py-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg ring-4 ring-white/10">
            <div className="text-4xl text-white">
              <FiUser />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">System Enrollment</h2>
            <p className="mt-2 text-slate-400 font-medium max-w-md">Provision new administrative or academic accounts with granular permission mapping.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-12 bg-white">
        {/* Identity Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <FiUser />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Identity Profile</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Phase 01</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-tighter ml-1">Legal First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Ex: John"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-tighter ml-1">Legal Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Ex: Smith"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-tighter ml-1">Institutional Email</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <FiMail />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@institution.edu"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FiLayers />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Organizational Mapping</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Phase 02</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-inner space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-tighter ml-1">Functional Domain</label>
              <select
                value={mainRole}
                onChange={(e) => setMainRole(e.target.value)}
                required
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer shadow-sm font-semibold text-slate-700"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
              >
                <option value="">Select Organizational Domain...</option>
                <option value="academic_staff">Educational & Academic Staff</option>
                <option value="managing_director">Directorate / Executive Office</option>
                <option value="general_service">Operational / General Services</option>
                <option value="chief">Institutional Leadership (Chief)</option>
                <option value="procurement_management">Supply Chain & Procurement</option>
                <option value="admin_staff">Institutional Administration</option>
              </select>
            </div>

            {/* Dynamic Branching Logic */}
            {mainRole === 'academic_staff' && (
              <div className="space-y-6 pt-4 border-t border-slate-200 animate-in slide-in-from-top duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Position Type</label>
                    <div className="flex gap-2">
                      {['academic_coordinator', 'department'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAcademicSelection(type)}
                          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${academicSelection === type
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                          {type === 'academic_coordinator' ? 'Coordinator' : 'Department'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {academicSelection === 'department' && (
                    <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                      <label className="text-xs font-bold text-slate-600">Faculty/Department</label>
                      <select
                        value={departmentSelection}
                        onChange={(e) => setDepartmentSelection(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium"
                      >
                        <option value="">Choose Department...</option>
                        <option value="computer_science">Computer Science</option>
                        <option value="agribusiness">Agribusiness & Value Chain Management</option>
                        <option value="accounting_finance">Accounting and Finance</option>
                        <option value="animal_science">Animal Science</option>
                        <option value="economics">Economics</option>
                        <option value="general_forestry">General Forestry</option>
                        <option value="horticulture">Horticulture</option>
                        <option value="management">Management</option>
                        <option value="natural_resource_management">Natural Resource Management</option>
                        <option value="peace_development">Peace and Development</option>
                        <option value="plant_science">Plant Science</option>
                        <option value="veterinary_science">Veterinary Science</option>
                        <option value="common_course">Common Course Department</option>
                      </select>
                    </div>
                  )}
                </div>

                {academicSelection === 'department' && departmentSelection && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-in slide-in-from-bottom duration-300 shadow-sm">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-4">Select Staff Designation</label>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { id: 'head', label: 'Department Head', desc: 'Full administrative control over faculty tasks.' },
                        { id: 'teacher', label: 'Academic Lecturer', desc: 'Standard instruction and course management.' }
                      ].map((role) => (
                        <label
                          key={role.id}
                          className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all group ${deptRoleSelection === role.id
                            ? 'border-blue-500 bg-blue-50/50'
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          <input
                            type="radio"
                            name="deptRole"
                            className="absolute opacity-0"
                            checked={deptRoleSelection === role.id}
                            onChange={() => setDeptRoleSelection(role.id)}
                          />
                          <span className={`font-bold text-sm mb-1 ${deptRoleSelection === role.id ? 'text-blue-700' : 'text-slate-700'}`}>{role.label}</span>
                          <span className="text-[10px] text-slate-500 leading-tight">{role.desc}</span>
                          {deptRoleSelection === role.id && (
                            <span className="absolute top-4 right-4 text-blue-500 text-lg">
                              <FiCheckCircle />
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Procurement / Supply Chain Branch */}
            {mainRole === 'procurement_management' && (
              <div className="space-y-6 pt-4 border-t border-slate-200 animate-in slide-in-from-top duration-500">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-600 uppercase">Operational Role</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'team_leader', label: 'Lead' },
                      { id: 'stock_clerk', label: 'Clerk' },
                      { id: 'store_keeper', label: 'Keeper' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setProcurementSelection(btn.id)}
                        className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${procurementSelection === btn.id
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
                          }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(procurementSelection === 'stock_clerk' || procurementSelection === 'store_keeper') && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-in fade-in duration-500">
                    <label className="text-xs font-bold text-slate-500 block mb-4">Inventory Specialization</label>
                    <div className="flex gap-4">
                      {['fixed_assets', 'consumable_items'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setStockStoreType(type)}
                          className={`flex-1 py-4 px-6 rounded-2xl text-sm font-extrabold border-2 transition-all ${stockStoreType === type
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                          {type === 'fixed_assets' ? 'Fixed Asset Mgmt' : 'Consumable Resource'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Staff Branch */}
            {mainRole === 'admin_staff' && (
              <div className="space-y-6 pt-4 border-t border-slate-200 animate-in slide-in-from-top duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Administrative Unit</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'hrm', label: 'HRM' },
                        { id: 'finance', label: 'Finance' }
                      ].map((unit) => (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => setAdminSelection(unit.id)}
                          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${adminSelection === unit.id
                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600'
                            }`}
                        >
                          {unit.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {adminSelection && (
                    <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                      <label className="text-xs font-bold text-slate-600">Position Level</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'leader', label: 'Leader' },
                          { id: 'employee', label: 'Employee' }
                        ].map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => setAdminRoleSelection(level.id)}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${adminRoleSelection === level.id
                              ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600'
                              }`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={`mt-8 p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between ${currentRoleData ? 'bg-slate-900 border-slate-800 text-white translate-y-0' : 'bg-slate-100 border-slate-200 text-slate-400 opacity-50'
              }`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${currentRoleData ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 rotate-3' : 'bg-slate-300 text-white'}`}>
                  <span className="text-2xl">
                    <FiShield />
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-1 opacity-50">Provisioning Signature</p>
                  <p className="font-mono text-xs font-bold flex items-center gap-2">
                    {currentRoleData ? currentRoleData.userRole : 'AWAITING CONFIGURATION'}
                    {currentRoleData && <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2"></span>}
                  </p>
                </div>
              </div>
              {currentRoleData && (
                <span className="text-emerald-400 text-2xl animate-in zoom-in spin-in-90 duration-500">
                  <FiCheckCircle />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Credentials Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm">
                <FiLock />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Infrastructure Access</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Phase 03</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-tighter ml-1">Secure Passphrase</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <FiLock />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium font-mono text-sm leading-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-tighter ml-1">Verify Passphrase</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <FiShield />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Must match exactly"
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium font-mono text-sm leading-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback & Final Trigger */}
        <div className="pt-10 border-t border-slate-100 space-y-6">
          {error && (
            <div className="flex items-center gap-4 bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl text-sm animate-in slide-in-from-top-4 font-medium shadow-sm">
              <span className="flex-shrink-0 text-xl">
                <FiAlertCircle />
              </span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 text-emerald-700 p-5 rounded-2xl text-sm animate-in slide-in-from-top-4 font-medium shadow-sm">
              <span className="flex-shrink-0 text-xl">
                <FiCheckCircle />
              </span>
              <span>{success}</span>
            </div>
          )}

          <div className="relative group">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 py-6 px-10 rounded-2xl text-white font-black text-xl tracking-tight shadow-2xl transition-all hover:bg-slate-800 hover:scale-[1.01] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 disabled:bg-slate-300 disabled:cursor-not-allowed group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
            >
              <span className="flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    Executing Deployment...
                  </>
                ) : (
                  <>
                    Generate Identity
                    <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">
                      <FiChevronRight />
                    </span>
                  </>
                )}
              </span>
            </button>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
          </div>

          <div className="flex items-center justify-center gap-6 opacity-40">
            <div className="h-[1px] flex-1 bg-slate-300"></div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 flex items-center gap-2">
              <FiShield /> End-to-End Encrypted Enrollment
            </p>
            <div className="h-[1px] flex-1 bg-slate-300"></div>
          </div>
        </div>
      </form>

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: fade-in 0.5s ease-out forwards; }
        .slide-in-from-top { animation: slide-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
