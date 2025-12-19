import dotenv from 'dotenv';
import { initializeFirebaseAdmin } from '../config/firebase-admin';
import admin from 'firebase-admin';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
initializeFirebaseAdmin();

const db = admin.firestore();

// Admin credentials from environment variables or command line args
const ADMIN_EMAIL = process.argv[2] || process.env.ADMIN_EMAIL || 'shikur@gmail.com';
const ADMIN_PASSWORD = process.argv[3] || process.env.ADMIN_PASSWORD || 'shikur3828';

/**
 * Add admin user to Firestore admins collection
 */
async function addAdminToFirestore() {
  try {
    console.log('Adding admin to Firestore...');
    console.log(`Email: ${ADMIN_EMAIL}`);

    const adminsRef = db.collection('admins');
    
    // Check if admin already exists
    const existingAdmin = await adminsRef.where('email', '==', ADMIN_EMAIL).get();
    
    if (!existingAdmin.empty) {
      // Update existing admin
      const docId = existingAdmin.docs[0].id;
      await adminsRef.doc(docId).update({
        password: ADMIN_PASSWORD,
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Admin updated successfully in Firestore');
      console.log(`   Document ID: ${docId}`);
    } else {
      // Create new admin
      const docRef = await adminsRef.add({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: '',
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Admin added successfully to Firestore');
      console.log(`   Document ID: ${docRef.id}`);
    }

    console.log('✅ Admin setup complete!');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Role: admin`);
    console.log(`   Collection: admins`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding admin to Firestore:', error);
    process.exit(1);
  }
}

// Run the script
addAdminToFirestore();

