# Admin User Setup Guide

## Quick Setup

1. **Create `.env` file** (if not exists):
   ```bash
   cp env.example .env
   ```

2. **Place service account key**:
   - Make sure `serviceAccountKey.json` is in the `backend` directory
   - The file should contain your Firebase service account credentials

3. **Create admin user**:
   ```bash
   npm run create-admin
   ```

This will create an admin user with:
- **Email**: shikur@gmail.com
- **Password**: shikur3828
- **Role**: admin (with custom claims)

## Customizing Admin Credentials

To change the admin email/password, edit the `.env` file:

```env
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
```

Then run:
```bash
npm run create-admin
```

## Verifying Admin User

After running the script, you should see:
```
✅ Admin user created successfully with UID: [user-id]
✅ Admin custom claims set successfully
✅ Admin user setup complete!
```

You can now use these credentials to log in to your application!

## Important Notes

- The service account key file (`serviceAccountKey.json`) is **never committed to git** (it's in `.gitignore`)
- Admin credentials are stored in `.env` file (also in `.gitignore`)
- The admin user will have custom claims: `{ admin: true, role: 'admin' }`
- If the user already exists, the script will update the password

