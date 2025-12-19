import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Firebase Admin SDK configuration
const projectId = process.env.FIREBASE_PROJECT_ID || "property-management-syst-1c6c0";

// Initialize Firebase Admin
let initialized = false;

export const initializeFirebaseAdmin = () => {
  if (!initialized) {
    try {
      // Check if Firebase Admin is already initialized
      if (admin.apps.length === 0) {
        // Try to use service account key file from backend directory
        const fs = require('fs');
        
        // Resolve paths - handle both compiled (dist) and development (src) scenarios
        // First try process.cwd() (for scripts run from backend directory)
        const cwdPath = path.join(process.cwd(), 'serviceAccountKey.json');
        
        // Also try relative to __dirname (for different execution contexts)
        const baseDir = __dirname.replace(/[\\/]dist[\\/]config|[\\/]src[\\/]config/, '');
        const serviceAccountPath = path.join(baseDir, 'serviceAccountKey.json');
        const serviceAccountPathAlt = path.join(baseDir, 'serviceAccountKey.json.json');
        
        let serviceAccountData = null;
        
        // Try to find service account key file in order of priority
        if (fs.existsSync(cwdPath)) {
          serviceAccountData = require(cwdPath);
          console.log('Found service account key at:', cwdPath);
        } else if (fs.existsSync(serviceAccountPath)) {
          serviceAccountData = require(serviceAccountPath);
          console.log('Found service account key at:', serviceAccountPath);
        } else if (fs.existsSync(serviceAccountPathAlt)) {
          serviceAccountData = require(serviceAccountPathAlt);
          console.log('Found service account key at:', serviceAccountPathAlt);
        }
        
        if (serviceAccountData) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountData),
            projectId: projectId,
          });
          console.log('Firebase Admin initialized with service account key');
        } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          // Use environment variable if set
          admin.initializeApp({
            projectId: projectId,
          });
          console.log('Firebase Admin initialized with GOOGLE_APPLICATION_CREDENTIALS');
        } else {
          // Fallback to project ID only (requires Application Default Credentials)
          admin.initializeApp({
            projectId: projectId,
          });
          console.log('Firebase Admin initialized with project ID');
        }
      }
      initialized = true;
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }
  return admin;
};

export default admin;

