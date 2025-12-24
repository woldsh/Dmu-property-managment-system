'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  userRole: string | null;
  department: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      console.warn("AuthContext: Firebase auth is not initialized. Skipping onAuthStateChanged.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth as any, async (user) => {
      try {
        if (user) {
          setUser(user);
          try {
            // Get ID token to check custom claims
            // Using forceRefresh true to ensure latest claims
            const idTokenResult = await user.getIdTokenResult(true);
            setIsAdmin(idTokenResult.claims.admin === true || idTokenResult.claims.role === 'admin');
          } catch (tokenError) {
            console.error("Error fetching ID token:", tokenError);
            // Don't block the app - allow user access but maybe not admin
            setIsAdmin(false);
          }

          // Fetch explicit user role and department from Firestore
          try {
            if (db) {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserRole(userData.userRole || null);
                setDepartment(userData.department || null);
              }
            }
          } catch (docError) {
            console.error("Error fetching user document:", docError);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
          setUserRole(null);
          setDepartment(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Authentication is currently unavailable. Please check your system configuration.');
    }
    try {
      await signInWithEmailAndPassword(auth as any, email, password);
      // Navigation will be handled by the component using this function
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    if (!auth) {
      router.push('/login');
      return;
    }
    try {
      await signOut(auth as any);
      router.push('/login');
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, userRole, department }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
