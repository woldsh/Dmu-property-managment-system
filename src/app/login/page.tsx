'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import { getCleanUrlForRole } from '@/utils/routeConfig';

export default function Login() {
  const { user, loading, userRole, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if authentication loading is finished and user exists
    if (!loading && user) {
      if (userRole) {
        // Priority 1: User Roles
        const cleanUrl = getCleanUrlForRole(userRole);
        router.push(cleanUrl);
      } else if (isAdmin) {
        // Priority 2: Admin
        router.push('/admin');
      } else {
        // Fallback
        router.push('/');
      }
    }
  }, [user, loading, userRole, isAdmin, router]);

  // If still loading auth state, show a clean loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show login page
  if (!user) {
    return <LoginPage />;
  }

  // Show redirecting state when user is authenticated but redirect hasn't happened yet
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Signing in...</p>
      </div>
    </div>
  );
}
