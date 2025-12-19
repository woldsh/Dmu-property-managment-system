'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // Get the current user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user found after login');
      }

      // Check Admins Collection First (Special Case)
      // We query by email because the admin document might have been created manually without matching Auth UID
      try {
        const adminsRef = collection(db, 'admins');
        const q = query(adminsRef, where('email', '==', email));
        const adminSnapshot = await getDocs(q);

        if (!adminSnapshot.empty) {
          // User is in admins collection
          const adminData = adminSnapshot.docs[0].data();
          if (adminData.role === 'admin') {
            router.push('/admin');
            return;
          }
        }
      } catch (adminErr) {
        console.error("Error checking admins collection:", adminErr);
        // Continue to check normal users if this fails
      }

      // Fetch user role from Firestore Users collection (Standard Flow)
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.userRole;
        const stockType = userData.stockType;
        const storeType = userData.storeType;

        // Role-based redirection logic
        switch (userRole) {
          // Managing Director
          case 'managing_director_leader':
            router.push('/managing-director');
            break;

          // General Service
          case 'general_service_leader':
            router.push('/general-service');
            break;

          // Chief
          case 'chief':
            router.push('/chief');
            break;

          // Academic Staff
          case 'academic_coordinator':
            router.push('/academic-staff/academic-coordinator');
            break;
          case 'computer_science_head':
          case 'economics_head':
          case 'accounting_head':
            router.push('/academic-staff/department-head');
            break;
          case 'computer_science_teacher':
          case 'economics_teacher':
          case 'accounting_teacher':
            router.push('/academic-staff/teachers');
            break;

          // Procurement Management - Stock Clerk
          case 'fixed_asset_stock_clerk':
          case 'consumable_item_stock_clerk':
            if (stockType === 'fixed_assets') {
              router.push('/procurement-management/stock-clerk/fixed-material');
            } else if (stockType === 'consumable_items') {
              router.push('/procurement-management/stock-clerk/consumable-material');
            } else {
              router.push('/procurement-management/stock-clerk');
            }
            break;

          // Procurement Management - Store Keeper
          case 'fixed_asset_store_keeper':
          case 'consumable_item_store_keeper':
            if (storeType === 'fixed_assets') {
              router.push('/procurement-management/store/fixed-material');
            } else if (storeType === 'consumable_items') {
              router.push('/procurement-management/store/consumable-material');
            } else {
              router.push('/procurement-management/store');
            }
            break;

          // Procurement Management - Team Leader
          case 'procurement_team_leader':
            router.push('/procurement-management/team-leader');
            break;

          // Admin Staff
          case 'hrm_leader':
          case 'finance_leader':
            router.push('/admin-staff/team-leader');
            break;
          case 'hrm_employee':
          case 'finance_employee':
            router.push('/admin-staff/employees');
            break;

          // Default fallback
          default:
            router.push('/');
            break;
        }
      } else {
        // If not in users, and we already checked admins (and didn't match), fallback
        // But double check if it was an admin without 'role' field or something?
        // Assuming strictly followed logic above.
        router.push('/');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Property Management
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
