# Troubleshooting "Failed to fetch" Error

If you're getting a "Failed to fetch" error when trying to register a user, here are the steps to fix it:

## 1. Check if Backend Server is Running

The backend server must be running for the frontend to connect to it.

**Start the backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 5000
Firebase Admin initialized successfully
```

## 2. Check Backend URL

The frontend tries to connect to `http://localhost:5000` by default.

**Check if the backend is accessible:**
- Open your browser and go to: `http://localhost:5000/health`
- You should see: `{"status":"ok","message":"Backend server is running"}`

## 3. Configure Frontend Environment Variable (Optional)

If your backend runs on a different port or URL, create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Note:** After changing `.env.local`, restart the Next.js dev server:
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

## 4. Check CORS Configuration

The backend has CORS enabled. If you're still having issues, make sure:
- Both frontend and backend are running
- They're on the same origin or CORS is properly configured

## 5. Common Issues

### Backend not running
**Solution:** Start the backend server first

### Wrong port
**Solution:** Make sure backend runs on port 5000 (or update NEXT_PUBLIC_API_URL)

### Firewall blocking
**Solution:** Check if your firewall is blocking localhost connections

### Next.js not picking up env variables
**Solution:** Restart Next.js dev server after adding/updating `.env.local`

## Quick Test

1. **Test backend:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok","message":"Backend server is running"}`

2. **Test frontend-backend connection:**
   - Start both servers
   - Try registering a user
   - Check browser console for detailed error messages

