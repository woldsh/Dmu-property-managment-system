# How to Run the Admin Creation Script

## Quick Start

1. **Make sure you have a `.env` file** (optional - script has defaults):
   - Copy `env.example` to `.env` manually, OR
   - The script will use default values: email=`shikur@gmail.com`, password=`shikur3828`

2. **Make sure `serviceAccountKey.json` is in the backend folder**

3. **Run the script from the backend directory**:
   ```bash
   cd backend
   npm run create-admin
   ```

## Expected Output

If successful, you should see:
```
Found service account key at: [path]
Firebase Admin initialized with service account key
Firebase Admin initialized successfully
Creating admin user...
Email: shikur@gmail.com
✅ Admin user created successfully with UID: [uid]
✅ Admin custom claims set successfully
✅ Admin user setup complete!
   Email: shikur@gmail.com
   UID: [user-id]
   Role: admin
```

## Troubleshooting

If you see errors:

1. **"Cannot find service account key"**: 
   - Make sure `serviceAccountKey.json` is in the `backend` directory
   - Check the file name is exactly `serviceAccountKey.json`

2. **"Error initializing Firebase Admin"**:
   - Verify your service account key JSON is valid
   - Check that the file has proper JSON format

3. **"Error creating admin user"**:
   - Check Firebase project permissions
   - Verify the service account has admin privileges
   - Check network connection

The script will work with default values even without a `.env` file!

