'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface RegisterUserProps {
  onSuccess?: () => void;
}

export default function RegisterUser({ onSuccess }: RegisterUserProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mainRole, setMainRole] = useState('');

  // Dynamic sub-selection states
  const [academicSelection, setAcademicSelection] = useState(''); // 'coordinator' | 'department'
  const [departmentSelection, setDepartmentSelection] = useState(''); // 'cs' | 'economics' | 'accounting'
  const [deptRoleSelection, setDeptRoleSelection] = useState(''); // 'head' | 'teacher'

  const [procurementSelection, setProcurementSelection] = useState(''); // 'leader' | 'clerk' | 'keeper'
  const [stockStoreType, setStockStoreType] = useState(''); // 'fixed_assets' | 'consumable_items'

  const [adminSelection, setAdminSelection] = useState(''); // 'hrm' | 'finance'
  const [adminRoleSelection, setAdminRoleSelection] = useState(''); // 'leader' | 'employee'

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
    let roleData = {
      mainRole: '',
      userRole: '',
      subRole: '',
      stockType: undefined as string | undefined,
      storeType: undefined as string | undefined,
    };

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
          // Department Logic
          if (departmentSelection === 'computer_science') {
            if (deptRoleSelection === 'head') return { mainRole: 'academic_staff', userRole: 'computer_science_head', subRole: 'department_head' };
            if (deptRoleSelection === 'teacher') return { mainRole: 'academic_staff', userRole: 'computer_science_teacher', subRole: 'instructor' };
          } else if (departmentSelection === 'economics') {
            if (deptRoleSelection === 'head') return { mainRole: 'academic_staff', userRole: 'economics_head', subRole: 'department_head' };
            if (deptRoleSelection === 'teacher') return { mainRole: 'academic_staff', userRole: 'economics_teacher', subRole: 'instructor' };
          } else if (departmentSelection === 'accounting') {
            if (deptRoleSelection === 'head') return { mainRole: 'academic_staff', userRole: 'accounting_head', subRole: 'department_head' };
            if (deptRoleSelection === 'teacher') return { mainRole: 'academic_staff', userRole: 'accounting_teacher', subRole: 'instructor' };
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
    return null; // Incomplete selection
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
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Update basic profile
      await updateProfile(newUser, {
        displayName: `${firstName} ${lastName}`
      });

      // Store extended user data in Firestore
      // Using setDoc with UID to link Auth and Firestore
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

      // Reset form
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
      // Handle "email-already-in-use" e.g.
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
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">User Registration & Role Selection</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Role Selection Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Role Selection</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Role <span className="text-red-500">*</span></label>
              <select
                value={mainRole}
                onChange={(e) => setMainRole(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Select Role</option>
                <option value="academic_staff">Academic Staff</option>
                <option value="managing_director">Managing Director</option>
                <option value="general_service">General Service</option>
                <option value="chief">Chief</option>
                <option value="procurement_management">Procurement Management</option>
                <option value="admin_staff">Admin Staff</option>
              </select>
            </div>

            {/* Dynamic Role Options */}

            {/* Academic Staff Logic */}
            {mainRole === 'academic_staff' && (
              <div className="pl-4 border-l-2 border-blue-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position Type</label>
                  <select
                    value={academicSelection}
                    onChange={(e) => setAcademicSelection(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="academic_coordinator">Academic Coordinator</option>
                    <option value="department">Department</option>
                  </select>
                </div>

                {academicSelection === 'department' && (
                  <div className="pl-4 border-l-2 border-blue-200 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        value={departmentSelection}
                        onChange={(e) => setDepartmentSelection(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select Department</option>
                        <option value="computer_science">Computer Science</option>
                        <option value="economics">Economics</option>
                        <option value="accounting">Accounting</option>
                      </select>
                    </div>
                    {departmentSelection && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={deptRoleSelection}
                          onChange={(e) => setDeptRoleSelection(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select Role</option>
                          <option value="head">Head</option>
                          <option value="teacher">Teacher</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Procurement Management Logic */}
            {mainRole === 'procurement_management' && (
              <div className="pl-4 border-l-2 border-blue-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={procurementSelection}
                    onChange={(e) => setProcurementSelection(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select Position</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="stock_clerk">Stock Clerk</option>
                    <option value="store_keeper">Store Keeper</option>
                  </select>
                </div>

                {(procurementSelection === 'stock_clerk' || procurementSelection === 'store_keeper') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={stockStoreType}
                      onChange={(e) => setStockStoreType(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select Type</option>
                      <option value="fixed_assets">Fixed Assets</option>
                      <option value="consumable_items">Consumable Items</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Admin Staff Logic */}
            {mainRole === 'admin_staff' && (
              <div className="pl-4 border-l-2 border-blue-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={adminSelection}
                    onChange={(e) => setAdminSelection(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select Department</option>
                    <option value="hrm">HRM</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>

                {adminSelection && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={adminRoleSelection}
                      onChange={(e) => setAdminRoleSelection(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select Role</option>
                      <option value="leader">Leader</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Preview Selected Role (Optional for verification) */}
            {currentRoleData && (
              <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                Generated Role: <span className="font-mono text-blue-600">{currentRoleData.userRole}</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Make it strong"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Repeat password"
              />
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? 'Creating Account and Assigning Permissions...' : 'Register User'}
        </button>
      </form>
    </div>
  );
}
