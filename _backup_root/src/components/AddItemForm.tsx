'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import {
    FaBoxOpen,
    FaMoneyBillWave,
    FaWarehouse,
    FaClipboardList,
    FaInfoCircle,
    FaCamera,
    FaTimes,
    FaCheckCircle,
    FaSpinner
} from 'react-icons/fa';

interface AddItemFormProps {
    type: 'fixed_asset' | 'consumable';
}

export default function AddItemForm({ type }: AddItemFormProps) {
    const isFixed = type === 'fixed_asset';

    const [formData, setFormData] = useState({
        materialName: '',
        materialCode: '',
        category: '',
        otherCategory: '',
        description: '',
        quantity: 1,
        unit: 'Piece',
        otherUnit: '',
        purchaseDate: '',
        vendorName: '',
        unitPrice: 0,
        storeLocation: '',
        shelfNumber: '',
        condition: 'New',
        otherCondition: '',
        dateField: '', // Generic field for warrantyDate or expiryDate
        responsiblePerson: '',
        serialNumber: '',
        remarks: '',
        tags: '',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    // Auto-calculate Total Price
    useEffect(() => {
        setTotalPrice(formData.quantity * formData.unitPrice);
    }, [formData.quantity, formData.unitPrice]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1048576) { // 1MB limit check
                alert("Image is too large. Please upload an image smaller than 1MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: null, message: '' });

        // Consolidate 'Other' fields
        const finalCategory = formData.category === 'Other' ? formData.otherCategory : formData.category;
        const finalUnit = formData.unit === 'Other' ? formData.otherUnit : formData.unit;
        const finalCondition = formData.condition === 'Other' ? formData.otherCondition : formData.condition;

        const submissionData: any = {
            ...formData,
            category: finalCategory,
            unit: finalUnit,
            condition: finalCondition,
            totalPrice,
            currency: 'ETB',
            materialType: type,
            image: imagePreview,
            createdAt: new Date().toISOString(),
        };

        // Handle the specific date field
        if (isFixed) {
            submissionData.warrantyDate = formData.dateField;
            submissionData.AC_decition = 'non'; // Requirement for fixed assets
        } else {
            submissionData.expiryDate = formData.dateField;
        }

        // Clean up internal state fields
        delete submissionData.otherCategory;
        delete submissionData.otherUnit;
        delete submissionData.otherCondition;
        delete submissionData.dateField;

        try {
            await addDoc(collection(db, "materials"), submissionData);
            setSubmitStatus({
                type: 'success',
                message: `${isFixed ? 'Fixed Asset' : 'Consumable'} Registered Successfully!`
            });

            // Reset form after success
            setFormData({
                materialName: '',
                materialCode: '',
                category: '',
                otherCategory: '',
                description: '',
                quantity: 1,
                unit: 'Piece',
                otherUnit: '',
                purchaseDate: '',
                vendorName: '',
                unitPrice: 0,
                storeLocation: '',
                shelfNumber: '',
                condition: 'New',
                otherCondition: '',
                dateField: '',
                responsiblePerson: '',
                serialNumber: '',
                remarks: '',
                tags: '',
            });
            setImagePreview(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (e) {
            console.error("Error adding document: ", e);
            setSubmitStatus({ type: 'error', message: 'Error registering material. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const themeClass = isFixed ? "emerald" : "blue";
    const gradient = isFixed ? "from-emerald-600 to-teal-600 shadow-emerald-500/30" : "from-blue-600 to-indigo-600 shadow-blue-500/30";

    return (
        <div className="max-w-6xl mx-auto">
            {/* Form Header Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
                <div className={`bg-gradient-to-r ${gradient} px-8 py-10 text-white relative`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FaBoxOpen className="text-9xl" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight drop-shadow-sm">
                        New {isFixed ? 'Asset' : 'Consumable'} Registration
                    </h2>
                    <p className={`text-${themeClass}-50 mt-2 text-lg font-medium max-w-2xl`}>
                        {isFixed
                            ? "Complete the secure protocol to register a new fixed asset into the institutional inventory."
                            : "Enter details to catalog new consumable items (stationery, supplies, or perishables)."}
                    </p>
                </div>
            </div>

            {submitStatus.message && (
                <div className={`mb-8 p-6 rounded-2xl flex items-center animate-in slide-in-from-top-4 duration-300 ${submitStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-100' : 'bg-red-50 text-red-800 border-2 border-red-100'}`}>
                    {submitStatus.type === 'success' ? <FaCheckCircle className="mr-4 text-2xl" /> : <FaTimes className="mr-4 text-2xl" />}
                    <span className="font-bold text-lg">{submitStatus.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                {/* 1. Material Information */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-200 flex items-center backdrop-blur-sm">
                        <span className={`bg-${themeClass}-100 text-${themeClass}-700 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mr-5 shadow-inner`}>
                            <FaBoxOpen />
                        </span>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Material Intelligence</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="materialName"
                                value={formData.materialName}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300`}
                                placeholder={isFixed ? "e.g. Precision Workstation 7920" : "e.g. A4 Paper Rim (80gsm)"}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">System Code <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="materialCode"
                                value={formData.materialCode}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300`}
                                placeholder={isFixed ? "FA-2024-001" : "CS-2024-001"}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none`}
                                >
                                    <option value="">Select Category</option>
                                    {isFixed ? (
                                        <>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Furniture">Furniture</option>
                                            <option value="Laboratory">Laboratory Equipment</option>
                                            <option value="Machinery">Machinery</option>
                                            <option value="Vehicle">Vehicle</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Stationery">Stationery</option>
                                            <option value="Cleaning">Cleaning Supplies</option>
                                            <option value="Medical">Medical Supplies</option>
                                            <option value="Food">Food & Beverage</option>
                                            <option value="Fuel">Fuel & Oil</option>
                                        </>
                                    )}
                                    <option value="Other">Other Category</option>
                                </select>
                            </div>
                            {formData.category === 'Other' && (
                                <input
                                    type="text"
                                    name="otherCategory"
                                    value={formData.otherCategory}
                                    onChange={handleChange}
                                    placeholder="Please specify"
                                    className={`mt-4 w-full px-5 py-3 bg-${themeClass}-50 border border-${themeClass}-200 rounded-xl outline-none font-bold text-${themeClass}-700 animate-in zoom-in-95`}
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Technical Disposition</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 resize-none`}
                                placeholder="Core specifications, model lineage, or functional requirements..."
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Quantity & Pricing */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-200 flex items-center backdrop-blur-sm">
                        <span className={`bg-${themeClass}-100 text-${themeClass}-700 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mr-5 shadow-inner`}>
                            <FaMoneyBillWave />
                        </span>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Economic Metrics</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-2 text-center">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Inventory Volume</label>
                            <input
                                type="number"
                                name="quantity"
                                min="1"
                                value={formData.quantity}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-black text-slate-700 text-center text-xl`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Metric Unit</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none`}
                            >
                                <option value="Piece">Piece</option>
                                <option value="Box">Box</option>
                                <option value="Set">Set</option>
                                {isFixed ? (
                                    <option value="Meter">Meter</option>
                                ) : (
                                    <>
                                        <option value="Pack">Pack</option>
                                        <option value="Rim">Rim</option>
                                        <option value="Litre">Litre</option>
                                    </>
                                )}
                                <option value="Kg">Kg</option>
                                <option value="Other">Other</option>
                            </select>
                            {formData.unit === 'Other' && (
                                <input
                                    type="text"
                                    name="otherUnit"
                                    value={formData.otherUnit}
                                    onChange={handleChange}
                                    placeholder="Specify"
                                    className={`mt-4 w-full px-5 py-3 bg-${themeClass}-50 border border-${themeClass}-200 rounded-xl outline-none font-bold text-${themeClass}-700 animate-in zoom-in-95`}
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Asset Value (ETB)</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">Br</span>
                                <input
                                    type="number"
                                    name="unitPrice"
                                    min="0"
                                    step="0.01"
                                    value={formData.unitPrice}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-black text-slate-700 text-xl`}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={`text-xs font-black text-${themeClass}-400 uppercase tracking-widest ml-1`}>Net Acquisition Cost</label>
                            <div className="relative">
                                <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-black text-${themeClass}-600`}>Br</span>
                                <div className={`w-full pl-12 pr-5 py-4 bg-${themeClass}-50/50 border-2 border-${themeClass}-100 rounded-2xl font-black text-${themeClass}-700 text-xl shadow-inner flex items-center`}>
                                    {totalPrice.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Acquisition & Location */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-200 flex items-center backdrop-blur-sm">
                        <span className={`bg-${themeClass}-100 text-${themeClass}-700 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mr-5 shadow-inner`}>
                            <FaWarehouse />
                        </span>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Station & Deployment</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Logistics Date</label>
                            <input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Vendor / Origin</label>
                            <input
                                type="text"
                                name="vendorName"
                                value={formData.vendorName}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                                placeholder="Originating supplier or vendor..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secure Location</label>
                            <input
                                type="text"
                                name="storeLocation"
                                value={formData.storeLocation}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                                placeholder="Asset station or warehouse block..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Coordinate ID (Shelf/Rack)</label>
                            <input
                                type="text"
                                name="shelfNumber"
                                value={formData.shelfNumber}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                                placeholder="Shelf sector or rack quadrant..."
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Condition & Visual Integrity */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-200 flex items-center backdrop-blur-sm">
                        <span className={`bg-${themeClass}-100 text-${themeClass}-700 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mr-5 shadow-inner`}>
                            <FaClipboardList />
                        </span>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Integrity & Custody</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Asset Integrity</label>
                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none`}
                            >
                                <option value="New">Protocol New</option>
                                <option value="Good">Operational (Good)</option>
                                <option value="Used">Iterated (Used)</option>
                                {isFixed && (
                                    <>
                                        <option value="Damaged">Compromised (Damaged)</option>
                                        <option value="Needs Repair">Maintenance Required</option>
                                    </>
                                )}
                                <option value="Other">Other Status</option>
                            </select>
                            {formData.condition === 'Other' && (
                                <input
                                    type="text"
                                    name="otherCondition"
                                    value={formData.otherCondition}
                                    onChange={handleChange}
                                    placeholder="Specify details..."
                                    className={`mt-4 w-full px-5 py-3 bg-${themeClass}-50 border border-${themeClass}-200 rounded-xl outline-none font-bold text-${themeClass}-700 animate-in zoom-in-95`}
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                {isFixed ? "Warranty Termination" : "Expiry Notification Date"}
                            </label>
                            <input
                                type="date"
                                name="dateField"
                                value={formData.dateField}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Chief Custodian</label>
                            <input
                                type="text"
                                name="responsiblePerson"
                                value={formData.responsiblePerson}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                                placeholder="Personnel in charge of asset..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Visual Capture</label>
                            <div className="flex flex-col items-center justify-center w-full">
                                {!imagePreview ? (
                                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-${themeClass}-50 hover:border-${themeClass}-400 transition-all group`}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FaCamera className={`w-8 h-8 mb-3 text-slate-300 group-hover:text-${themeClass}-500 transition-colors`} />
                                            <p className={`text-xs text-slate-400 group-hover:text-${themeClass}-600 font-black uppercase tracking-tighter transition-colors`}>Initialize Visual Capture</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                ) : (
                                    <div className="relative w-full h-48 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm group">
                                        <Image src={imagePreview} alt="Preview" fill style={{ objectFit: 'contain' }} />
                                        <button
                                            type="button"
                                            onClick={() => setImagePreview(null)}
                                            className="absolute top-3 right-3 bg-red-500 text-white rounded-xl p-2.5 hover:bg-red-600 shadow-lg transform active:scale-90 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Additional System Telemetry */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-200 flex items-center backdrop-blur-sm">
                        <span className={`bg-${themeClass}-100 text-${themeClass}-700 w-12 h-12 rounded-2xl flex items-center justify-center text-xl mr-5 shadow-inner`}>
                            <FaInfoCircle />
                        </span>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">System Telemetry</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{isFixed ? "Serial Protocol (S/N)" : "Optical Barcode"}</label>
                            <input
                                type="text"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                                placeholder="Electronic serial or barcode string..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Classification Tags</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                                placeholder="Separated,by,tags,for,indexing..."
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Observational Notes</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows={2}
                                className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-${themeClass}-500/10 focus:border-${themeClass}-500 focus:bg-white outline-none transition-all font-bold text-slate-700 resize-none`}
                                placeholder="Any tertiary observations or system notes..."
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="pt-10 flex flex-col sm:flex-row justify-end gap-6">
                    <button
                        type="button"
                        className="px-10 py-5 border-2 border-slate-200 text-slate-400 font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95"
                        onClick={() => window.history.back()}
                        disabled={isSubmitting}
                    >
                        Abort Registration
                    </button>
                    <button
                        type="submit"
                        className={`px-12 py-5 bg-gradient-to-r ${gradient} text-white font-black uppercase text-sm tracking-widest rounded-2xl hover:brightness-110 shadow-2xl transition-all active:scale-95 hover:-translate-y-1 flex items-center justify-center min-w-[280px] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <><FaSpinner className="animate-spin mr-3 text-xl" /> Finalizing...</> : `Commit ${isFixed ? 'Asset' : 'Item'} to Store`}
                    </button>
                </div>
            </form>
        </div>
    );
}
