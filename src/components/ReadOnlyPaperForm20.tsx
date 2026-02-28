'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiRefreshCw, FiCheck, FiPrinter } from 'react-icons/fi';
import Image from 'next/image';

interface RequestItem {
    materialName: string;
    quantity: number;
    model?: string;
    remarks?: string;
    materialId?: string;
    materialType?: string;
}

interface ReadOnlyPaperForm20Props {
    request: {
        receiptNo?: string;
        requesterName: string;
        department: string;
        items: RequestItem[];
        signature?: string; // Base64 signature
        headSignature?: string; // Department Head signature
        createdAt?: any;
    };
    onClose: () => void;
    onApprove: (signature?: string) => void;
    onReject: () => void;
    isProcessing: boolean;
    isDepartmentHead?: boolean;
}

export default function ReadOnlyPaperForm20({ request, onClose, onApprove, onReject, isProcessing, isDepartmentHead }: ReadOnlyPaperForm20Props) {
    const { receiptNo, requesterName, department, items, signature, headSignature, createdAt } = request;

    // Signature
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [isSigningMode, setIsSigningMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Parse date if available
    let dateDay = '';
    let dateYear = '';
    if (createdAt && createdAt.toDate) {
        const d = createdAt.toDate();
        dateDay = d.getDate().toString();
        // dateMonth = d.toLocaleString('default', { month: 'short' });
        dateYear = d.getFullYear().toString();
    }

    // Fill empty rows to make it look like the paper form (min 7 rows)
    const displayItems = [...items];
    while (displayItems.length < 7) {
        displayItems.push({ materialName: '', quantity: 0, model: '', remarks: '' });
    }

    // Canvas setup
    useEffect(() => {
        if (!isSigningMode) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // simple resize
        const p = canvas.parentElement;
        if (p) {
            canvas.width = p.clientWidth;
            canvas.height = p.clientHeight;
            ctx.strokeStyle = '#0033aa';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, [isSigningMode]);

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

    const handlePrint = () => {
        window.print();
    };

    const handleApproveWithSignature = () => {
        if (isDepartmentHead && !signatureData && !headSignature) {
            alert("Please sign the form before approving.");
            return;
        }
        onApprove(signatureData || undefined);
    };

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

    const textStyle: React.CSSProperties = {
        color: '#0033aa', // Blue ink
        fontFamily: "'Dancing Script', cursive", // Handwriting font
        fontSize: 16,
        fontWeight: 600,
    };

    const blank = (w: string) => <span style={{ display: 'inline-block', width: w, borderBottom: '1px solid #000' }}>&nbsp;</span>;

    if (!mounted) return null;

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', overflowY: 'auto',
            padding: '40px 16px'
        }} onClick={onClose}>
            <div style={{
                background: '#fff',
                width: '100%', maxWidth: '210mm',
                minHeight: '297mm',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                padding: '48px 56px',
                color: '#000',
                fontFamily: "'Noto Sans Ethiopic', 'Nyala', Arial, sans-serif",
                position: 'relative',
                borderRadius: 4
            }} onClick={e => e.stopPropagation()} className="printable-form">

                {/* Print Button */}
                <button onClick={handlePrint} className="print-hide" style={{
                    position: 'absolute', right: 72, top: 24,
                    background: '#f1f5f9', border: 'none', borderRadius: '50%',
                    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
                }} title="Print / Download PDF">
                    <FiPrinter size={20} />
                </button>

                {/* Close Button */}
                <button onClick={onClose} style={{
                    position: 'absolute', right: 24, top: 24,
                    background: '#f1f5f9', border: 'none', borderRadius: '50%',
                    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#64748b'
                }}>
                    <FiX size={24} />
                </button>

                {/* HEADER */}
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>ሞዴል 20</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                    <span>የ ደረሰኝ ቁጥር</span>
                    <span style={{
                        borderBottom: '1px solid #000', width: 180, textAlign: 'center', display: 'inline-block',
                        ...textStyle, fontSize: 18
                    }}>
                        {receiptNo}
                    </span>
                </div>

                {/* DATE LINE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    {blank('160px')}
                    <span>ቀን</span>
                    <span style={{
                        borderBottom: '1px solid #000', width: 120, textAlign: 'center', display: 'inline-block',
                        ...textStyle, fontSize: 18
                    }}>
                        {dateDay} / {dateYear}
                    </span>
                    <span>ዓ.ም</span>
                </div>

                {/* BODY TEXT */}
                <div style={{ marginBottom: 24 }}>
                    <p>ለዲማርቃስ የዩኒቨርሲቲ ቡራ ካምፓስ</p>
                    <p style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                        <span>እ ከዚህ ቤታች የፈረምኩት አቶ /ወ/ሮ/ሪት</span>
                        <span style={{
                            flex: 1, borderBottom: '1px solid #000', textAlign: 'center',
                            minWidth: 120, paddingBottom: 2, ...textStyle, fontSize: 18
                        }}>
                            {requesterName}
                        </span>
                    </p>
                    <p style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                        <span>ከ</span>
                        <span style={{
                            borderBottom: '1px solid #000', minWidth: 140, textAlign: 'center',
                            padding: '0 8px 2px', display: 'inline-block', ...textStyle, fontSize: 18
                        }}>
                            {department}
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
                            <th style={{ ...thStyle, width: 200, minWidth: 100 }}>የዕቃው ዓይነት</th>
                            <th style={thStyle} rowSpan={2}>ሞዴል</th>
                            <th style={{ ...thStyle, whiteSpace: 'nowrap', borderRight: 'none' }}>የተጠየቀው ዕ.ቁ ቁጥር ቡዝቱ ሲያ ባለስልጣኑ</th>
                            <th style={{ ...thStyle, whiteSpace: 'nowrap', borderLeft: 'none' }}>ማያሻሽላቸት ንምድ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayItems.map((item, idx) => (
                            <tr key={idx}>
                                <td style={tdStyle}>{idx + 1}</td>
                                <td style={tdStyle}>
                                    {item.quantity ? <span style={textStyle}>{item.quantity}</span> : ''}
                                </td>
                                <td style={tdStyle}>
                                    {item.materialName ? <span style={textStyle}>{item.materialName}</span> : ''}
                                </td>
                                <td style={tdStyle}>
                                    {item.model ? <span style={textStyle}>{item.model}</span> : ''}
                                </td>
                                <td style={{ ...tdStyle, borderRight: 'none' }}>
                                    {item.remarks ? <span style={textStyle}>{item.remarks}</span> : ''}
                                </td>
                                <td style={{ ...tdStyle, borderLeft: 'none' }}></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* SIGNATURES */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 40 }}>
                    {/* Requester */}
                    <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700 }}>የጠያቂው ስም</span>
                            <span style={{ flex: 1, borderBottom: '1px solid #000', textAlign: 'center', paddingBottom: 2, ...textStyle, fontSize: 18 }}>
                                {requesterName}
                            </span>
                        </div>
                        <div>
                            <span style={{ fontWeight: 700 }}>ፈረምኩት</span>
                            <div style={{ position: 'relative', height: 90, borderBottom: '2px solid #000', marginTop: 4 }}>
                                {signature ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={signature} alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%', display: 'block', margin: '0 auto' }} />
                                ) : (
                                    <span style={{ display: 'block', textAlign: 'center', color: '#ccc', paddingTop: 30 }}>No Signature</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Authority (Department Head) */}
                    <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700 }}>የባለስልጣኑ ስም</span>
                            <span style={{ flex: 1, borderBottom: '1px solid #000' }}>&nbsp;</span>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontWeight: 700 }}>ፊርማ</span>
                                {isSigningMode && (
                                    <button onClick={clearSig} className="print-hide"
                                        style={{ fontSize: 10, color: '#999', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FiRefreshCw size={10} /> ጽዳ
                                    </button>
                                )}
                            </div>

                            <div style={{ height: 90, borderBottom: '2px solid #000', marginTop: 4, position: 'relative' }}>
                                {headSignature ? (
                                    // Already signed via database (view mode)
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={headSignature} alt="Head Signature" style={{ maxHeight: '100%', maxWidth: '100%', display: 'block', margin: '0 auto' }} />
                                ) : signatureData ? (
                                    // Just signed in current session
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={signatureData} alt="New Signature" style={{ maxHeight: '100%', maxWidth: '100%', display: 'block', margin: '0 auto' }} />
                                ) : isDepartmentHead ? (
                                    // Department Head Action Area
                                    isSigningMode ? (
                                        <div style={{ position: 'absolute', inset: 0, background: '#fafafa', cursor: 'crosshair' }}>
                                            <canvas ref={canvasRef}
                                                onMouseDown={startDraw} onMouseUp={endDraw} onMouseMove={onDraw} onMouseLeave={endDraw}
                                                onTouchStart={startDraw} onTouchEnd={endDraw} onTouchMove={onDraw}
                                                style={{ width: '100%', height: '100%', touchAction: 'none' }} />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsSigningMode(true)}
                                            style={{
                                                width: '100%', height: '100%', background: '#f0f9ff',
                                                border: '2px dashed #3b82f6', borderRadius: 4,
                                                color: '#3b82f6', fontWeight: 600, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                            Click to Sign
                                        </button>
                                    )
                                ) : (
                                    // Empty for others
                                    <span style={{ display: 'block', textAlign: 'center', color: '#ccc', paddingTop: 30 }}>Pending Authorization</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* APPROVAL ACTIONS */}
                <div style={{ marginTop: 60, display: 'flex', gap: 16, justifyContent: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: 32 }} className="print-hide">
                    <button
                        onClick={onReject}
                        style={{
                            padding: '12px 32px', borderRadius: 8,
                            background: '#fff', border: '2px solid #ef4444',
                            color: '#ef4444', fontWeight: 700, cursor: 'pointer',
                            fontSize: 14, textTransform: 'uppercase'
                        }}>
                        Reject
                    </button>
                    <button
                        onClick={handleApproveWithSignature}
                        disabled={isProcessing}
                        style={{
                            padding: '12px 48px', borderRadius: 8,
                            background: isProcessing ? '#93c5fd' : '#2563eb',
                            border: 'none',
                            color: '#fff', fontWeight: 700, cursor: isProcessing ? 'wait' : 'pointer',
                            fontSize: 14, textTransform: 'uppercase',
                            boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
                        }}>
                        {isProcessing ? 'Processing...' : 'Approve Request'}
                    </button>
                </div>

                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@300;400;500;600;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .printable-form, .printable-form * {
                            visibility: visible;
                        }
                        .printable-form {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            margin: 0;
                            padding: 0 !important;
                            box-shadow: none !important;
                            background: white !important;
                        }
                        .print-hide {
                            display: none !important;
                        }
                    }
                `}</style>
            </div>
        </div>
        , document.body);
}
