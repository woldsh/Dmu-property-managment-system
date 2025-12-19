# Add Admin to Firestore Collection

## Quick Usage

Add admin to Firestore `admins` collection using environment variables:

```bash
npm run add-admin
```

This will use credentials from `.env` file:
- Email: `shikur@gmail.com` (from ADMIN_EMAIL)
- Password: `shikur3828` (from ADMIN_PASSWORD)
- Role: `admin`

## Using Command Line Arguments

You can also provide email and password as command line arguments:

```bash
npm run add-admin your-email@example.com your-password
```

## How It Works

1. The script checks if an admin with the email already exists
2. If exists, it updates the password and role
3. If not, it creates a new admin document in the `admins` collection
4. The admin is stored in Firestore with:
   - email
   - password
   - role: 'admin'
   - createdAt/updatedAt timestamps

## Firestore Collection Structure

The `admins` collection stores users with this structure:

```javascript
{
  email: "shikur@gmail.com",
  password: "shikur3828",
  displayName: "",
  role: "admin",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Important Notes

⚠️ **Security Warning**: Passwords are currently stored in plain text in Firestore. For production, you should:
- Hash passwords before storing (using bcrypt, etc.)
- Never expose passwords in client-side code
- Use Firebase Auth for authentication

This simple approach is fine for development/testing but not for production.

