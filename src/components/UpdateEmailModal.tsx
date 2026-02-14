'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { FiX, FiMail, FiCheck, FiAlertCircle, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';

interface UpdateEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UpdateEmailModal({ isOpen, onClose }: UpdateEmailModalProps) {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleClose = () => {
        setEmail('');
        setPassword('');
        setError('');
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!email.trim() || !password) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        try {
            const user = auth?.currentUser;
            if (!user || !user.email) {
                setError('No authenticated user found. Please log in again.');
                return;
            }

            // 1. Re-authenticate to verify the password (Security First)
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            // 2. Get a fresh ID Token
            const idToken = await user.getIdToken(true);

            // 3. Call server-side API to forcefuly update email without verification flow
            // This requires Service Account Key on the server
            const response = await fetch('/api/auth/update-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken, newEmail: email }),
            });

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', responseText);
                throw new Error(`Server Error (${response.status}): ${responseText.substring(0, 100)}...`);
            }

            if (!response.ok) {
                // Handle specific error for missing service account
                if (response.status === 500 && (result.error?.includes('Service Account') || result.error?.includes('credential'))) {
                    throw new Error('Immediate update requires server configuration. Please add "serviceAccountKey.json" to your project root.');
                }
                throw new Error(result.error || 'Failed to update email');
            }

            setSuccess(true);
            setTimeout(async () => {
                handleClose();
                // Sign out so user must log in with new email
                if (auth) {
                    await signOut(auth as any);
                }
                // Redirect to login
                window.location.href = '/login';
            }, 1500);

        } catch (err: any) {
            console.error("Update email error:", err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Incorrect password. Please verify your current password.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email is already in use by another account.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address.');
            } else if (err.code === 'auth/requires-recent-login' || err.code === 'auth/user-token-expired') {
                setError('Session expired. Please log out and log in again.');
            } else {
                setError(err.message || 'Failed to update email.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center p-4"
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                    >
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <FiMail className="text-blue-600 text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{t('update_email_header')}</h3>
                                    <p className="text-xs text-slate-400">{t('change_email_address')}</p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                                <FiX size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <AnimatePresence>
                                {success && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                        <FiCheck className="text-emerald-600 min-w-[20px]" />
                                        <p className="text-sm font-medium text-emerald-700">
                                            {t('email_updated_success_redirect')}
                                        </p>
                                    </motion.div>
                                )}
                                {error && !success && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                                        <FiAlertCircle className="text-red-600 min-w-[20px]" />
                                        <p className="text-sm font-medium text-red-700">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('new_email_address_label')}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('enter_new_email')}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900 placeholder-slate-400"
                                    disabled={loading || success}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('confirm_with_password')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900 placeholder-slate-400"
                                        disabled={loading || success}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{t('required_verification')}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || success}
                                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${loading || success ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'}`}
                            >
                                {loading ? t('updating_btn') : t('update_email_header')}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
