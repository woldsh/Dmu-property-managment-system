import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    console.log('API: /api/auth/update-email called');
    try {
        const body = await req.json();
        const { idToken, newEmail } = body;

        if (!idToken || !newEmail) {
            return NextResponse.json(
                { success: false, error: 'ID token and new email are required.' },
                { status: 400 }
            );
        }

        // Initialize Admin SDK
        const admin = initializeFirebaseAdmin();

        // Check if Admin SDK is actually authorized (has credentials)
        // If initialized with just Project ID (client-like), it can't verify tokens or update users.
        // There is no easy way to check checking .app options, but if we try an op and it fails...

        const authAdmin = admin.auth();
        const db = admin.firestore();

        // 1. Verify the ID token to get the user's UID
        let decodedToken;
        try {
            decodedToken = await authAdmin.verifyIdToken(idToken);
        } catch (verifyError: any) {
            console.error('Token verification failed:', verifyError);
            // Specific check for missing credentials error which usually manifests as an internal error or similar
            // But usually 'verifyIdToken' requires a service account.

            return NextResponse.json(
                { success: false, error: 'Invalid session or missing server configuration. ' + (verifyError.message || '') },
                { status: 401 }
            );
        }

        const uid = decodedToken.uid;
        const oldEmail = decodedToken.email; // The email associated with the token before update

        // 2. Update the email in Firebase Authentication
        try {
            await authAdmin.updateUser(uid, {
                email: newEmail,
                emailVerified: true // Force verify since admin changed it
            });
        } catch (authError: any) {
            console.error('Firebase Auth email update failed:', authError);
            if (authError.code === 'auth/email-already-exists') {
                return NextResponse.json(
                    { success: false, error: 'This email is already in use by another account.' },
                    { status: 400 }
                );
            }
            if (authError.code === 'auth/invalid-email') {
                return NextResponse.json(
                    { success: false, error: 'The email address is not valid.' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { success: false, error: authError.message || 'Failed to update email in authentication.' },
                { status: 500 }
            );
        }

        // 3. Update the email in the Firestore 'users' collection
        try {
            // Update by UID
            const userDocRef = db.collection('users').doc(uid);
            await userDocRef.update({
                email: newEmail,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }).catch(() => console.log('UID-based user update skipped (doc might not exist)'));

            // Robustness: Cleanup records with old email (in case they weren't indexed by UID)
            if (oldEmail) {
                const oldEmailQuery = await db.collection('users').where('email', '==', oldEmail).get();
                const batch = db.batch();
                oldEmailQuery.forEach(doc => {
                    batch.update(doc.ref, {
                        email: newEmail,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                });
                await batch.commit();
            }
        } catch (firestoreError: any) {
            console.warn('Firestore users update failed (non-critical):', firestoreError);
        }

        // 4. Update the email in the Firestore 'admins' collection
        try {
            // Update by UID
            const adminDocRef = db.collection('admins').doc(uid);
            const adminDoc = await adminDocRef.get();
            if (adminDoc.exists) {
                await adminDocRef.update({
                    email: newEmail,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            // Robustness: Cleanup records with old email (critical for admin login)
            if (oldEmail) {
                const oldEmailQuery = await db.collection('admins').where('email', '==', oldEmail).get();
                const batch = db.batch();
                oldEmailQuery.forEach(doc => {
                    batch.update(doc.ref, {
                        email: newEmail,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                });
                await batch.commit();
            }
        } catch (adminError: any) {
            console.warn('Firestore admins update failed (non-critical):', adminError);
        }

        return NextResponse.json({
            success: true,
            message: 'Email updated successfully. Please log in again.',
        });

    } catch (error: any) {
        console.error('Update email API error:', error);

        // Basic detection if it's a credential issue
        const isCredentialError = error.message?.includes('credential') || error.code?.includes('credential');

        return NextResponse.json(
            {
                success: false,
                error: isCredentialError
                    ? 'Server missing Service Account Key. Cannot perform immediate update.'
                    : (error.message || 'An unexpected error occurred.')
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    return NextResponse.json({ status: 'API endpoint reachable' });
}
