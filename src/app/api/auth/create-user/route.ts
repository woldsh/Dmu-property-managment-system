import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        // Basic authorization check - you might want to enhance this
        // For example, verify an ID token from headers to ensure requester is an admin
        // For now, we'll assume the frontend handles protection or adds a token check here,
        // but mimicking the original open endpoint logic with a TODO note.

        // TODO: Add proper Admin Verification Middleware here if needed.

        const body = await req.json();
        const { email, password, displayName, role } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
        }

        const admin = initializeFirebaseAdmin();
        const db = admin.firestore();

        // Check if user already exists
        const usersRef = db.collection('users');
        const existingUser = await usersRef.where('email', '==', email).get();

        if (!existingUser.empty) {
            return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
        }

        // Create user in Firestore
        const userData = {
            email,
            password, // In production, hash this password! Original backend stored it plain/as-is?
            // WARNING: Storing passwords in Firestore is bad practice. 
            // Ideally use Firebase Auth `admin.auth().createUser()` but matching original logic for now.
            displayName: displayName || '',
            role: role || 'user',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await usersRef.add(userData);

        return NextResponse.json({
            success: true,
            data: {
                id: docRef.id,
                email,
                displayName: displayName || '',
                role: role || 'user',
            },
            message: 'User created successfully in users collection',
        });

    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to create user'
        }, { status: 500 });
    }
}
