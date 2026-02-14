'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { FiX, FiUser, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleClose = () => {
        setError('');
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!displayName.trim()) {
            setError('Display name cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            if (auth?.currentUser) {
                // Update Firebase Auth profile
                await updateProfile(auth.currentUser, {
                    displayName: displayName
                });

                // Update Firestore document (try both 'users' and 'admins' collections)
                // We do this because the user might be in either or both, depending on the role.
                // Ideally, we should know the collection, but for robustness we can try to update where the user exists.
                // However, based on AuthContext, we know if they are admin or generic user.
                // For simplicity and safety, we will try to update 'users' first, as most have a user doc.
                // If the user replaces 'admins' check in AuthContext, we should probably update that too if it exists.

                // Let's rely on the user.uid.
                // Update Firestore document (try both 'users' and 'admins' collections)
                if (db) {
                    // Let's rely on the user.uid.
                    const userRef = doc(db, 'users', auth.currentUser.uid);
                    try {
                        await updateDoc(userRef, { displayName });
                    } catch (e) {
                        console.log('User document might not exist or permission denied for users collection', e);
                    }

                    const adminRef = doc(db, 'admins', auth.currentUser.uid);
                    try {
                        await updateDoc(adminRef, { name: displayName });
                        // Also try displayName if that's the field
                        await updateDoc(adminRef, { displayName });
                    } catch (e) {
                        // Ignore if admin doc doesn't exist
                    }
                }

                setSuccess(true);
                setTimeout(() => {
                    handleClose();
                    window.location.reload(); // Force reload to reflect changes in UI/AuthContext if needed
                }, 1500);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update profile.');
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
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <FiUser className="text-purple-600 text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{t('edit_profile_header')}</h3>
                                    <p className="text-xs text-slate-400">{t('update_personal_details')}</p>
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
                                        <FiCheck className="text-emerald-600" />
                                        <p className="text-sm font-medium text-emerald-700">{t('profile_updated_success')}</p>
                                    </motion.div>
                                )}
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                                        <FiAlertCircle className="text-red-600" />
                                        <p className="text-sm font-medium text-red-700">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('full_name_label')}</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder={t('enter_full_name')}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm text-slate-900 placeholder-slate-400"
                                    disabled={loading || success}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || success}
                                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${loading || success ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20'}`}
                            >
                                {loading ? t('saving_btn') : t('save_changes_btn')}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
