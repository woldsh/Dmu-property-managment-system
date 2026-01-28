'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { getCleanUrlForRole } from '../utils/routeConfig';
import {
  Mail,
  Lock,
  LogIn,
  ShieldAlert,
  Loader2,
  Building2,
  Fingerprint,
  LockKeyhole,
  ChevronRight,
  ShieldCheck,
  Globe2,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';

import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage() {
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!db) throw new Error("Firebase not initialized");
      // Login user
      await login(email, password);

      // Wait a moment for auth state to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      const currentUser = auth?.currentUser;
      if (!currentUser || !db) {
        throw new Error('Authentication failed or system not initialized. Please try again.');
      }

      // Check if user is an admin
      try {
        if (!db) return; // Added null check for db
        const adminsRef = collection(db!, 'admins');
        const q = query(adminsRef, where('email', '==', email));
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

      // Get user role from Firestore
      if (!db || !currentUser) { // Added null checks for db and currentUser
        throw new Error('Database or current user not available for role lookup.');
      }
      const userDocRef = doc(db!, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.userRole;

        // Get clean URL for user's role and redirect
        const cleanUrl = getCleanUrlForRole(userRole);
        router.push(cleanUrl);
      } else {
        // User document doesn't exist, redirect to home
        router.push('/');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Verification failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-[#020205] selection:bg-indigo-500/30">

      {/* Mesh Gradients - Consistent with Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse decoration-3000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[480px]"
      >
        {/* Institutional Branding Above Card */}
        <div className="flex flex-col items-center mb-12">
          <Link href="/" className="group flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
              <Building2 className="text-black w-8 h-8 relative z-10" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none mb-2">
                DMU <span className="text-indigo-500 font-normal">{t('loginSystemName')}</span>
              </h2>
              <span className="text-[9px] text-slate-500 font-black tracking-[0.4em] uppercase">{t('loginAuthorized')}</span>
            </div>
          </Link>
        </div>

        {/* Ultra-Premium Glass Card */}
        <div className="backdrop-blur-[40px] bg-white/[0.03] border border-white/[0.08] rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] p-8 md:p-12 relative overflow-hidden group">

          {/* Internal Glow Effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />

          <div className="relative z-10">
            <div className="mb-10 text-center md:text-left">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 flex items-center gap-3 justify-center md:justify-start italic">
                Institutional Login <Fingerprint size={24} className="text-indigo-500 not-italic" />
              </h3>
              <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
                Enterprise Resource Access Management
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-100 flex items-center gap-4 p-4 rounded-2xl overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-0.5">{t('loginErrorTitle')}</h4>
                      <p className="text-xs font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('loginEmailPlaceholder')}
                    required
                    className="w-full bg-white/[0.04] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-slate-700 placeholder:font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all duration-500 font-bold uppercase tracking-widest"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <LockKeyhole size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('loginPassPlaceholder')}
                    required
                    className="w-full bg-white/[0.04] border border-white/5 rounded-2xl py-5 pl-14 pr-14 text-sm text-white placeholder:text-slate-700 placeholder:font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all duration-500 font-bold uppercase tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative h-16 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] italic text-xs overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>{t('loginSubmit')} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="absolute inset-0 flex items-center justify-center gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <>{t('loginSubmit')} <ChevronRight size={18} /></>}
                  </span>
                </button>
              </div>

              <div className="flex justify-between items-center pt-6 px-2 text-[9px] font-black tracking-widest text-slate-600 uppercase">
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-indigo-500/50" /> RSA-4096 BIT</span>
                <span className="flex items-center gap-1.5"><Globe2 size={12} className="text-blue-500/50" /> DMU SECURE</span>
              </div>
            </form>
          </div>
        </div>

        {/* Support Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center space-y-6"
        >
          {/* Language Toggle */}
          <div className="inline-flex items-center bg-white/5 rounded-full p-1 border border-white/10 mx-auto">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
            >
              ENGLISH
            </button>
            <button
              onClick={() => setLanguage('am')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${language === 'am' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              አማርኛ
            </button>
          </div>

          <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase">
            {t('loginForget')}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
