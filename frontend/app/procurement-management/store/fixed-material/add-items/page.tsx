'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../../../../src/components/Header';
import StoreFixedSidebar from '../../../../../src/components/StoreFixedSidebar';
import { SidebarProvider } from '../../../../../src/contexts/SidebarContext';
import Image from 'next/image';
import { db } from '../../../../../src/lib/firebase';
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

export default function AddFixedAssetPage() {
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
        warrantyDate: '',
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

        const submissionData = {
            ...formData,
            category: finalCategory,
            unit: finalUnit,
            condition: finalCondition,
            totalPrice,
            currency: 'ETB',
            materialType: 'fixed_asset',
            image: imagePreview,
            createdAt: new Date().toISOString(),
        };

        delete (submissionData as any).otherCategory;
        delete (submissionData as any).otherUnit;
        delete (submissionData as any).otherCondition;

        try {
            await addDoc(collection(db, "materials"), submissionData);
            console.log('Document written with ID: ', submissionData);
            setSubmitStatus({ type: 'success', message: 'Material Registered Successfully!' });

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
                warrantyDate: '',
                responsiblePerson: '',
                serialNumber: '',
                remarks: '',
                tags: '',
            });
            setImagePreview(null);
            window.scrollTo(0, 0);

        } catch (e) {
            console.error("Error adding document: ", e);
            setSubmitStatus({ type: 'error', message: 'Error registering material. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
                <StoreFixedSidebar />

                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header title="Register Fixed Asset" subtitle="Store Management" />

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-6xl mx-auto">

                            {/* Form Header Card */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-8 text-white relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <FaBoxOpen className="text-9xl" />
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight">New Asset Registration</h2>
                                    <p className="text-emerald-100 mt-2 text-lg">Enter details to register a new fixed asset into the inventory system.</p>
                                </div>
                            </div>

                            {submitStatus.message && (
                                <div className={`mb-6 p-4 rounded-xl flex items-center ${submitStatus.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                    {submitStatus.type === 'success' ? <FaCheckCircle className="mr-3 text-xl" /> : <FaTimes className="mr-3 text-xl" />}
                                    <span className="font-semibold">{submitStatus.message}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* 1. Material Information */}
                                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center">
                                        <span className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-lg flex items-center justify-center text-lg mr-4 shadow-sm">
                                            <FaBoxOpen />
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-800">Material Information</h3>
                                    </div>
                                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Material Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="materialName"
                                                value={formData.materialName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                placeholder="e.g. Dell Latitude 5420"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Material Code / ID <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="materialCode"
                                                value={formData.materialCode}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                placeholder="e.g. FA-2024-001"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Category / Type</label>
                                            <div className="relative">
                                                <select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium appearance-none"
                                                >
                                                    <option value="">Select Category</option>
                                                    <option value="Electronics">Electronics</option>
                                                    <option value="Furniture">Furniture</option>
                                                    <option value="Laboratory">Laboratory Equipment</option>
                                                    <option value="Machinery">Machinery</option>
                                                    <option value="Vehicle">Vehicle</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                            {formData.category === 'Other' && (
                                                <input
                                                    type="text"
                                                    name="otherCategory"
                                                    value={formData.otherCategory}
                                                    onChange={handleChange}
                                                    placeholder="Specify Category"
                                                    className="mt-3 w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-emerald-50/50 text-emerald-800"
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                placeholder="Detailed specifications, model numbers, etc..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Quantity & Pricing */}
                                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center">
                                        <span className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-lg flex items-center justify-center text-lg mr-4 shadow-sm">
                                            <FaMoneyBillWave />
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-800">Quantity & Pricing</h3>
                                    </div>
                                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                min="1"
                                                value={formData.quantity}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Unit</label>
                                            <div className="relative">
                                                <select
                                                    name="unit"
                                                    value={formData.unit}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium appearance-none"
                                                >
                                                    <option value="Piece">Piece</option>
                                                    <option value="Set">Set</option>
                                                    <option value="Box">Box</option>
                                                    <option value="Kg">Kg</option>
                                                    <option value="Meter">Meter</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                            {formData.unit === 'Other' && (
                                                <input
                                                    type="text"
                                                    name="otherUnit"
                                                    value={formData.otherUnit}
                                                    onChange={handleChange}
                                                    placeholder="Specify Unit"
                                                    className="mt-3 w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-emerald-50/50 text-emerald-800"
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Unit Price (ETB)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold">Br</span>
                                                <input
                                                    type="number"
                                                    name="unitPrice"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.unitPrice}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-emerald-700 mb-2">Total Price (ETB)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 font-bold">Br</span>
                                                <input
                                                    type="text"
                                                    value={totalPrice.toLocaleString()}
                                                    disabled
                                                    className="w-full pl-12 pr-4 py-3 border-2 border-emerald-100 bg-emerald-50 rounded-lg text-emerald-700 font-bold text-lg cursor-not-allowed shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Acquisition & Location */}
                                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center">
                                        <span className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-lg flex items-center justify-center text-lg mr-4 shadow-sm">
                                            <FaWarehouse />
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-800">Acquisition & Location</h3>
                                    </div>
                                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Acquisition Date</label>
                                            <input
                                                type="date"
                                                name="purchaseDate"
                                                value={formData.purchaseDate}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Supplier / Vendor</label>
                                            <input
                                                type="text"
                                                name="vendorName"
                                                value={formData.vendorName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                placeholder="e.g. ABC Electronics Ltd."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Store / Department</label>
                                            <input
                                                type="text"
                                                name="storeLocation"
                                                value={formData.storeLocation}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                placeholder="e.g. Main Warehouse, Block A"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Shelf / Rack No.</label>
                                            <input
                                                type="text"
                                                name="shelfNumber"
                                                value={formData.shelfNumber}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                placeholder="e.g. R-12, Shelf 3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Condition & Responsibility */}
                                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center">
                                        <span className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-lg flex items-center justify-center text-lg mr-4 shadow-sm">
                                            <FaClipboardList />
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-800">Status & Responsibility</h3>
                                    </div>
                                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Condition</label>
                                            <div className="relative">
                                                <select
                                                    name="condition"
                                                    value={formData.condition}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium appearance-none"
                                                >
                                                    <option value="New">New</option>
                                                    <option value="Good">Good</option>
                                                    <option value="Used">Used</option>
                                                    <option value="Damaged">Damaged</option>
                                                    <option value="Needs Repair">Needs Repair</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                            {formData.condition === 'Other' && (
                                                <input
                                                    type="text"
                                                    name="otherCondition"
                                                    value={formData.otherCondition}
                                                    onChange={handleChange}
                                                    placeholder="Specify Condition"
                                                    className="mt-3 w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-emerald-50/50 text-emerald-800"
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Warranty Expiry</label>
                                            <input
                                                type="date"
                                                name="warrantyDate"
                                                value={formData.warrantyDate}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Responsible Person</label>
                                            <input
                                                type="text"
                                                name="responsiblePerson"
                                                value={formData.responsiblePerson}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                placeholder="Staff Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Material Image</label>
                                            <div className="flex flex-col items-center justify-center w-full">
                                                {!imagePreview ? (
                                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 transition-all group">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <FaCamera className="w-8 h-8 mb-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                                            <p className="text-sm text-slate-500 group-hover:text-emerald-600 font-semibold transition-colors">Click to upload photo</p>
                                                        </div>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                    </label>
                                                ) : (
                                                    <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm group">
                                                        <Image src={imagePreview} alt="Preview" fill style={{ objectFit: 'contain' }} />
                                                        <button
                                                            type="button"
                                                            onClick={() => setImagePreview(null)}
                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transform active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Additional Details */}
                                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center">
                                        <span className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-lg flex items-center justify-center text-lg mr-4 shadow-sm">
                                            <FaInfoCircle />
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-800">Additional Details</h3>
                                    </div>
                                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Serial Number / Barcode</label>
                                            <input
                                                type="text"
                                                name="serialNumber"
                                                value={formData.serialNumber}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                placeholder="e.g. SN-987654321"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Custom Tags</label>
                                            <input
                                                type="text"
                                                name="tags"
                                                value={formData.tags}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                placeholder="e.g. Priority, Fragile, Dept-A"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Remarks / Notes</label>
                                            <textarea
                                                name="remarks"
                                                value={formData.remarks}
                                                onChange={handleChange}
                                                rows={2}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-slate-50 focus:bg-white font-medium"
                                                placeholder="Any other relevant information..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="pt-6 flex justify-end gap-4 pb-12">
                                    <button
                                        type="button"
                                        className="px-8 py-3 border-2 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95"
                                        onClick={() => window.history.back()}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`px-10 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transform transition-all active:scale-95 hover:-translate-y-0.5 flex items-center justify-center min-w-[200px] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <><FaSpinner className="animate-spin mr-2" /> Processing...</> : 'Register Asset'}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
