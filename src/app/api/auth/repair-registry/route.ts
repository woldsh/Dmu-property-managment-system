import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const oldEmail = searchParams.get('oldEmail');
    const newEmail = searchParams.get('newEmail');

    if (!oldEmail || !newEmail) {
        return NextResponse.json({
            error: 'Parameters "oldEmail" and "newEmail" are required.'
        }, { status: 400 });
    }

    try {
        const admin = initializeFirebaseAdmin();
        const authAdmin = admin.auth();
        const db = admin.firestore();

        // 1. Find the current Auth user (New Email)
        let authUser;
        try {
            authUser = await authAdmin.getUserByEmail(newEmail);
        } catch (e: any) {
            return NextResponse.json({
                error: `User not found in Auth with email: ${newEmail}. Ensure you updated the email successfully first.`
            }, { status: 404 });
        }

        const uid = authUser.uid;

        // 2. Search for records under OLD email
        const adminsOldQuery = await db.collection('admins').where('email', '==', oldEmail).get();
        const usersOldQuery = await db.collection('users').where('email', '==', oldEmail).get();

        const batch = db.batch();
        let fixCount = 0;

        // Move/Sync Admin Records
        adminsOldQuery.forEach(doc => {
            const data = doc.data();
            // Create/Update doc at UID
            batch.set(db.collection('admins').doc(uid), {
                ...data,
                email: newEmail,
                uid: uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Delete old record if ID was not UID
            if (doc.id !== uid) {
                batch.delete(doc.ref);
            }
            fixCount++;
        });

        // Move/Sync User Records
        usersOldQuery.forEach(doc => {
            const data = doc.data();
            batch.set(db.collection('users').doc(uid), {
                ...data,
                email: newEmail,
                uid: uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            if (doc.id !== uid) {
                batch.delete(doc.ref);
            }
            fixCount++;
        });

        if (fixCount === 0) {
            return NextResponse.json({
                success: false,
                message: `No records found in Firestore for old email: ${oldEmail}. Check for typos or verify the collection in Firebase Console.`
            });
        }

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `Successfully migrated ${fixCount} records for ${newEmail}. UID: ${uid}. You can now attempt to log in.`,
            uid
        });

    } catch (error: any) {
        console.error('Repair Registry error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
