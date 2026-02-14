import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, displayName, role, firstName, lastName, ...otherData } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
        }

        const admin = initializeFirebaseAdmin();
        const auth = admin.auth();
        const db = admin.firestore();

        // 1. Create user in Firebase Auth
        let userRecord;
        try {
            userRecord = await auth.createUser({
                email,
                password,
                displayName: displayName || `${firstName || ''} ${lastName || ''}`.trim(),
            });
        } catch (authError: any) {
            console.error('Auth creation error:', authError);
            if (authError.code === 'auth/email-already-in-use') {
                return NextResponse.json({ success: false, error: 'Email is already registered.' }, { status: 400 });
            }
            throw authError;
        }

        // 2. Create user document in Firestore users collection
        const userData = {
            uid: userRecord.uid,
            email,
            displayName: displayName || `${firstName || ''} ${lastName || ''}`.trim(),
            firstName: firstName || '',
            lastName: lastName || '',
            userRole: role || body.userRole || 'user',
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            ...otherData
        };

        await db.collection('users').doc(userRecord.uid).set(userData);

        return NextResponse.json({
            success: true,
            data: {
                id: userRecord.uid,
                email,
                displayName: userData.displayName,
                role: userData.userRole,
            },
            message: 'User created successfully in Auth and Firestore',
        });

    } catch (error: any) {
        console.error('Error in create-user API:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to create user'
        }, { status: 500 });
    }
}
