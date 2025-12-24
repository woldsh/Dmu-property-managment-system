'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FaPaperPlane, FaUserCircle, FaPaperclip, FaFilePdf, FaFileAlt, FaImage, FaTimes } from 'react-icons/fa';

export default function MeetingChat() {
    const { user, userRole } = useAuth();
    const { t } = useLanguage();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!db) return;

        const q = query(
            collection(db, "meeting_messages"),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).reverse();
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'meeting-attachments');

        const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log('Upload response data:', data);

        if (!response.ok || !data.success) {
            const errorMsg = data.error || data.message || 'Upload failed';
            throw new Error(errorMsg);
        }

        return {
            url: data.data.url,
            name: file.name,
            type: file.type,
            size: file.size
        };
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !user || !db) return;

        setSending(true);
        try {
            let attachment = null;
            if (selectedFile) {
                setUploading(true);
                attachment = await uploadFile(selectedFile);
                setUploading(false);
            }

            const displayName = user.displayName || user.email?.split('@')[0] || t('executive_user_label');
            const messageData = {
                text: newMessage,
                senderId: user.uid,
                senderName: displayName,
                senderRole: userRole || t('executive_label'),
                attachment: attachment,
                createdAt: serverTimestamp()
            };
            console.log('Adding document to Firestore:', messageData);
            await addDoc(collection(db, "meeting_messages"), messageData);
            setNewMessage('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error: any) {
            console.error("Error sending message:", error);
            alert(`Error: ${error.message || "Failed to send message. Please try again."}`);
        } finally {
            setSending(false);
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                style={{ maxHeight: 'calc(100% - 60px)' }}
            >
                {messages.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400 text-xs italic">{t('start_discussion')}</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === user?.uid;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {msg.senderName} ({msg.senderRole})
                                    </span>
                                </div>
                                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${isMe
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                    {msg.attachment && (
                                        <div className="mb-2">
                                            {msg.attachment.type.startsWith('image/') ? (
                                                <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={msg.attachment.url}
                                                        alt={msg.attachment.name}
                                                        className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                        style={{ maxHeight: '200px' }}
                                                    />
                                                </a>
                                            ) : (
                                                <a
                                                    href={msg.attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-2 p-2 rounded-lg border ${isMe ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-white border-gray-200 text-indigo-600'
                                                        } hover:opacity-90 transition-opacity`}
                                                >
                                                    {msg.attachment.type.includes('pdf') ? <FaFilePdf /> : <FaFileAlt />}
                                                    <span className="text-xs truncate max-w-[150px]">{msg.attachment.name}</span>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 bg-gray-50">
                {selectedFile && (
                    <div className="px-3 py-2 flex items-center justify-between bg-indigo-50 border-b border-indigo-100">
                        <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium">
                            {selectedFile.type.startsWith('image/') ? <FaImage /> : selectedFile.type.includes('pdf') ? <FaFilePdf /> : <FaFileAlt />}
                            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                            <span className="text-indigo-400 font-normal">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="text-indigo-400 hover:text-indigo-600 transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="p-3 flex gap-2 items-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending || uploading}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all disabled:opacity-50"
                        title="Attach file"
                    >
                        <FaPaperclip className={uploading ? 'animate-spin' : ''} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={uploading ? "Uploading..." : t('type_message')}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        disabled={sending || uploading}
                    />
                    <button
                        type="submit"
                        disabled={(sending || uploading) || (!newMessage.trim() && !selectedFile)}
                        className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
                    >
                        <FaPaperPlane className={sending ? 'animate-pulse' : ''} />
                    </button>
                </form>
            </div>
        </div>
    );
}
