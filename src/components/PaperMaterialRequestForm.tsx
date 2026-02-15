'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { FiPlus, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';

interface RequestItem {
    id: string;
    quantity: string;
    itemType: string;
    model: string;
    remark: string;
}

interface PaperMaterialRequestFormProps {
    initialItem?: { name: string; model?: string };
    onBack?: () => void;
}

export default function PaperMaterialRequestForm({ initialItem, onBack }: PaperMaterialRequestFormProps) {
    const { user, userRole, department } = useAuth();
    const [receiptNo, setReceiptNo] = useState('');
    const [dateDay, setDateDay] = useState('');
    const [dateYear, setDateYear] = useState('');
    const [requesterName, setRequesterName] = useState('');
    const [dept, setDept] = useState('');
    const [items, setItems] = useState<RequestItem[]>(() => {
        const initial = Array.from({ length: 7 }, (_, i) => ({
            id: String(i + 1), quantity: '', itemType: '', model: '', remark: ''
        }));
        if (initialItem) {
            initial[0].itemType = initialItem.name || '';
            initial[0].model = initialItem.model || '';
        }
        return initial;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Signature
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);

    useEffect(() => {
        if (user?.displayName) setRequesterName(user.displayName);
        if (department) {
            setDept(department);
        } else if (userRole) {
            // Infer department from role (e.g., hrm_employee -> hrm)
            const inferred = userRole
                .replace('_employee', '')
                .replace('_teacher', '')
                .replace('_head', '')
                .replace('_leader', '')
                .replace(/_/g, ' ')
                .toUpperCase();

            // Avoid generic roles like "ACADEMIC STAFF" or "ADMIN STAFF" as department names
            if (inferred !== 'ACADEMIC STAFF' && inferred !== 'ADMIN STAFF' && inferred !== 'MANAGING DIRECTOR') {
                setDept(inferred);
            }
        }
    }, [user, department, userRole]);

    // Canvas setup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const resize = () => {
            const p = canvas.parentElement;
            if (p) {
                canvas.width = p.clientWidth;
                canvas.height = p.clientHeight;
                ctx.strokeStyle = '#0033aa';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const getPos = (e: React.MouseEvent | React.TouchEvent, c: HTMLCanvasElement) => {
        const r = c.getBoundingClientRect();
        if ('touches' in e) return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
        return { x: (e as React.MouseEvent).clientX - r.left, y: (e as React.MouseEvent).clientY - r.top };
    };
    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        setIsDrawing(true);
        const { x, y } = getPos(e, c);
        ctx.beginPath(); ctx.moveTo(x, y);
    };
    const onDraw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        const { x, y } = getPos(e, c);
        ctx.lineTo(x, y); ctx.stroke();
    };
    const endDraw = () => {
        if (!isDrawing) return; setIsDrawing(false);
        const c = canvasRef.current;
        if (c) setSignatureData(c.toDataURL());
    };
    const clearSig = () => {
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        ctx.clearRect(0, 0, c.width, c.height);
        setSignatureData(null);
        ctx.strokeStyle = '#0033aa'; ctx.lineWidth = 2;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    };

    const addRow = () => setItems([...items, { id: Date.now().toString(), quantity: '', itemType: '', model: '', remark: '' }]);
    const removeRow = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)); };
    const updateItem = (id: string, field: keyof RequestItem, val: string) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
    };

    const handleSubmit = async () => {
        if (!user || !db || isSubmitting) return;

        // Validation: Quantity, Item Type, Model are required for any active row
        const activeItems = items.filter(i => i.quantity.trim() || i.itemType.trim() || i.model.trim() || i.remark.trim());

        if (activeItems.length === 0) {
            alert('እባክዎ ቢያንስ አንድ ዕቃ ያስገቡ። (Please enter at least one item)');
            return;
        }

        const incompleteItems = activeItems.filter(i => !i.quantity.trim() || !i.itemType.trim() || !i.model.trim());
        if (incompleteItems.length > 0) {
            alert('እባክዎ ለሁሉም ዕቃዎች ብዛት፣ የዕቃው ዓይነት እና ሞዴል ያስገቡ።\n(Quantity, Item Type, and Model are required for all items)');
            return;
        }

        if (!signatureData) { alert('እባክዎ ከማቅረብዎ በፊት ይፈርሙ። (Please sign before submitting)'); return; }

        setIsSubmitting(true);
        try {
            // Determine the correct approver role based on naming patterns
            let targetRole = 'department_head';
            let rolePrefix = '';

            if (userRole) {
                if (userRole.endsWith('_teacher')) {
                    rolePrefix = userRole.replace('_teacher', '');
                    targetRole = `${rolePrefix}_head`;
                } else if (userRole.endsWith('_employee')) {
                    rolePrefix = userRole.replace('_employee', '');
                    targetRole = `${rolePrefix}_leader`;
                }
            }

            // Fallback for currentApproverRole categorization
            let approverCategory = 'department_head';
            if (targetRole.endsWith('_leader')) approverCategory = targetRole;

            let currentApproverId = 'PENDING_APPROVER_ASSIGNMENT';
            let currentApproverName = targetRole.replace(/_/g, ' ').toUpperCase();

            // Try to find the specific leader
            const approversQuery = query(
                collection(db, 'users'),
                where('userRole', '==', targetRole)
            );
            const approversSnap = await getDocs(approversQuery);

            if (!approversSnap.empty) {
                // If multiple, try to match department
                let bestMatch = approversSnap.docs[0];
                if (dept) {
                    const deptMatch = approversSnap.docs.find(d => d.data().department === dept);
                    if (deptMatch) bestMatch = deptMatch;
                }
                currentApproverId = bestMatch.id;
                currentApproverName = bestMatch.data().displayName || currentApproverName;
            } else if (dept) {
                // Generic fallback search by department if role-specific search fails
                const deptUsersQuery = query(
                    collection(db, 'users'),
                    where('department', '==', dept)
                );
                const deptUsersSnap = await getDocs(deptUsersQuery);
                const leadDoc = deptUsersSnap.docs.find(d => {
                    const r = d.data().userRole || '';
                    return r.endsWith('_head') || r.endsWith('_leader');
                });
                if (leadDoc) {
                    currentApproverId = leadDoc.id;
                    currentApproverName = leadDoc.data().displayName || currentApproverName;
                    targetRole = leadDoc.data().userRole;
                }
            }

            await addDoc(collection(db, 'Request_materials'), {
                requesterId: user.uid,
                requesterName: requesterName || user.displayName,
                department: dept,
                receiptNo,
                items: activeItems.map(item => ({
                    materialName: item.itemType,
                    quantity: Number(item.quantity) || 0,
                    model: item.model,
                    remarks: item.remark,
                    materialId: 'FORM20_' + Date.now(),
                    materialType: 'consumable',
                    AC_decition: 'non',
                })),
                signature: signatureData,
                status: 'pending_department_leader',
                currentApproverRole: approverCategory,
                currentApproverId: currentApproverId,
                currentApproverName: currentApproverName,
                createdAt: serverTimestamp(),
                formType: 'paper_form_20',
                history: [{ status: 'submitted', user: user.uid, timestamp: new Date().toISOString(), note: `ሞዴል 20 ቅጽ ቀርቧል:: Forwarded to ${currentApproverName} (${targetRole.replace(/_/g, ' ')})` }],
            });
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setItems(Array.from({ length: 7 }, (_, i) => ({ id: String(i + 1), quantity: '', itemType: '', model: '', remark: '' })));
                setReceiptNo(''); setDateDay(''); setDateYear('');
                clearSig();
            }, 3000);
        } catch (e) { console.error(e); alert("ማቅረብ አልተሳካም። (Submission failed)"); }
        finally { setIsSubmitting(false); }
    };

    // Column Resizing
    const [itemTypeWidth, setItemTypeWidth] = useState(200); // Default width
    const resizingRef = useRef(false);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    const startResize = (e: React.MouseEvent) => {
        resizingRef.current = true;
        startXRef.current = e.pageX;
        startWidthRef.current = itemTypeWidth;
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
        e.stopPropagation();
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!resizingRef.current) return;
            const diff = e.pageX - startXRef.current;
            const newWidth = Math.max(100, startWidthRef.current + diff); // Min width 100px
            setItemTypeWidth(newWidth);
        };
        const onMouseUp = () => {
            resizingRef.current = false;
            document.body.style.cursor = '';
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    // Inline underline for blank fields
    const blank = (w: string) => <span style={{ display: 'inline-block', width: w, borderBottom: '1px solid #000' }}>&nbsp;</span>;

    return (
        <div style={{ minHeight: '100vh', background: '#e5e7eb', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
            {/* Navigation */}
            {onBack && (
                <div className="w-full max-w-[210mm] mb-4 flex justify-start print-hide">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-white text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 flex items-center gap-2 text-sm font-medium"
                    >
                        ← Back to Search
                    </button>
                </div>
            )}

            {/* Success */}
            {showSuccess && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                    <div style={{ background: '#fff', padding: 40, borderRadius: 16, textAlign: 'center', color: '#000' }}>
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <FiCheck style={{ fontSize: 28, color: '#16a34a' }} />
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 700 }}>ጥያቄው ቀርቧል!</h2>
                        <p style={{ color: '#666', marginTop: 8, fontSize: 14 }}>ሞዴል 20 ቅጽዎ በተሳካ ሁኔታ ተልኳል።</p>
                    </div>
                </div>
            )}

            {/* ===== PAPER ===== */}
            <div style={{
                background: '#fff',
                width: '100%',
                maxWidth: '210mm',
                minHeight: '297mm',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                padding: '48px 56px',
                color: '#000',
                fontFamily: "'Noto Sans Ethiopic', 'Nyala', Arial, sans-serif",
                fontSize: 14,
                lineHeight: 1.8,
                position: 'relative',
            }}>

                {/* HEADER */}
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>ሞዴል 20</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                    <span>የ ደረሰኝ ቁጥር</span>
                    <input value={receiptNo} onChange={e => setReceiptNo(e.target.value)}
                        style={{
                            borderBottom: '1px solid #000', background: 'transparent', outline: 'none', width: 180, textAlign: 'center',
                            color: '#0033aa', fontFamily: "'Dancing Script', cursive", fontSize: 18, fontWeight: 600
                        }} />
                </div>

                {/* DATE LINE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    {blank('160px')}
                    <span>ቀን</span>
                    <input value={dateDay} onChange={e => setDateDay(e.target.value)}
                        style={{
                            borderBottom: '1px solid #000', background: 'transparent', outline: 'none', width: 120, textAlign: 'center',
                            color: '#0033aa', fontFamily: "'Dancing Script', cursive", fontSize: 18, fontWeight: 600
                        }} />
                    <span>ዓ.ም</span>
                </div>

                {/* BODY TEXT */}
                <div style={{ marginBottom: 24 }}>
                    <p>ለዲማርቃስ የዩኒቨርሲቲ ቡራ ካምፓስ</p>
                    <p style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                        <span>እ ከዚህ ቤታች የፈረምኩት አቶ /ወ/ሮ/ሪት</span>
                        <span style={{
                            flex: 1,
                            borderBottom: '1px solid #000',
                            textAlign: 'center',
                            color: '#0033aa',
                            fontFamily: "'Dancing Script', cursive",
                            fontSize: 18,
                            fontWeight: 600,
                            fontStyle: 'italic',
                            paddingBottom: 2,
                            minWidth: 120,
                        }}>
                            {requesterName}
                        </span>
                    </p>
                    <p style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                        <span>ከ</span>
                        <span style={{
                            borderBottom: '1px solid #000',
                            minWidth: 140,
                            textAlign: 'center',
                            color: '#0033aa',
                            fontFamily: "'Dancing Script', cursive",
                            fontSize: 18,
                            fontWeight: 600,
                            fontStyle: 'italic',
                            padding: '0 8px 2px',
                            display: 'inline-block',
                        }}>
                            {dept}
                        </span>
                        <span>ክፍል አንጋልጉሎት ከዚህ ቀጥሎ በዝርዝር</span>
                    </p>
                    <p>የተመለከቱትን ዕቃዎች መዋ ሀንው እንዲሰጠኝ አሰባሰልው::</p>
                </div>

                {/* TABLE */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, border: '1.5px solid #000' }}>
                    <thead>
                        <tr>
                            <th style={thStyle} rowSpan={2}>ተ.<br />ቁ</th>
                            <th style={thStyle} rowSpan={2}>ብዛት</th>
                            <th style={{ ...thStyle, width: itemTypeWidth, position: 'relative', minWidth: 100 }}>
                                የዕቃው ዓይነት
                                <div
                                    onMouseDown={(e) => startResize(e)}
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: 10,
                                        cursor: 'col-resize',
                                        zIndex: 10,
                                        background: 'transparent' // transparent handle
                                    }}
                                    className="resize-handle"
                                />
                            </th>
                            <th style={thStyle} rowSpan={2}>ሞዴል</th>
                            <th style={{ ...thStyle, whiteSpace: 'nowrap', borderRight: 'none' }}>
                                የተጠየቀው ዕ.ቁ ቁጥር ቡዝቱ ሲያ ባለስልጣኑ
                            </th>
                            <th style={{ ...thStyle, whiteSpace: 'nowrap', borderLeft: 'none' }}>
                                ማያሻሽላቸት ንምድ
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={item.id} className="hover-row">
                                <td style={tdStyle}>{idx + 1}</td>
                                <td style={tdStyle}>
                                    <input value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                                        style={inputStyle} />
                                </td>
                                <td style={tdStyle}>
                                    <input value={item.itemType} onChange={e => updateItem(item.id, 'itemType', e.target.value)}
                                        style={inputStyle} />
                                </td>
                                <td style={tdStyle}>
                                    <input value={item.model} onChange={e => updateItem(item.id, 'model', e.target.value)}
                                        style={inputStyle} />
                                </td>
                                <td style={{ ...tdStyle, borderRight: 'none' }}>
                                    <input value={item.remark} onChange={e => updateItem(item.id, 'remark', e.target.value)}
                                        style={inputStyle} />
                                </td>
                                <td style={{ ...tdStyle, borderLeft: 'none', position: 'relative' }}>
                                    <input style={inputStyle} />
                                    {items.length > 1 && (
                                        <button onClick={() => removeRow(item.id)}
                                            style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0, fontSize: 12 }}
                                            className="row-delete-btn">
                                            <FiX />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Add Row */}
                <div style={{ textAlign: 'center', marginBottom: 32 }} className="print-hide">
                    <button onClick={addRow}
                        style={{ background: 'none', border: '1px dashed #aaa', padding: '6px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#555', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <FiPlus /> ረድፍ ጨምር
                    </button>
                </div>

                {/* SIGNATURES */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 40 }}>
                    {/* Requester */}
                    <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700 }}>የጠያቂው ስም</span>
                            <span style={{
                                flex: 1,
                                borderBottom: '1px solid #000',
                                textAlign: 'center',
                                color: '#0033aa',
                                fontFamily: "'Dancing Script', cursive",
                                fontSize: 20,
                                fontWeight: 600,
                                fontStyle: 'italic',
                                paddingBottom: 2,
                            }}>
                                {requesterName}
                            </span>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontWeight: 700 }}>ፊርማ</span>
                                <button onClick={clearSig} className="print-hide"
                                    style={{ fontSize: 10, color: '#999', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <FiRefreshCw size={10} /> ጽዳ
                                </button>
                            </div>
                            <div style={{ position: 'relative', height: 90, borderBottom: '2px solid #000', background: '#fafafa', cursor: 'crosshair' }}>
                                <canvas ref={canvasRef}
                                    onMouseDown={startDraw} onMouseUp={endDraw} onMouseMove={onDraw} onMouseLeave={endDraw}
                                    onTouchStart={startDraw} onTouchEnd={endDraw} onTouchMove={onDraw}
                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none' }} />
                                {!isDrawing && !signatureData && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0.15 }}>
                                        <span style={{ fontSize: 18, fontFamily: "'Dancing Script', cursive", fontStyle: 'italic' }}>እዚህ ይፈርሙ</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Authority */}
                    <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700 }}>የባለስልጣኑ ስም</span>
                            <span style={{ flex: 1, borderBottom: '1px solid #000' }}>&nbsp;</span>
                        </div>
                        <div>
                            <span style={{ fontWeight: 700 }}>ፊርማ</span>
                            <div style={{ height: 90, borderBottom: '2px solid #ccc', marginTop: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8 }}>
                                <span style={{ fontSize: 10, color: '#ccc', letterSpacing: 2 }}>ለባለስልጣን ብቻ</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUBMIT */}
                <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }} className="print-hide">
                    <button onClick={handleSubmit} disabled={isSubmitting}
                        style={{
                            padding: '12px 40px', borderRadius: 10, background: isSubmitting ? '#93c5fd' : '#2563eb',
                            color: '#fff', fontWeight: 700, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
                        }}>
                        {isSubmitting ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                        ጥያቄ አቅርብ
                    </button>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@300;400;500;600;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
                .hover-row:hover { background: #f8fafc; }
                .hover-row:hover .row-delete-btn { opacity: 1 !important; }
                @media print {
                    .print-hide { display: none !important; }
                }
            `}</style>
        </div>
    );
}

// Styles
const thStyle: React.CSSProperties = {
    border: '1.5px solid #000',
    padding: '8px 4px',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
    verticalAlign: 'middle',
    color: '#000',
    background: '#fff',
};

const tdStyle: React.CSSProperties = {
    border: '1px solid #000',
    padding: '2px',
    textAlign: 'center',
    verticalAlign: 'middle',
    color: '#000',
    height: 32,
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    textAlign: 'center',
    color: '#0033aa', // Blue ink
    fontFamily: "'Dancing Script', cursive", // Handwriting font
    fontSize: 16,
    fontWeight: 600,
    padding: '4px 2px',
};
