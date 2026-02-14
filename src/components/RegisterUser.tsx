'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
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

const DEFAULT_ACADEMIC_DEPTS = [
  { id: 'accounting_finance', label: 'Accounting and Finance' },
  { id: 'agribusiness', label: 'Agribusiness' },
  { id: 'animal_science', label: 'Animal Science' },
  { id: 'computer_science', label: 'Computer Science' },
  { id: 'economics', label: 'Economics' },
  { id: 'general_forester', label: 'General Forester' },
  { id: 'horticulture', label: 'Horticulture' },
  { id: 'management', label: 'Management' },
  { id: 'natural_resource_management', label: 'Natural Resource' },
  { id: 'plant_science', label: 'Plant Science' },
  { id: 'peace_development', label: 'Peace and Dev' },
  { id: 'veterinary_science', label: 'Veterinary Science' },
  { id: 'common_course', label: 'Common Course' }
];

export default function RegisterUser({ onSuccess }: RegisterUserProps) {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mainRole, setMainRole] = useState('');

  // Dynamic sub-selection states
  const [academicSelection, setAcademicSelection] = useState('');
  const [departmentSelection, setDepartmentSelection] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [availableAcademicDepts, setAvailableAcademicDepts] = useState(DEFAULT_ACADEMIC_DEPTS);
  const [deptRoleSelection, setDeptRoleSelection] = useState('');

  const [procurementSelection, setProcurementSelection] = useState('');
  const [stockStoreType, setStockStoreType] = useState('');

  const [adminSelection, setAdminSelection] = useState('');
  const [customAdminDept, setCustomAdminDept] = useState('');
  const [availableAdminDepts, setAvailableAdminDepts] = useState<{ id: string, label: string }[]>([
    { id: 'hrm', label: 'HRM' },
    { id: 'finance', label: 'Finance' },
    { id: 'procurement_admin', label: 'Procurement Admin (ግዥ አስተዳደር)' },
    { id: 'resource_development', label: 'Resource Dev & Revenue (ሃብት ልማት)' },
    { id: 'building_renovation', label: 'Building Renovation (ህንጻ እድሳት)' },
    { id: 'general_service_admin', label: 'General Service' },
    { id: 'library_service', label: 'Library Service' },
    { id: 'security', label: 'Security' },
    { id: 'registrar', label: 'Registrar' },
    { id: 'student_service', label: 'Student Service' }
  ]);
  const [studentServiceSelection, setStudentServiceSelection] = useState('');
  const [adminRoleSelection, setAdminRoleSelection] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch Configurations (Admin & Academic)
  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        if (!db) return;

        // Fetch Admin Depts
        const adminDocRef = doc(db, 'settings', 'admin_configurations');
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          const data = adminDocSnap.data();
          if (data.departments && Array.isArray(data.departments)) {
            setAvailableAdminDepts(prev => {
              const newDepts = [...prev];
              data.departments.forEach((deptName: string) => {
                const id = deptName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                if (!newDepts.find(d => d.id === id)) {
                  newDepts.push({ id, label: deptName });
                }
              });
              return newDepts;
            });
          }
        }

        // Fetch Academic Depts
        const academicDocRef = doc(db, 'settings', 'academic_configurations');
        const academicDocSnap = await getDoc(academicDocRef);
        if (academicDocSnap.exists()) {
          const data = academicDocSnap.data();
          if (data.departments && Array.isArray(data.departments)) {
            setAvailableAcademicDepts(prev => {
              const newDepts = [...prev];
              data.departments.forEach((deptName: string) => {
                const id = deptName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                if (!newDepts.find(d => d.id === id)) {
                  newDepts.push({ id, label: deptName });
                }
              });
              return newDepts;
            });
          }
        }

      } catch (err) {
        console.error("Failed to fetch configurations", err);
      }
    };

    fetchConfigurations();
  }, []);

  // Reset sub-selections when main role changes
  useEffect(() => {
    setAcademicSelection('');
    setDepartmentSelection('');
    setCustomDepartment('');
    setDeptRoleSelection('');
    setProcurementSelection('');
    setStockStoreType('');
    setAdminSelection('');
    setCustomAdminDept('');
    setStudentServiceSelection('');
    setAdminRoleSelection('');
  }, [mainRole]);

  // Reset student service sub-selection when admin selection changes
  useEffect(() => {
    setStudentServiceSelection('');
    setCustomAdminDept('');
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
          let rolePrefix = departmentSelection;

          if (departmentSelection === 'other' && customDepartment) {
            // Convert custom department name to snake_case for the role
            rolePrefix = customDepartment
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_+|_+$/g, '');
          }

          if (rolePrefix) {
            // Ensure we use the proper label for the department field
            let deptLabel = departmentSelection;
            if (departmentSelection === 'other') deptLabel = customDepartment;
            else {
              const found = availableAcademicDepts.find(d => d.id === departmentSelection);
              if (found) deptLabel = found.label;
            }

            if (deptRoleSelection === 'head') {
              return {
                mainRole: 'academic_staff',
                userRole: `${rolePrefix}_head`,
                subRole: 'department_head',
                department: deptLabel
              };
            }
            if (deptRoleSelection === 'teacher') {
              return {
                mainRole: 'academic_staff',
                userRole: `${rolePrefix}_teacher`,
                subRole: 'instructor',
                department: deptLabel
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
        } else if (adminSelection === 'procurement_admin') {
          if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: 'procurement_admin_leader', subRole: 'procurement_admin_manager' };
          if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: 'procurement_admin_employee', subRole: 'procurement_admin_staff' };
        } else if (adminSelection === 'resource_development') {
          if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: 'resource_development_leader', subRole: 'resource_development_manager' };
          if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: 'resource_development_employee', subRole: 'resource_development_staff' };
        } else if (adminSelection === 'building_renovation') {
          if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: 'building_renovation_leader', subRole: 'building_renovation_manager' };
          if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: 'building_renovation_employee', subRole: 'building_renovation_staff' };
        } else if (adminSelection === 'general_service_admin') {
          if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: 'general_service_admin_leader', subRole: 'general_service_admin_manager' };
          if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: 'general_service_admin_employee', subRole: 'general_service_admin_staff' };
        } else if (adminSelection === 'library_service') {
          if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: 'library_service_leader', subRole: 'library_service_manager' };
          if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: 'library_service_employee', subRole: 'library_service_staff' };
        } else if (adminSelection === 'security') {
          if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: 'security_leader', subRole: 'security_manager' };
          if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: 'security_employee', subRole: 'security_staff' };
        } else if (adminSelection === 'registrar') {
          if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: 'registrar_leader', subRole: 'registrar_manager' };
          if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: 'registrar_employee', subRole: 'registrar_staff' };
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

    // Dynamic Logic for Admin Staff (Predefined or Custom)
    if (mainRole === 'admin_staff') {
      if (adminSelection === 'student_service' && studentServiceSelection && adminRoleSelection) {
        // Student service specific logic is already handled above in switch, but if it fell through or for clarity:
        // Actually, switch case 'admin_staff' handles specific predefined ones.
        // We need to verify if the switch case handled it.
        // The switch case returns early for known static IDs.
        // If we are here, it means it wasn't one of the static ones in the switch OR it matches our new logic.
        // BUT, getRoleData uses multiple return statements inside switch.
        // The issue is that `adminSelection` for dynamic depts will essentially match their ID.
        // We need to inject logic for "other" OR for dynamic IDs that are NOT in the switch.
      }

      // Handle "Other"
      if (adminSelection === 'other' && customAdminDept) {
        const normalizedDept = customAdminDept.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: `${normalizedDept}_leader`, subRole: `${normalizedDept}_manager`, department: customAdminDept };
        if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: `${normalizedDept}_employee`, subRole: `${normalizedDept}_staff`, department: customAdminDept };
      }

      // Handle Dynamic/Persisted Departments (that are not predefined in switch)
      // We can check if `adminSelection` is present in availableAdminDepts but NOT in the switch cases.
      // The switch cases cover: hrm, finance, procurement_admin, resource_development, building_renovation, general_service_admin, library_service, security, registrar, student_service.
      // Any other ID is a dynamic department.
      const isPredefined = ['hrm', 'finance', 'procurement_admin', 'resource_development', 'building_renovation', 'general_service_admin', 'library_service', 'security', 'registrar', 'student_service'].includes(adminSelection);

      if (!isPredefined && adminSelection && adminSelection !== 'other') {
        // It's a persisted dynamic department
        // adminSelection is the ID (snake_case)
        if (adminRoleSelection === 'leader') return { mainRole: 'admin_staff', userRole: `${adminSelection}_leader`, subRole: `${adminSelection}_manager` };
        if (adminRoleSelection === 'employee') return { mainRole: 'admin_staff', userRole: `${adminSelection}_employee`, subRole: `${adminSelection}_staff` };
      }
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
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          ...currentRoleData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to register user.');
      }

      // Persist custom admin department
      if (mainRole === 'admin_staff' && adminSelection === 'other' && customAdminDept && db) {
        try {
          const settingsRef = doc(db, 'settings', 'admin_configurations');
          const settingsSnap = await getDoc(settingsRef);
          if (!settingsSnap.exists()) {
            await setDoc(settingsRef, { departments: [customAdminDept] });
          } else {
            await updateDoc(settingsRef, { departments: arrayUnion(customAdminDept) });
          }
        } catch (settingsErr) {
          console.error("Failed to save new admin department setting", settingsErr);
        }
      }

      // Persist custom academic department
      if (mainRole === 'academic_staff' && academicSelection === 'department' && departmentSelection === 'other' && customDepartment && db) {
        try {
          const settingsRef = doc(db, 'settings', 'academic_configurations');
          const settingsSnap = await getDoc(settingsRef);
          if (!settingsSnap.exists()) {
            await setDoc(settingsRef, { departments: [customDepartment] });
          } else {
            await updateDoc(settingsRef, { departments: arrayUnion(customDepartment) });
          }
        } catch (settingsErr) {
          console.error("Failed to save new academic department setting", settingsErr);
        }
      }

      setSuccess(`User ${email} created successfully!`);

      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setMainRole('');
      setAcademicSelection('');
      setDepartmentSelection('');
      setCustomDepartment('');
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
      setError(err.message || 'Failed to register user.');
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{t('personnel_enrollment_tag')}</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('system_registration_header')}</h2>
            <p className="mt-1 text-slate-500 font-medium">{t('registration_desc')}</p>
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
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">{t('core_identity_header')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('first_name_label')}</label>
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
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('last_name_label')}</label>
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
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('email_address_label')}</label>
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
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">{t('role_selection_header')}</h3>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('functional_domain_label')}</label>
              <select
                value={mainRole}
                onChange={(e) => setMainRole(e.target.value)}
                required
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTQ0QjU1IiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4=')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
              >
                <option value="" disabled>Select Domain...</option>
                <option value="academic_staff">{t('edu_academic_research')}</option>
                <option value="managing_director">{t('exec_directorate_office')}</option>
                <option value="general_service">{t('func_general_ops')}</option>
                <option value="chief">{t('inst_high_command')}</option>
                <option value="procurement_management">{t('supply_chain_logistics')}</option>
                <option value="admin_staff">{t('inst_administration')}</option>
              </select>
            </div>

            <AnimatePresence mode="wait">
              {mainRole && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-slate-200/60 space-y-8">
                  {/* Academic Options */}
                  {mainRole === 'academic_staff' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{t('assignment_type')}</label>
                        <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1 shadow-sm">
                          {['academic_coordinator', 'department'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAcademicSelection(type)}
                              className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${academicSelection === type ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                              {type === 'academic_coordinator' ? t('coordinator_label') : t('dept_head_teacher_label')}
                            </button>
                          ))}
                        </div>
                      </div>

                      {academicSelection === 'department' && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{t('department')}</label>
                          <select value={departmentSelection} onChange={(e) => setDepartmentSelection(e.target.value)} required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs font-bold text-slate-900">
                            <option value="">Select Faculty...</option>
                            {availableAcademicDepts.map((dept) => (
                              <option key={dept.id} value={dept.id}>{dept.label}</option>
                            ))}
                            <option value="other">Other (Add New)</option>
                          </select>
                        </div>
                      )}

                      {academicSelection === 'department' && departmentSelection === 'other' && (
                        <div className="space-y-3 md:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{t('new_dept_name')}</label>
                          <input
                            type="text"
                            value={customDepartment}
                            onChange={(e) => setCustomDepartment(e.target.value)}
                            required
                            placeholder="e.g. Applied Physics"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs font-bold text-slate-900"
                          />
                        </div>
                      )}

                      {academicSelection === 'department' && departmentSelection && (
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                          {[
                            { id: 'head', label: t('department_head_label') },
                            { id: 'teacher', label: t('faculty_teacher') }
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

                  {/* Admin Options - Refactored to Dropdown */}
                  {mainRole === 'admin_staff' && (
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{t('admin_unit')}</label>
                        <select
                          value={adminSelection}
                          onChange={(e) => setAdminSelection(e.target.value)}
                          className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTQ0QjU1IiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4=')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                        >
                          <option value="" disabled>Select Unit...</option>
                          {availableAdminDepts.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.label}</option>
                          ))}
                          <option value="other">Other (Add New Team)</option>
                        </select>
                      </div>

                      {adminSelection === 'other' && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{t('new_admin_team')}</label>
                          <input
                            type="text"
                            value={customAdminDept}
                            onChange={(e) => setCustomAdminDept(e.target.value)}
                            required
                            placeholder="e.g. Quality Assurance"
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                          />
                        </div>
                      )}


                      {adminSelection === 'student_service' && (
                        <div className="grid grid-cols-2 gap-4">
                          <button type="button" onClick={() => { setStudentServiceSelection('overall'); setAdminRoleSelection('leader'); }} className={`p-4 rounded-xl border-2 transition-all text-center ${studentServiceSelection === 'overall' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-500'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest">{t('overall_leader')}</p>
                          </button>
                          <select
                            value={studentServiceSelection === 'overall' ? '' : studentServiceSelection}
                            onChange={(e) => setStudentServiceSelection(e.target.value)}
                            className={`px-4 py-4 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest bg-white text-slate-900 ${studentServiceSelection !== 'overall' && studentServiceSelection ? 'border-blue-600' : 'border-slate-200'}`}
                          >
                            <option value="">{t('select_subunit_placeholder')}</option>
                            <option value="dormitory">{t('dormitory_label')}</option>
                            <option value="cafeteria">{t('cafeteria_label')}</option>
                            <option value="sport">{t('sport_label')}</option>
                          </select>
                        </div>
                      )}

                      {((adminSelection && adminSelection !== 'student_service') || (adminSelection === 'student_service' && studentServiceSelection && studentServiceSelection !== 'overall')) && (
                        <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1 shadow-sm">
                          {['leader', 'employee'].map((role) => (
                            <button key={role} type="button" onClick={() => setAdminRoleSelection(role)} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${adminRoleSelection === role ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                              {role === 'leader' ? t('leader_account') : t('employee_account')}
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
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">{t('access_security_header')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('password')}</label>
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
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('confirm_password_label')}</label>
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
              <span>{t('complete_registration_btn')}</span>
              <FiChevronRight className="text-xl" />
            </div>
          )}
        </button>
      </form >
    </div >
  );
}
