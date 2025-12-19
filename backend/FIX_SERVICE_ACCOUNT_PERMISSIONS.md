# Fix Service Account Permissions for User Registration

## The Problem

When trying to register users, you're getting an error about missing permissions. The service account needs permission to use Firebase Authentication API.

## Solution: Grant Service Usage Consumer Role

### Step 1: Go to Google Cloud Console IAM

Open this link:
https://console.developers.google.com/iam-admin/iam/project?project=property-management-syst-1c6c0

### Step 2: Find Your Service Account

1. Look for the service account email that starts with:
   `firebase-adminsdk-fbsvc@property-management-syst-1c6c0.iam.gserviceaccount.com`

   (This email is also in your `serviceAccountKey.json` file under `client_email`)

### Step 3: Add Required Role

1. Click the **pencil/edit icon** (✏️) next to the service account
2. Click **"ADD ANOTHER ROLE"**
3. Search for and select: **"Service Usage Consumer"** (`roles/serviceusage.serviceUsageConsumer`)
4. Click **"SAVE"**

### Step 4: Enable Firebase Authentication API

1. Go to: https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=property-management-syst-1c6c0
2. Click **"ENABLE"** if it's not already enabled

### Step 5: Wait and Retry

1. Wait **2-3 minutes** for permissions to propagate
2. Restart your backend server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
3. Try registering a user again

## Alternative: Use Firebase Console (Workaround)

If you need to create users immediately without fixing permissions, you can use Firebase Console:

1. Go to: https://console.firebase.google.com/project/property-management-syst-1c6c0/authentication/users
2. Click **"Add user"**
3. Enter email and password
4. Click **"Add user"**

**Note:** This is a temporary workaround. For production, you should fix the service account permissions.

## Verify Permissions

After granting permissions, you should be able to:
- Register users via the admin panel
- The backend will successfully create users in Firebase Auth

## Still Having Issues?

1. Make sure you're the project owner or have IAM Admin role
2. Check that the Firebase Authentication API is enabled
3. Wait longer (permissions can take up to 5 minutes to propagate)
4. Try restarting the backend server

