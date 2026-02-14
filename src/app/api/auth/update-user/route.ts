import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { uid, email, password, displayName, firstName, lastName } = body;

        if (!uid) {
            return NextResponse.json({ success: false, error: 'User UID is required' }, { status: 400 });
        }

        const admin = initializeFirebaseAdmin();
        const auth = admin.auth();
        const db = admin.firestore();

        const updateData: any = {};
        if (email) updateData.email = email;
        if (password) updateData.password = password;
        if (displayName) updateData.displayName = displayName;
        else if (firstName || lastName) {
            // If individual names provided, construct display name if not explicitly given
            updateData.displayName = `${firstName || ''} ${lastName || ''}`.trim();
        }

        // 1. Update user in Firebase Auth
        if (Object.keys(updateData).length > 0) {
            await auth.updateUser(uid, updateData);
        }

        // 2. Update user document in Firestore users collection
        const firestoreData: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (email) firestoreData.email = email;
        if (displayName || firstName || lastName) {
            firestoreData.displayName = updateData.displayName;
            if (firstName) firestoreData.firstName = firstName;
            if (lastName) firestoreData.lastName = lastName;
        }

        await db.collection('users').doc(uid).update(firestoreData);

        return NextResponse.json({
            success: true,
            message: 'User updated successfully in Auth and Firestore',
        });

    } catch (error: any) {
        console.error('Error in update-user API:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to update user'
        }, { status: 500 });
    }
}
