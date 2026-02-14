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
  EyeOff,
  ArrowLeft
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
      // Redirection is handled by the parent component (src/app/login/page.tsx)
      // once AuthContext confirms the user is verified and active.
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Verification failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-white selection:bg-indigo-500/20">

      {/* Subtle Background Accents */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-indigo-50/60 blur-[120px]" />
        <div className="absolute -bottom-[150px] -left-[150px] w-[500px] h-[500px] rounded-full bg-blue-50/50 blur-[100px]" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Back to Home */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[460px]"
      >
        {/* Institutional Branding Above Card */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="group flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20 mb-5"
            >
              <Building2 className="text-white w-7 h-7" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-none mb-1.5">
                DMU <span className="text-indigo-600 font-medium">{t('loginSystemName')}</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold tracking-[0.3em] uppercase">{t('loginAuthorized')}</span>
            </div>
          </Link>
        </div>

        {/* Clean White Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 relative overflow-hidden">

          {/* Subtle accent at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

          <div className="relative z-10">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-1.5 flex items-center gap-2.5">
                {t('loginErrorTitle') ? 'Institutional Login' : 'Institutional Login'}
                <Fingerprint size={20} className="text-indigo-500" />
              </h3>
              <p className="text-slate-400 text-sm">
                Sign in to access the management portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-red-50 border border-red-100 text-red-800 flex items-center gap-3 p-4 rounded-xl"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-0.5">{t('loginErrorTitle')}</h4>
                      <p className="text-xs font-medium text-red-700">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('loginEmailPlaceholder')}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                      <LockKeyhole size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('loginPassPlaceholder')}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>{t('loginSubmit')} <ChevronRight size={16} /></>
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 px-1 text-[10px] font-semibold tracking-wider text-slate-300 uppercase">
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-indigo-400" /> Encrypted</span>
                <span className="flex items-center gap-1.5"><Globe2 size={12} className="text-blue-400" /> DMU Secure</span>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center space-y-5"
        >
          {/* Language Toggle */}
          <div className="inline-flex items-center rounded-lg p-0.5 bg-slate-100 border border-slate-200/50">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 rounded-md text-[11px] font-semibold transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
            >
              ENGLISH
            </button>
            <button
              onClick={() => setLanguage('am')}
              className={`px-4 py-1.5 rounded-md text-[11px] font-semibold transition-all ${language === 'am' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}
            >
              አማርኛ
            </button>
          </div>

          <p className="text-slate-400 text-xs">
            {t('loginForget')}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
