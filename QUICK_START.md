# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Configure Backend URL

Create `frontend/.env.local`:

```bash
cd frontend
cat > .env.local << EOF
VITE_API_URL=https://your-railway-app.railway.app/api
VITE_WS_URL=https://your-railway-app.railway.app
EOF
```

**⚠️ Important:** Replace `your-railway-app.railway.app` with your actual Railway backend URL!

### Step 2: Install Dependencies (if needed)

```bash
cd frontend
npm install
```

### Step 3: Start the Frontend

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 4: Test the Connection

1. **Login** - Click "Login with Twitter" and authenticate
2. **Check Profile** - Click your profile picture in the top right
3. **Edit Bio** - Click the edit icon next to "Bio", type something, click ✓ to save
4. **Send Message** - Go back to chats, open any chat, send a message

### ✅ What Should Work

- ✅ Login with Twitter
- ✅ Your Twitter avatar appears in the app
- ✅ Your username defaults to Twitter username
- ✅ You can edit and save your bio
- ✅ You can send messages in global chat
- ✅ Messages appear in real-time

### ❌ What Won't Work Yet

- ❌ Multiple chat rooms (backend only has global chat)
- ❌ Friend requests/friends list
- ❌ Leaderboard rankings
- ❌ Private messages

## 🔍 Verify It's Working

### Check 1: Profile Data
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Look for `token` - should have a JWT token
4. Go to Network tab
5. Refresh page
6. Look for request to `/auth/me` - should return your user data

### Check 2: WebSocket Connection
1. Open browser DevTools (F12)
2. Go to Network tab → WS filter
3. Should see a WebSocket connection
4. Status should be "101 Switching Protocols"
5. In Console tab, should see "✅ WebSocket connected"

### Check 3: Message Sending
1. Open global chat
2. Type a message and press Enter
3. In Network → WS tab, click the WebSocket connection
4. Go to Messages tab
5. Should see your message being sent

## 🐛 Common Issues

### Issue: "Failed to load messages"
**Solution:** Check your `VITE_API_URL` in `.env.local`

```bash
# Test the backend directly
curl https://your-railway-app.railway.app/api/messages
```

### Issue: "WebSocket connection failed"
**Solution:** 
1. Check `VITE_WS_URL` has no `/api` suffix
2. Verify Railway supports WebSocket (it should by default)
3. Check backend logs on Railway

### Issue: "Profile shows default emoji instead of Twitter avatar"
**Solution:**
1. Check if you logged in with Twitter (not wallet)
2. Verify your Twitter account has an avatar
3. Check browser console for image loading errors

### Issue: "Can't send messages"
**Solution:**
1. Check WebSocket connection status in console
2. Verify you're logged in (token exists)
3. Try refreshing the page

## 📱 For Chrome Extension Testing

The current setup works for local development. To test as a Chrome extension:

1. Build the extension:
```bash
cd frontend
npm run build
```

2. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `frontend/dist` folder

3. The extension will connect to your Railway backend automatically

## 🎯 Quick Test Script

Run this to verify everything is connected:

```bash
# Test backend is accessible
curl https://your-railway-app.railway.app/api/messages

# Should return: {"messages": [...], "count": ...}
```

## 📞 Need Help?

Check these files for more details:
- `CONFIGURATION.md` - Full configuration guide
- `CHANGES_SUMMARY.md` - Complete list of changes made
- `TESTING_CHECKLIST.md` - Detailed testing guide

## 🎉 You're All Set!

If you can:
1. ✅ Login with Twitter
2. ✅ See your Twitter avatar
3. ✅ Edit your bio
4. ✅ Send a message

Then everything is working correctly! 🎊

The placeholder data (chat rooms, friends, leaderboard) is expected - those features need backend implementation first.

