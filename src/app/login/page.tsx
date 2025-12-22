'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function checkRoleAndRedirect() {
      if (!loading && user) {
        try {
          // 1. Check Admins Collection First
          try {
            const adminsRef = collection(db, 'admins');
            const q = query(adminsRef, where('email', '==', user.email));
            const adminSnapshot = await getDocs(q);

            if (!adminSnapshot.empty) {
              const adminData = adminSnapshot.docs[0].data();
              if (adminData.role === 'admin') {
                router.push('/admin');
                return;
              }
            }
          } catch (adminErr) {
            console.error("Error checking admins collection:", adminErr);
          }

          // 2. Fetch user role from Firestore Users collection
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData.userRole;
            const stockType = userData.stockType;
            const storeType = userData.storeType;

            // Role-based redirection logic (Mirrors LoginPage.tsx)
            switch (userRole) {
              case 'managing_director_leader':
                router.push('/managing-director');
                break;
              case 'general_service_leader':
                router.push('/general-service');
                break;
              case 'chief':
                router.push('/chief');
                break;
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
              case 'procurement_team_leader':
                router.push('/procurement-management/team-leader');
                break;
              case 'hrm_leader':
              case 'finance_leader':
                router.push('/admin-staff/team-leader');
                break;
              case 'hrm_employee':
              case 'finance_employee':
                router.push('/admin-staff/employees');
                break;
              default:
                router.push('/');
                break;
            }
          } else {
            router.push('/');
          }
        } catch (error) {
          console.error("Error fetching user role for redirect:", error);
          // Fallback
          router.push('/');
        }
      }
    }

    checkRoleAndRedirect();
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show login page
  if (!user) {
    return <LoginPage />;
  }

  // Waiting for redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
