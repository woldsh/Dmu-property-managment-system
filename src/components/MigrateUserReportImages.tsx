'use client';

import { useState } from 'react';
import { db } from '../lib/firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from 'firebase/firestore';

export default function MigrateUserReportImages() {
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<string[]>([]);

    const runMigration = async () => {
        setIsRunning(true);
        setStatus('Starting migration...');
        setResults([]);

        try {
            if (!db) throw new Error("Firebase not initialized");
            // Get all User_reports entries
            const userReportsSnapshot = await getDocs(collection(db!, 'User_reports'));
            const totalReports = userReportsSnapshot.size;
            setProgress({ current: 0, total: totalReports });
            setStatus(`Found ${totalReports} User_reports entries to process`);

            let updated = 0;
            let skipped = 0;
            let errors = 0;

            for (let i = 0; i < userReportsSnapshot.docs.length; i++) {
                const reportDoc = userReportsSnapshot.docs[i];
                const reportData = reportDoc.data();

                setProgress({ current: i + 1, total: totalReports });

                // Skip if already has an image
                if (reportData.materialImage) {
                    skipped++;
                    setResults(prev => [...prev, `✓ Skipped ${reportData.materialName} - already has image`]);
                    continue;
                }

                try {
                    // Get the original request
                    const requestDoc = await getDoc(doc(db!, 'Request_materials', reportData.requestId));

                    if (!requestDoc.exists()) {
                        errors++;
                        setResults(prev => [...prev, `✗ Error: Request ${reportData.requestId} not found`]);
                        continue;
                    }

                    const requestData = requestDoc.data();

                    // Find the matching material item
                    const matchingItem = requestData.items?.find(
                        (item: any) => item.materialId === reportData.materialId
                    );

                    if (matchingItem && matchingItem.image) {
                        // Update the User_reports with the image
                        await updateDoc(doc(db!, 'User_reports', reportDoc.id), {
                            materialImage: matchingItem.image
                        });
                        updated++;
                        setResults(prev => [...prev, `✓ Updated ${reportData.materialName} with image`]);
                    } else {
                        skipped++;
                        setResults(prev => [...prev, `○ ${reportData.materialName} - no image in source`]);
                    }
                } catch (error) {
                    errors++;
                    setResults(prev => [...prev, `✗ Error processing ${reportData.materialName}: ${error}`]);
                    console.error(`Error processing report ${reportDoc.id}:`, error);
                }
            }

            setStatus(`Migration complete! Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
        } catch (error) {
            setStatus(`Migration failed: ${error}`);
            console.error('Migration error:', error);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-6">
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-lg">
                <h1 className="text-3xl font-black text-slate-800 mb-2">User_reports Image Migration</h1>
                <p className="text-slate-600 mb-6">
                    This tool will update all existing User_reports entries with material images from their original requests.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={runMigration}
                        disabled={isRunning}
                        className={`w-full py-4 px-6 rounded-2xl font-black uppercase text-sm tracking-wider transition-all ${isRunning
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-teal-600 text-white hover:bg-teal-500 shadow-lg hover:shadow-xl active:scale-95'
                            }`}
                    >
                        {isRunning ? 'Migration Running...' : 'Start Migration'}
                    </button>

                    {status && (
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                            <p className="font-bold text-slate-700">{status}</p>
                            {progress.total > 0 && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                                        <span>Progress</span>
                                        <span>{progress.current} / {progress.total}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="bg-slate-900 rounded-2xl p-6 max-h-96 overflow-y-auto">
                            <h3 className="text-white font-bold mb-3">Migration Log:</h3>
                            <div className="space-y-1 font-mono text-xs">
                                {results.map((result, idx) => (
                                    <div
                                        key={idx}
                                        className={`${result.startsWith('✓')
                                            ? 'text-emerald-400'
                                            : result.startsWith('✗')
                                                ? 'text-red-400'
                                                : 'text-slate-400'
                                            }`}
                                    >
                                        {result}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                <h3 className="font-black text-amber-900 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Important Notes
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                    <li>This migration is safe and can be run multiple times</li>
                    <li>Entries that already have images will be skipped</li>
                    <li>Only entries with matching materials in Request_materials will be updated</li>
                    <li>The migration runs in the browser and may take a few moments</li>
                </ul>
            </div>
        </div>
    );
}
