# Property Management System - Backend

Backend server for the Property Management System using Express.js and Firebase Admin SDK.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `env.example` to `.env`
   - The admin credentials are already configured in the example file

3. Set up Firebase Admin SDK:
   - Place your `serviceAccountKey.json` file in the backend directory
   - The file should be named `serviceAccountKey.json`
   - This file is automatically ignored by git for security

4. Create the admin user:
```bash
npm run create-admin
```

This will create an admin user with:
- Email: shikur@gmail.com (from .env file)
- Password: shikur3828 (from .env file)
- Custom claims: `{ admin: true, role: 'admin' }`

You can modify the email and password in the `.env` file before running the script.

## Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Build:
```bash
npm run build
```

Production mode:
```bash
npm start
```

## API Endpoints

### General
- `GET /health` - Health check endpoint
- `GET /api` - API information

### Image Management
- `POST /api/images/upload` - Upload image to Cloudinary
- `DELETE /api/images/delete` - Delete image from Cloudinary

### Authentication
- `POST /api/auth/create-user` - Create a new user in Firestore `admins` collection (admin only)
- `POST /api/auth/verify-token` - Verify a Firebase ID token

## Firebase Integration

The backend uses Firebase Admin SDK for server-side operations:
- Authentication verification
- User management
- Database operations (Firestore)
- Custom claims management

### Important: Service Account Permissions

If you encounter permission errors when creating users, the service account needs additional IAM roles:

1. **Service Usage Consumer** (`roles/serviceusage.serviceUsageConsumer`)
   - Required to use Firebase APIs
   - Grant this role in [Google Cloud Console IAM](https://console.developers.google.com/iam-admin/iam/project?project=property-management-syst-1c6c0)

2. **Firebase Authentication API** must be enabled
   - Enable it in [API Library](https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=property-management-syst-1c6c0)

See `FIX_SERVICE_ACCOUNT_PERMISSIONS.md` for detailed instructions.

## Admin User Setup

### Option 1: Add Admin to Firestore (Recommended - No Permission Issues)

To add an admin user to the Firestore `admins` collection:

```bash
npm run add-admin
```

Or with custom credentials:
```bash
npm run add-admin your-email@example.com your-password
```

This will:
1. Check if the admin already exists in Firestore
2. Create or update the admin in the `admins` collection
3. Set role to `admin`

**Note**: This method stores users in Firestore and avoids Firebase Admin SDK permission issues.

### Option 2: Create Admin in Firebase Auth (Requires Permissions)

To create an admin user in Firebase Auth:
```bash
npm run create-admin
```

The script will:
1. Check if the user already exists
2. Create the user if it doesn't exist
3. Update the password if the user exists
4. Set custom claims for admin role

Make sure you have the `serviceAccountKey.json` file in the backend directory before running the script.

⚠️ **Note**: This requires Firebase Admin SDK permissions. If you get permission errors, use Option 1 instead.
