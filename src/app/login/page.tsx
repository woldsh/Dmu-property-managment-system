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

            // Use centralized route config for clean URLs
            const cleanUrl = getCleanUrlForRole(userRole);
            router.push(cleanUrl);
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
