'use client';

import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { FiCheckCircle, FiXCircle, FiShield, FiBox } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

interface VerificationProps {
    onSuccess?: () => void;
}

export default function VerifyMaterialRequest({ onSuccess }: VerificationProps) {
    const { user } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [data, setData] = useState<any>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!user) {
            setError('You must be logged in to verify requests.');
            setLoading(false);
            return;
        }

        try {
            if (!db) throw new Error("Firebase not initialized");
            // Validate code
            const q = query(
                collection(db!, 'Send_to_Users'),
                where('verification_code', '==', code),
                where('status', '==', 'code_sent')
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('Invalid verification code. Please try again.');
                setLoading(false);
                return;
            }

            const docData = querySnapshot.docs[0].data();
            const docId = querySnapshot.docs[0].id;

            // Enforce Rule: Must belong to the same requester
            if (docData.requester_user_id !== user.uid) {
                setError('This verification code does not belong to your account.');
                setLoading(false);
                return;
            }

            setData(docData);

            // Step 7: Save to Send_to_Store
            await addDoc(collection(db!, 'Send_to_Store'), {
                request_id: docData.request_id,
                requester_user_id: docData.requester_user_id,
                requester_name: docData.requester_name,
                material_details: docData.material_details,
                verified_at: serverTimestamp(),
                verified_by_code: code,
                status: 'verified_and_sent_to_store'
            });

            // Update status in Send_to_Users to prevent reuse
            await updateDoc(doc(db!, 'Send_to_Users', docId), {
                status: 'verified'
            });

            setSuccess(true);
            if (onSuccess) onSuccess();

        } catch (err) {
            console.error('Verification error:', err);
            setError('An error occurred during verification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl text-center space-y-6 border-2 border-green-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <FiCheckCircle className="text-4xl" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Verification Successful!</h2>
                    <p className="text-slate-500 mt-2 font-medium">Your request has been verified and sent to the store.</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-3">
                    <div className="flex items-center gap-3 text-slate-700 font-bold border-b border-slate-200 pb-3">
                        <FiBox className="text-xl" />
                        <span>Included Items</span>
                    </div>
                    {data?.material_details?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-600">{item.materialName}</span>
                            <span className="font-bold text-slate-800">{item.quantity} {item.unit}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full -ml-16 -mb-16 blur-3xl opacity-60"></div>

            <div className="relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-500/30 mb-6">
                        <FiShield className="text-3xl" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Verify Request</h1>
                    <p className="text-slate-400 font-medium text-sm">Enter the code sent to your notifications</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 placeholder:text-slate-200"
                            placeholder="······"
                            maxLength={6}
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl text-sm font-bold">
                            <FiXCircle className="text-lg flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>
            </div>
        </div>
    );
}
