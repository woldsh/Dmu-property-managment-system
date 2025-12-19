# Fix Firebase Service Account Permissions

## The Problem
The service account doesn't have permission to use Firebase Authentication API.

## Solution 1: Grant IAM Role (Recommended)

1. Go to Google Cloud Console IAM:
   https://console.developers.google.com/iam-admin/iam/project?project=property-management-syst-1c6c0

2. Find your service account email:
   - Look for: `firebase-adminsdk-fbsvc@property-management-syst-1c6c0.iam.gserviceaccount.com`
   - (This is in your serviceAccountKey.json file as "client_email")

3. Click the pencil/edit icon next to the service account

4. Click "ADD ANOTHER ROLE"

5. Add these roles:
   - `Service Usage Consumer` (roles/serviceusage.serviceUsageConsumer)
   - `Firebase Admin SDK Administrator Service Agent` (roles/firebaseadminsdk.adminServiceAgent)

6. Click "SAVE"

7. Wait 2-3 minutes for permissions to propagate

8. Run the script again:
   ```bash
   npm run create-admin
   ```

## Solution 2: Enable Firebase Authentication API

1. Go to Google Cloud Console APIs & Services:
   https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=property-management-syst-1c6c0

2. Click "ENABLE" if it's not already enabled

3. Wait a few minutes

4. Run the script again

## Solution 3: Create Admin User Manually (Easiest)

If you just need the admin user created quickly:

1. Go to Firebase Console:
   https://console.firebase.google.com/project/property-management-syst-1c6c0/authentication/users

2. Click "Add user"

3. Enter:
   - Email: shikur@gmail.com
   - Password: shikur3828
   - Disable "Send email verification"

4. Click "Add user"

5. After the user is created, you can set custom claims using the Firebase Console or run a simple script

## Quick Fix Script

After fixing permissions, the admin creation script should work. If you prefer to set custom claims separately, you can modify the script to only set claims (not create the user).

