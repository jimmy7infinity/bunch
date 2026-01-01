# Configuration Guide

## Frontend Configuration

To connect the frontend to your production backend on Railway, create a `.env.local` file in the `frontend` directory:

```env
# Production Backend (Railway)
VITE_API_URL=https://your-railway-app.railway.app/api
VITE_WS_URL=https://your-railway-app.railway.app
```

Replace `your-railway-app.railway.app` with your actual Railway deployment URL.

## Testing Locally

For local development with a local backend:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

## What's Been Connected

### ✅ User Profile
- Profile picture (PFP) now loads from database (`avatar_url` field)
- Bio loads from database and can be edited with confirm/cancel buttons
- Username loads from database (defaults to Twitter username)
- Display name shows correctly
- All profile updates save to the backend via API

### ✅ Authentication
- Login flow working correctly
- User data persists in auth store
- JWT token authentication configured

### ✅ Message System (Partial)
- WebSocket connection configured
- Message sending via WebSocket implemented
- Message receiving via WebSocket implemented
- Messages load from backend API on chat open
- Real-time message updates

### ⚠️ Still Using Placeholder Data
- Chat rooms list (Politics, Crypto, Sports, etc.) - Backend doesn't have room system yet
- Friend requests and friends list
- Leaderboard data
- User ranks (currently hardcoded as "TITAN", "LEGEND+", etc.)
- Reaction counts on messages
- Online user counts per room

## Backend Status

The backend currently supports:
- ✅ User authentication (Twitter OAuth + Wallet)
- ✅ User profile management
- ✅ Global chat (single room)
- ✅ WebSocket real-time messaging
- ✅ Message reactions
- ❌ Multiple chat rooms (not implemented yet)
- ❌ Private messages (not implemented yet)
- ❌ Friend system (not implemented yet)
- ❌ Leaderboard/ranking system (not implemented yet)

## Next Steps

1. **Set up your `.env.local` file** with your Railway backend URL
2. **Test the connection** by logging in and sending a message in the global chat
3. **Add test data** to the database manually if needed for testing
4. **Backend enhancements needed:**
   - Implement chat rooms system
   - Add friend request system
   - Implement ranking/leaderboard system
   - Add private messaging

## Testing the Connection

1. Start the frontend: `cd frontend && npm run dev`
2. Open the app in your browser
3. Log in with Twitter
4. Your profile should show your Twitter avatar and username
5. Try editing your bio - it should save to the database
6. Open the global chat and send a message - it should appear in real-time

## Troubleshooting

### "Failed to load messages"
- Check that your `VITE_API_URL` is correct
- Verify the backend is running and accessible
- Check browser console for CORS errors

### "WebSocket connection failed"
- Check that your `VITE_WS_URL` is correct
- Verify WebSocket is enabled on your Railway deployment
- Check that the backend allows WebSocket connections

### "Profile not loading"
- Check that you're logged in (token in localStorage)
- Verify the `/users/me` endpoint is working
- Check browser console for auth errors

