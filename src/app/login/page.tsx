'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getCleanUrlForRole } from '@/utils/routeConfig';

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function checkRoleAndRedirect() {
      if (!loading && user && db) {
        try {
          // Priority 1: Check standard user roles from 'users' collection (Registral functionality)
          const userDocRef = doc(db!, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Prefer userRole, fallback to mainRole if needed (though RegisterUser sets both)
            const userRole = userData.userRole || userData.mainRole;

            if (userRole) {
              // Use centralized route config for clean URLs
              const cleanUrl = getCleanUrlForRole(userRole);
              console.log(`Redirecting role "${userRole}" to ${cleanUrl}`);
              router.push(cleanUrl);
              return;
            }
          }

          // Priority 2: Check Admins Collection if not found in standard users
          const adminsRef = collection(db!, 'admins');
          const q = query(adminsRef, where('email', '==', user.email));
          const adminSnapshot = await getDocs(q);

          if (!adminSnapshot.empty) {
            const adminData = adminSnapshot.docs[0].data();
            if (adminData.role === 'admin') {
              router.push('/admin');
              return;
            }
          }

          // Fallback: Default to home
          router.push('/');
        } catch (error) {
          console.error("Critical error in role-based redirection:", error);
          router.push('/');
        }
      }
    }

    checkRoleAndRedirect();
  }, [user, loading, router]);

  // If user is not logged in, show login page
  if (!user) {
    return <LoginPage />;
  }

  // Show loading/redirecting state when user is authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
