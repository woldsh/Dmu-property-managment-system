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

                // 1. Try Environment Variables (Best for Vercel/Production)
                if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
                    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                        projectId: projectId,
                    });
                    console.log('Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT_KEY env var');
                    initialized = true;
                    return admin;
                }

                // 2. Try Local File (Best for Local Dev)
                // We use process.env.NODE_ENV check to avoid dynamic require in production builds
                if (process.env.NODE_ENV === 'development') {
                    const possiblePaths = [
                        path.join(process.cwd(), 'serviceAccountKey.json'),
                        path.join(process.cwd(), '..', 'serviceAccountKey.json'),
                    ];

                    let serviceAccountData = null;

                    for (const p of possiblePaths) {
                        if (fs.existsSync(p)) {
                            try {
                                // Using eval('require') is a common hack to prevent bundlers like Webpack/Turbopack 
                                // from trying to resolve the dependency at build time.
                                const dynamicRequire = eval('require');
                                serviceAccountData = dynamicRequire(p);
                                console.log('Found service account key at:', p);
                                break;
                            } catch (e) {
                                console.error("Error reading service account from", p, e);
                            }
                        }
                    }

                    if (serviceAccountData) {
                        admin.initializeApp({
                            credential: admin.credential.cert(serviceAccountData),
                            projectId: projectId,
                        });
                        console.log('Firebase Admin initialized with service account key file');
                        initialized = true;
                        return admin;
                    }
                }

                // 3. Fallback to ADC or Project ID
                if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                    admin.initializeApp({
                        projectId: projectId,
                    });
                    console.log('Firebase Admin initialized with GOOGLE_APPLICATION_CREDENTIALS');
                } else {
                    admin.initializeApp({
                        projectId: projectId,
                    });
                    console.log('Firebase Admin initialized with project ID');
                }
            }
            initialized = true;
        } catch (error) {
            console.error('Error initializing Firebase Admin:', error);
        }
    }
    return admin;
};

// Initialize on import if possible/safe, or let caller do it.
// Ideally usage should be: initializeFirebaseAdmin().firestore()
// But to keep it simple we can try to init right away if env vars are present.
// For now, we export the function.

export default admin;
