import dotenv from 'dotenv';
import path from 'path';
import { initializeFirebaseAdmin } from '../config/firebase-admin';
import admin from 'firebase-admin';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'shikur@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'shikur3828';

/**
 * Create admin user in Firebase Auth
 */
async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    console.log(`Email: ${ADMIN_EMAIL}`);

    // Check if user already exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log('User already exists with UID:', userRecord.uid);
      
      // Update existing user to ensure password is set
      userRecord = await admin.auth().updateUser(userRecord.uid, {
        password: ADMIN_PASSWORD,
        emailVerified: true,
      });
      console.log('✅ Admin user password updated successfully');
    } catch (error: any) {
      // User doesn't exist, create new user
      if (error.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          emailVerified: true,
          disabled: false,
        });
        console.log('✅ Admin user created successfully with UID:', userRecord.uid);
      } else {
        throw error;
      }
    }

    // Set custom claims for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin',
    });

    console.log('✅ Admin custom claims set successfully');
    console.log('✅ Admin user setup complete!');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Role: admin`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    
    // Check for permission errors
    if (error.code === 'auth/internal-error' || error.code === 'auth/permission-denied') {
      console.error('\n⚠️  Permission Error Detected!');
      console.error('\nThe service account needs proper IAM permissions.');
      console.error('\nPlease follow these steps:');
      console.error('1. Go to: https://console.developers.google.com/iam-admin/iam/project?project=property-management-syst-1c6c0');
      console.error('2. Find your service account (firebase-adminsdk-fbsvc@...)');
      console.error('3. Add role: "Service Usage Consumer" (roles/serviceusage.serviceUsageConsumer)');
      console.error('4. Wait 2-3 minutes for permissions to propagate');
      console.error('5. Run this script again\n');
      console.error('OR create the user manually in Firebase Console:');
      console.error('https://console.firebase.google.com/project/property-management-syst-1c6c0/authentication/users\n');
    }
    
    process.exit(1);
  }
}

// Run the script
createAdminUser();

