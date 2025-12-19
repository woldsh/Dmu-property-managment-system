import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebaseAdmin } from './config/firebase-admin';
import imageRoutes from './routes/images';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'Property Management System API' });
});

// Image routes
app.use('/api/images', imageRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

