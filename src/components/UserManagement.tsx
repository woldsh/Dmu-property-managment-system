'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { FiUsers, FiSearch, FiTrash2, FiAlertTriangle, FiCheckCircle, FiChevronRight, FiFilter, FiUser, FiCheck, FiX, FiActivity, FiEdit2, FiBookOpen, FiUserCheck } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

interface UserData {
    uid: string;
    displayName: string;
    email: string;
    userRole: string;
    mainRole: string;
    department?: string;
    status?: 'active' | 'inactive';
    createdAt?: any;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [editForm, setEditForm] = useState({
        displayName: '',
        email: '',
        password: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'academic' | 'admin'>('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            if (!db) return;
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const userData = querySnapshot.docs.map(doc => ({
                status: 'active', // Default fallback
                ...doc.data(),
                uid: doc.id
            } as UserData));
            setUsers(userData);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (uid: string, currentStatus: string | undefined) => {
        const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
        setUpdatingStatusId(uid);
        try {
            if (!db) return;
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { status: newStatus });
            setUsers(users.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
            setNotification({ type: 'success', message: `${t('personnel_identity')} status updated to ${newStatus.toUpperCase()}.` });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error("Error updating status:", error);
            setNotification({ type: 'error', message: 'Failed to update personnel status.' });
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleDelete = async (uid: string) => {
        setDeletingId(uid);
        try {
            if (!db) return;
            await deleteDoc(doc(db, 'users', uid));
            setUsers(users.filter(u => u.uid !== uid));
            setNotification({ type: 'success', message: 'User deleted successfully from Firestore.' });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error("Error deleting user:", error);
            setNotification({ type: 'error', message: 'Failed to delete user.' });
        } finally {
            setDeletingId(null);
            setConfirmDelete(null);
        }
    };

    const handleEditClick = (user: UserData) => {
        setEditingUser(user);
        setEditForm({
            displayName: user.displayName || '',
            email: user.email || '',
            password: '' // Don't show password
        });
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setIsUpdating(true);
        try {
            const response = await fetch('/api/auth/update-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: editingUser.uid,
                    displayName: editForm.displayName,
                    email: editForm.email,
                    password: editForm.password || undefined // Only send if not empty
                }),
            });

            const result = await response.json();
            if (result.success) {
                setUsers(users.map(u => u.uid === editingUser.uid ? {
                    ...u,
                    displayName: editForm.displayName,
                    email: editForm.email
                } : u));
                setNotification({ type: 'success', message: 'Personnel record updated successfully.' });
                setEditingUser(null);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error("Error updating user:", error);
            setNotification({ type: 'error', message: error.message || 'Failed to update personnel record.' });
        } finally {
            setIsUpdating(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.userRole?.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterType === 'academic') return user.mainRole === 'academic_staff';
        if (filterType === 'admin') return user.mainRole === 'admin_staff';

        return true;
    });

    return (
        <div className="space-y-8 p-1">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <FiUsers className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">{t('employee_directory')}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{t('manage_institutional_access')}</p>
                    </div>
                </div>

                <div className="relative w-full md:w-96 group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder={t('search_personnel_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm font-bold text-slate-700 shadow-sm"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 p-1">
                {[
                    { id: 'all', label: t('all_personnel'), icon: FiUsers, color: 'blue' },
                    { id: 'academic', label: t('academic_staff'), icon: FiBookOpen, color: 'indigo' },
                    { id: 'admin', label: t('admin_staff'), icon: FiUserCheck, color: 'sky' }
                ].map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setFilterType(filter.id as any)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === filter.id
                            ? `bg-slate-900 text-white shadow-lg`
                            : `bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50`
                            }`}
                    >
                        <filter.icon className={filterType === filter.id ? 'text-white' : `text-${filter.color}-500`} />
                        {filter.label}
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] ${filterType === filter.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {filter.id === 'all' ? users.length :
                                filter.id === 'academic' ? users.filter(u => u.mainRole === 'academic_staff').length :
                                    users.filter(u => u.mainRole === 'admin_staff').length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-2xl flex items-center gap-4 text-sm font-black uppercase tracking-tight shadow-lg ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}
                    >
                        {notification.type === 'success' ? <FiCheckCircle className="text-xl" /> : <FiAlertTriangle className="text-xl" />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Users List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('personnel_identity')}</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('institutional_role')}</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('account_status')}</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('access_protocol')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">{t('syncing_employees')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <FiUsers className="text-5xl text-slate-400 mb-2" />
                                            <p className="text-sm font-bold text-slate-500">No matching personnel records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, idx) => (
                                    <motion.tr
                                        key={user.uid}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-slate-50 group transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-all shadow-inner group-hover:shadow-sm">
                                                    <FiUser />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{user.displayName}</p>
                                                    <p className="text-xs font-bold text-slate-400 tracking-tight">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-700 group-hover:border-blue-200 group-hover:text-blue-700 transition-all">
                                                    {user.userRole?.replace(/_/g, ' ')}
                                                </span>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1">
                                                    {user.department?.replace(/_/g, ' ') || user.mainRole?.replace(/_/g, ' ') || 'Global'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${user.status === 'inactive' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'inactive' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {user.status === 'inactive' ? t('deactivated') : t('authorized')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end items-center gap-4">
                                                {/* Toggle Status Button */}
                                                <button
                                                    onClick={() => toggleUserStatus(user.uid, user.status)}
                                                    disabled={updatingStatusId === user.uid}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${user.status === 'inactive'
                                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white'
                                                        }`}
                                                    title={user.status === 'inactive' ? 'Activate Personnel' : 'Deactivate Personnel'}
                                                >
                                                    {updatingStatusId === user.uid ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : user.status === 'inactive' ? (
                                                        <FiCheck className="text-lg" />
                                                    ) : (
                                                        <FiX className="text-lg" />
                                                    )}
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Edit Record"
                                                >
                                                    <FiEdit2 className="text-lg" />
                                                </button>

                                                {/* Delete Button */}
                                                {confirmDelete === user.uid ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDelete(user.uid)}
                                                            disabled={deletingId === user.uid}
                                                            className="px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-200"
                                                        >
                                                            {deletingId === user.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(null)}
                                                            className="px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmDelete(user.uid)}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                        title="Delete Record"
                                                    >
                                                        <FiTrash2 className="text-lg" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                    <FiAlertTriangle className="text-xl" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Access Revocation Protocol</h4>
                    <p className="text-xs font-bold text-amber-700/80 leading-relaxed mt-1">
                        Deleting a user here only removes their profile record from Firestore. The primary authentication account remains active in Firebase Auth. To fully terminate institutional access, a central authentication sweep is required.
                    </p>
                </div>
            </div>

            {/* Edit User Modal */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                        <FiEdit2 className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{t('modify_identity')}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t('update_credentials')}</p>
                                    </div>
                                </div>
                                <button onClick={() => setEditingUser(null)} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                                    <FiX className="text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('full_name')}</label>
                                        <input
                                            type="text"
                                            value={editForm.displayName}
                                            onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('account_email')}</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('reset_password')} <span className="text-[10px] text-slate-300 normal-case font-bold">{t('leave_blank_keep')}</span></label>
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        {t('cancel_protocol')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95 disabled:bg-slate-400"
                                    >
                                        {isUpdating ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>{t('syncing')}</span>
                                            </div>
                                        ) : t('commit_changes')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
