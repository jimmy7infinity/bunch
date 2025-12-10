# 🧪 Testing Guide - Ready to Test!

## ✅ What's Built and Ready

### Backend (100% Complete)
- ✅ User authentication with wallet signatures
- ✅ JWT token generation and validation
- ✅ WebSocket server for real-time chat
- ✅ Message storage in MongoDB
- ✅ Message reactions
- ✅ Online user tracking
- ✅ Security headers and CORS

### Frontend (100% Complete)
- ✅ Wallet connection UI (MetaMask)
- ✅ Global chat interface
- ✅ Real-time messaging
- ✅ Message reactions (👍 👎 🔥 💎)
- ✅ Online user count
- ✅ Auto-scroll to new messages
- ✅ Responsive design

---

## 🚀 Setup Steps (Do This First)

### 1. Set Up MongoDB

**Option A: Use MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/polybanter?retryWrites=true&w=majority
   ```

**Option B: Use Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB: `mongod`
3. Keep default in `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/polybanter
   ```

### 2. Start Redis (Required for WebSocket)

```bash
# Start Redis with Docker
docker-compose up -d redis

# Or start just Redis if you have it installed
redis-server
```

### 3. Install MetaMask

1. Install MetaMask browser extension: https://metamask.io/download/
2. Create or import a wallet
3. You don't need real ETH - signature is free!

---

## 🎯 Start the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

**You should see:**
```
🚀 PolyBanter Backend running on http://localhost:3000
📡 API available at http://localhost:3000/api
🔒 Environment: development
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🧪 Testing Steps

### Test 1: Login with Wallet

1. Open http://localhost:5173 in your browser
2. Click "Connect Wallet"
3. MetaMask will pop up - click "Connect"
4. MetaMask will ask you to sign a message - click "Sign"
5. **Expected:** You should be logged in and see the chat interface

**Troubleshooting:**
- If MetaMask doesn't pop up, check if it's installed
- If signature fails, try refreshing the page
- Check browser console (F12) for errors

### Test 2: Send Messages

1. Type a message in the input box
2. Press Enter or click "Send"
3. **Expected:** Message appears instantly in the chat

### Test 3: React to Messages

1. Hover over any message
2. Click the "+" button that appears
3. Click an emoji (👍 👎 🔥 💎)
4. **Expected:** Reaction appears below the message with count

### Test 4: Multi-User Chat (You + Friend)

1. **You:** Stay logged in on your computer
2. **Friend:** Open http://localhost:5173 in their browser
3. **Friend:** Connect their wallet and login
4. **Both:** Send messages to each other
5. **Expected:** Messages appear in real-time for both users

**Note:** Your friend needs to be on the same network or you need to expose your backend (see below)

---

## 🌐 Allow Friend to Connect (Same Network)

### Option 1: Same WiFi Network

1. Find your local IP:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update frontend/.env:
   ```
   VITE_API_URL=http://YOUR_IP:3000/api
   VITE_WS_URL=http://YOUR_IP:3000
   ```

3. Restart frontend: `npm run dev`

4. Friend opens: `http://YOUR_IP:5173`

### Option 2: Use ngrok (Internet Access)

```bash
# Install ngrok: https://ngrok.com/download

# Expose backend
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)

# Update frontend/.env:
VITE_API_URL=https://abc123.ngrok.io/api
VITE_WS_URL=https://abc123.ngrok.io

# Restart frontend
npm run dev

# Friend can access from anywhere!
```

---

## 🐛 Common Issues & Solutions

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
# If using Docker:
docker-compose ps

# If using local MongoDB:
ps aux | grep mongod

# Check connection string in backend/.env
```

### "WebSocket connection failed"
```bash
# Make sure backend is running
curl http://localhost:3000/api/health

# Check Redis is running
docker-compose ps
# or
redis-cli ping
```

### "MetaMask not found"
- Install MetaMask extension
- Refresh the page after installing
- Make sure you're using Chrome/Brave/Edge

### "Signature verification failed"
- Try logging out and logging in again
- Clear localStorage: `localStorage.clear()` in browser console
- Restart backend

### Messages not appearing
- Check browser console (F12) for errors
- Check backend terminal for errors
- Verify WebSocket is connected (green dot in header)

### Friend can't connect
- Make sure you're on the same network
- Check firewall settings
- Use ngrok for internet access

---

## 📊 What to Check

### Backend Health
```bash
# Test API
curl http://localhost:3000/api/health

# Should return:
{
  "status": "ok",
  "timestamp": "...",
  "service": "PolyBanter API"
}
```

### Frontend Console
Open browser console (F12) and look for:
- ✅ "WebSocket connected"
- ✅ "Logged in successfully"
- ❌ Any red errors

### Database
```bash
# Check if users are being created
mongosh
use polybanter
db.users.find()
db.messages.find()
```

---

## 🎉 Success Criteria

You're ready when:
- ✅ You can login with MetaMask
- ✅ You can send messages
- ✅ Messages appear in real-time
- ✅ You can add reactions
- ✅ Online count updates
- ✅ Friend can login and chat with you

---

## 📝 Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can connect wallet
- [ ] Can sign message
- [ ] Login successful
- [ ] Can see chat interface
- [ ] Can send message
- [ ] Message appears instantly
- [ ] Can add reaction
- [ ] Reaction count updates
- [ ] Online count shows correct number
- [ ] Friend can login
- [ ] Can chat with friend in real-time
- [ ] Messages persist (refresh page, messages still there)

---

## 🚀 Next Steps After Testing

Once basic chat works:
1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Package Chrome extension
4. Add more features (categories, AI, rankings)

---

## 💡 Tips

- Keep browser console open to see what's happening
- Check both backend and frontend terminals for errors
- Use incognito window for testing second user
- MetaMask signature is free - no gas fees!

---

**Ready to test? Let's go! 🎉**

If you hit any issues, check the error messages and let me know!

