'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiSearch, FiTrash2, FiAlertTriangle, FiCheckCircle, FiChevronRight, FiFilter, FiUser, FiCheck, FiX, FiActivity } from 'react-icons/fi';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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
            setNotification({ type: 'success', message: `Personnel status updated to ${newStatus.toUpperCase()}.` });
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

    const filteredUsers = users.filter(user =>
        (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.userRole?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 p-1">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <FiUsers className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">Personnel Directory</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Manage institutional access & identity</p>
                    </div>
                </div>

                <div className="relative w-full md:w-96 group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm font-bold text-slate-700 shadow-sm"
                    />
                </div>
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
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Role</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Status</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Directory...</p>
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
                                                    {user.status === 'inactive' ? 'Deactivated' : 'Authorized'}
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
        </div>
    );
}
