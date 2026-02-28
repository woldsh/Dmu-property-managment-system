import "server-only";
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Firebase Admin SDK configuration
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "property-management-syst-1c6c0";

// Initialize Firebase Admin
let initialized = false;

export const initializeFirebaseAdmin = () => {
    if (!initialized) {
        try {
            // Check if Firebase Admin is already initialized
            if (admin.apps.length === 0) {
                let credential = null;

                // 1. Try Environment Variables (Best for Vercel/Production)
                if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
                    try {
                        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                        credential = admin.credential.cert(serviceAccount);
                        console.log('Firebase Admin: Using FIREBASE_SERVICE_ACCOUNT_KEY env var');
                    } catch (e) {
                        console.error('Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var', e);
                    }
                }

                // 2. Try Local File (Best for Local Dev or if file is present)
                if (!credential) {
                    const possiblePaths = [
                        path.join(process.cwd(), 'serviceAccountKey.json'),
                        path.join(process.cwd(), '..', 'serviceAccountKey.json'),
                        // Add common locations if needed
                    ];

                    for (const p of possiblePaths) {
                        if (fs.existsSync(p)) {
                            try {
                                // Using eval('require') or fs.readFileSync
                                const fileContent = fs.readFileSync(p, 'utf8');
                                const serviceAccountData = JSON.parse(fileContent);
                                credential = admin.credential.cert(serviceAccountData);
                                console.log('Firebase Admin: Using service account key file at:', p);
                                break;
                            } catch (e) {
                                console.error("Firebase Admin: Error reading service account from", p, e);
                            }
                        }
                    }
                }

                // 3. Last Resort: ADC or just Project ID (may fail if no credentials found)
                if (credential) {
                    admin.initializeApp({
                        credential: credential,
                        projectId: projectId,
                    });
                } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                    admin.initializeApp({
                        projectId: projectId,
                    });
                    console.log('Firebase Admin: Initialized with GOOGLE_APPLICATION_CREDENTIALS');
                } else {
                    // This is where it was failing with "Could not load the default credentials"
                    // because it tries to fetch ADC if no credential property is provided.
                    console.warn('Firebase Admin: No explicit credentials found. Attempting to initialize with project ID only (may fail).');
                    admin.initializeApp({
                        projectId: projectId,
                    });
                }
            }
            initialized = true;
        } catch (error) {
            console.error('Error initializing Firebase Admin:', error);
            // Re-throw if it's a critical failure during the first initialization attempt
            throw error;
        }
    }
    return admin;
};

// Initialize on import if possible/safe, or let caller do it.
// Ideally usage should be: initializeFirebaseAdmin().firestore()
// But to keep it simple we can try to init right away if env vars are present.
// For now, we export the function.

export default admin;
