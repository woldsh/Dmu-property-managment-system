# Property Management System

A full-stack property management system built with Next.js frontend and Express.js backend, integrated with Firebase.

## Project Structure

```
property-management-system/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app router pages
│   ├── src/          # Source files
│   │   └── lib/      # Firebase configuration
│   └── package.json  # Frontend dependencies
│
└── backend/          # Express.js backend server
    ├── src/          # Backend source code
    │   ├── config/   # Configuration files
    │   └── index.ts  # Entry point
    └── package.json  # Backend dependencies
```

## Firebase Integration

This project uses Firebase for:
- Authentication (Firebase Auth)
- Database (Cloud Firestore)
- Analytics (Firebase Analytics)

**Note**: Image storage is handled by Cloudinary, not Firebase Storage.

### Firebase Configuration

The Firebase configuration is integrated in:
- **Frontend**: `frontend/src/lib/firebase.ts` - Firebase Client SDK
- **Backend**: `backend/src/config/firebase-admin.ts` - Firebase Admin SDK

## Cloudinary Integration

This project uses Cloudinary for:
- Image storage and management
- Image optimization and transformations

### Cloudinary Configuration

The Cloudinary configuration is integrated in:
- **Frontend**: `frontend/src/lib/cloudinary.ts` - Cloudinary Client SDK (with upload preset)
- **Backend**: `backend/src/config/cloudinary.ts` - Cloudinary Server SDK

### Image Upload Methods

**Frontend:**
- Direct upload using upload preset (recommended for client-side)
- Upload via backend API (`/api/images/upload`)

**Backend:**
- Upload endpoint: `POST /api/images/upload`
- Delete endpoint: `DELETE /api/images/delete`

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project account

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - The Cloudinary credentials are already configured in the example file

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `env.example` to `.env`
   - Cloudinary credentials are already configured in the example file

4. Set up Firebase Admin SDK credentials:
   - Download your Firebase service account key from [Firebase Console](https://console.firebase.google.com/)
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely (do NOT commit it to git)
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable:
     ```bash
     # Windows PowerShell
     $env:GOOGLE_APPLICATION_CREDENTIALS="path\to\service-account-key.json"
     
     # Windows CMD
     set GOOGLE_APPLICATION_CREDENTIALS=path\to\service-account-key.json
     
     # Linux/Mac
     export GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
     ```

5. Run the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

## Firebase Project Details

- **Project ID**: `property-management-syst-1c6c0`
- **Auth Domain**: `property-management-syst-1c6c0.firebaseapp.com`
- **Storage Bucket**: `property-management-syst-1c6c0.firebasestorage.app`

## Development

- Frontend runs on port 3000 (default Next.js port)
- Backend runs on port 5000 (configurable via PORT environment variable)

## Cloudinary Project Details

- **Cloud Name**: `dsfzkdwre`
- **Upload Preset**: `Property-images`
- Image folders: `property-images/`, `user-profiles/`

## Security Notes

- Never commit Firebase service account keys or `.env` files to version control
- Keep your Firebase API keys secure
- Keep your Cloudinary API secret secure (backend only)
- Use environment variables for sensitive configuration
- The Cloudinary upload preset is safe to expose on the frontend

## API Endpoints

### Image Endpoints

- `POST /api/images/upload` - Upload image to Cloudinary
  - Body: `FormData` with `image` file and optional `folder` parameter
  - Returns: Image URL and metadata
  
- `DELETE /api/images/delete` - Delete image from Cloudinary
  - Body: `{ publicId: string }`
  - Returns: Success message

## Next Steps

1. Set up Firebase Authentication rules
2. Configure Firestore security rules
3. Implement API routes in the backend
4. Connect frontend components to Firebase services
5. Use Cloudinary utilities for image uploads in your components

