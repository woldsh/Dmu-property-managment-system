'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, onSnapshot, getDoc, doc, query, where, getDocs } from 'firebase/firestore';
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

    const unsubscribe = onAuthStateChanged(auth as any, async (authUser) => {
      try {
        if (authUser) {
          let isVerified = false;
          let foundUserRole = null;
          let foundDept = null;
          let foundIsAdmin = false;

          try {
            // Priority 1: Check Admin Claims
            const idTokenResult = await authUser.getIdTokenResult(true);
            const adminClaim = idTokenResult.claims.admin === true || idTokenResult.claims.role === 'admin';

            if (adminClaim) {
              foundIsAdmin = true;
              isVerified = true;
            }

            // Priority 2: Check admins collection (UID or Email)
            if (db && !isVerified) {
              const adminDoc = await getDoc(doc(db, 'admins', authUser.uid));
              if (adminDoc.exists()) {
                foundIsAdmin = true;
                isVerified = true;
              } else {
                const adminsRef = collection(db, 'admins');
                const adminQuery = query(adminsRef, where('email', '==', authUser.email));
                const adminSnapshot = await getDocs(adminQuery);
                if (!adminSnapshot.empty) {
                  foundIsAdmin = true;
                  isVerified = true;
                }
              }
            }

            // Priority 3: Check users collection
            if (db && !isVerified) {
              const userDoc = await getDoc(doc(db, 'users', authUser.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();

                // CRITICAL STATUS CHECK
                if (userData.status === 'inactive') {
                  console.warn("AuthContext: User account is inactive. Revoking session.");
                  await signOut(auth as any);
                  setUser(null);
                  setIsAdmin(false);
                  setUserRole(null);
                  setDepartment(null);
                  setLoading(false);
                  return;
                }

                foundUserRole = userData.userRole || null;
                foundDept = userData.department || null;
                isVerified = true;
                foundIsAdmin = false;
              }
            }

            // FINAL DECISION
            if (isVerified) {
              setIsAdmin(foundIsAdmin);
              setUserRole(foundUserRole);
              setDepartment(foundDept);
              setUser(authUser); // Only set user state if verified
            } else {
              if (db) {
                console.warn("AuthContext: Access denied for unverified identity.");
                await signOut(auth as any);
                setUser(null);
                setIsAdmin(false);
                setUserRole(null);
                setDepartment(null);
              }
            }

          } catch (verifyError) {
            console.error("Error verifying user record:", verifyError);
            setUser(null);
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
      const userCredential = await signInWithEmailAndPassword(auth as any, email, password);
      const user = userCredential.user;

      // Real-time verification for restricted accounts
      if (db) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists() && userDoc.data()?.status === 'inactive') {
          await signOut(auth as any);
          throw new Error('Your account is deactivated. Please contact the administrator.');
        }

        let adminExists = false;
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          adminExists = true;
        } else {
          const adminsRef = collection(db, 'admins');
          const adminQuery = query(adminsRef, where('email', '==', email));
          const adminSnapshot = await getDocs(adminQuery);
          adminExists = !adminSnapshot.empty;
        }

        if (!userDoc.exists() && !adminExists) {
          await signOut(auth as any);
          throw new Error('Incorrect username/password or register first.');
        }
      }
    } catch (error: any) {
      if (error.message === 'Your account is deactivated. Please contact the administrator.') {
        throw error;
      }
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.message === 'Incorrect username/password or register first.') {
        throw new Error('Incorrect username/password or register first.');
      }
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
