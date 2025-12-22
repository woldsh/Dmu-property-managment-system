import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { idToken } = body;

        if (!idToken) {
            return NextResponse.json({ success: false, error: 'ID token is required' }, { status: 400 });
        }

        const admin = initializeFirebaseAdmin();
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const user = await admin.auth().getUser(decodedToken.uid);

        return NextResponse.json({
            success: true,
            data: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified,
                customClaims: user.customClaims,
            },
        });

    } catch (error: any) {
        console.error('Error verifying token:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to verify token'
        }, { status: 401 });
    }
}
