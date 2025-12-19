import express, { Request, Response } from 'express';
import admin from 'firebase-admin';
import { ApiResponse } from '../types';

const router = express.Router();

/**
 * POST /api/auth/create-user
 * Create a new user in Firestore (admin only)
 */
router.post('/create-user', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName, role } = req.body;

    if (!email || !password) {
      const response: ApiResponse = {
        success: false,
        error: 'Email and password are required',
      };
      return res.status(400).json(response);
    }

    // Get Firestore instance inside the handler to ensure app is initialized
    const db = admin.firestore();

    // Check if user already exists in users collection
    const usersRef = db.collection('users');
    const existingUser = await usersRef.where('email', '==', email).get();

    if (!existingUser.empty) {
      const response: ApiResponse = {
        success: false,
        error: 'User with this email already exists',
      };
      return res.status(400).json(response);
    }

    // Create user document in Firestore users collection
    const userData = {
      email,
      password, // In production, hash this password!
      displayName: displayName || '',
      role: role || 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await usersRef.add(userData);

    const response: ApiResponse = {
      success: true,
      data: {
        id: docRef.id,
        email,
        displayName: displayName || '',
        role: role || 'user',
      },
      message: 'User created successfully in users collection',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error creating user:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to create user',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/auth/verify-token
 * Verify a Firebase ID token
 */
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      const response: ApiResponse = {
        success: false,
        error: 'ID token is required',
      };
      return res.status(400).json(response);
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);

    const response: ApiResponse = {
      success: true,
      data: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        customClaims: user.customClaims,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error verifying token:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to verify token',
    };
    res.status(401).json(response);
  }
});

export default router;
