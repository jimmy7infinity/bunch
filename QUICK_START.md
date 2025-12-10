# ⚡ Quick Start - Get Running in 5 Minutes

## Prerequisites
- ✅ Node.js installed (you have v22.18.0)
- ✅ MongoDB connection string ready
- ✅ MetaMask browser extension installed

---

## 🚀 5-Minute Setup

### 1. Update MongoDB Connection (30 seconds)

Edit `backend/.env` and update this line:
```bash
MONGODB_URI=your-mongodb-connection-string-here
```

### 2. Start Redis (30 seconds)

```bash
docker-compose up -d redis
```

### 3. Start Backend (1 minute)

```bash
cd backend
npm run dev
```

Wait for: `🚀 PolyBanter Backend running on http://localhost:3000`

### 4. Start Frontend (1 minute)

Open a new terminal:
```bash
cd frontend
npm run dev
```

Wait for: `➜  Local:   http://localhost:5173/`

### 5. Test! (2 minutes)

1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Sign the message in MetaMask
4. Start chatting!

---

## ✅ You're Done!

**What you can do now:**
- Send messages in global chat
- React to messages with emojis
- See online user count
- Chat in real-time

**Invite your friend:**
- Share your local IP: http://YOUR_IP:5173
- Or use ngrok (see TESTING_GUIDE.md)

---

## 🆘 Quick Troubleshooting

**Backend won't start?**
- Check MongoDB connection string in `backend/.env`
- Make sure Redis is running: `docker-compose ps`

**Frontend won't start?**
- Make sure you're in the `frontend` directory
- Try: `rm -rf node_modules && npm install`

**Can't connect wallet?**
- Install MetaMask: https://metamask.io/download/
- Refresh the page after installing

**Messages not sending?**
- Check green dot in header (WebSocket connected)
- Look at browser console (F12) for errors
- Restart backend if needed

---

## 📚 More Info

- **Full Testing Guide:** See TESTING_GUIDE.md
- **Architecture:** See OVERVIEW.md
- **Development:** See BUILD_ORDER.md

---

**Need help? Check the error messages and let me know!** 🚀

