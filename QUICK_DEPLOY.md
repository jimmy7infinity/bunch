# Quick Deploy Guide - Get Live in 30 Minutes

This is the fastest path to get PolyBanter deployed and accessible to your friends.

## Prerequisites

- GitHub account
- Railway account (sign up at railway.app)
- Chrome browser

---

## Step 1: Deploy Backend (10 minutes)

### 1.1 Push to GitHub (if not already)

```bash
cd /Users/jimmyinfinity/Projects/poly_banter
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose `poly_banter` repository
5. Railway will start deploying automatically

### 1.3 Add MongoDB

1. Click "New" → "Database" → "MongoDB"
2. Wait 30 seconds for provisioning
3. MongoDB is now connected automatically

### 1.4 Add Redis

1. Click "New" → "Database" → "Redis"
2. Wait 30 seconds for provisioning
3. Redis is now connected automatically

### 1.5 Configure Environment Variables

Click on your backend service → "Variables" tab → Add these:

```bash
NODE_ENV=production
PORT=3000
API_PREFIX=api
JWT_SECRET=<paste-the-secret-generated-below>
JWT_EXPIRES_IN=7d
FRONTEND_URL=chrome-extension://*
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` value.

### 1.6 Get Your Backend URL

1. Go to "Settings" tab
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://polybanter-production.up.railway.app`)
4. **Save this URL - you'll need it next!**

---

## Step 2: Build Extension (5 minutes)

### 2.1 Create Production Environment File

```bash
cd frontend

# Create .env.production file
cat > .env.production << 'EOF'
VITE_API_URL=https://YOUR-RAILWAY-URL.railway.app/api
VITE_WS_URL=https://YOUR-RAILWAY-URL.railway.app
VITE_ENV=production
EOF
```

**Replace `YOUR-RAILWAY-URL` with your actual Railway URL from Step 1.6!**

### 2.2 Build Extension

```bash
npm run build:extension
```

This creates a production-ready extension in `frontend/dist/`

---

## Step 3: Test Extension Locally (5 minutes)

### 3.1 Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select `frontend/dist` folder
6. Extension appears in toolbar

### 3.2 Test Connection

1. Click the PolyBanter extension icon
2. Side panel opens
3. Click "Connect Wallet"
4. Sign the message in MetaMask
5. You should see the chat interface!

### 3.3 Verify It's Working

Open DevTools (F12) and check console:
```
✅ WebSocket connected
🔧 API Configuration: { API_URL: "https://your-app.railway.app/api", ... }
```

If you see errors, check:
- Railway backend is running (check Railway dashboard)
- Environment variables are correct
- CORS is configured (should be automatic)

---

## Step 4: Share with Friends (5 minutes)

### Option A: Share Extension Folder (Easiest)

1. Zip the extension:
   ```bash
   cd frontend/dist
   zip -r ../../polybanter-extension.zip .
   cd ../..
   ```

2. Share `polybanter-extension.zip` with friends

3. They install by:
   - Going to `chrome://extensions/`
   - Enabling "Developer mode"
   - Dragging ZIP onto the page

### Option B: Share via Google Drive/Dropbox

1. Upload `polybanter-extension.zip` to Drive/Dropbox
2. Share link with friends
3. They download and install as above

---

## Step 5: Test with Friends (5 minutes)

1. Have a friend install the extension
2. Both connect wallets
3. Both send messages
4. Verify real-time chat works!

---

## Troubleshooting

### Backend Issues

**"Cannot connect to backend"**
- Check Railway service is running
- Verify environment variables are set
- Check Railway logs for errors

**"CORS error"**
- Verify `FRONTEND_URL=chrome-extension://*` in Railway variables
- Redeploy if needed

### Extension Issues

**"Extension won't load"**
- Check all files are in `dist/` folder
- Verify manifest.json is present
- Check Chrome extension errors page

**"Can't connect wallet"**
- Make sure MetaMask is installed
- Try refreshing the extension
- Check browser console for errors

**"WebSocket disconnected"**
- Check Railway backend is running
- Verify VITE_WS_URL in .env.production
- Check Railway logs for WebSocket errors

---

## Monitoring Your Deployment

### Railway Dashboard

1. **Logs**: Click service → "Logs" tab
   - See all backend logs in real-time
   - Filter by error/warn/info

2. **Metrics**: Click service → "Metrics" tab
   - CPU usage
   - Memory usage
   - Request count

3. **Deployments**: Click service → "Deployments" tab
   - See deployment history
   - Rollback if needed

### Extension Monitoring

1. **Chrome DevTools**
   - Open side panel
   - Press F12
   - Check Console for logs
   - Check Network tab for API calls

2. **User Feedback**
   - Ask friends to report issues
   - Check for common problems
   - Iterate quickly

---

## Updating Your Deployment

### Update Backend

```bash
# Make changes to backend code
git add .
git commit -m "Update backend"
git push origin main

# Railway automatically redeploys!
```

### Update Extension

```bash
# 1. Make changes to frontend code

# 2. Update version in manifest.json
# "version": "0.1.1"  (increment)

# 3. Rebuild
cd frontend
npm run build:extension

# 4. Repackage
cd dist
zip -r ../../polybanter-extension-v0.1.1.zip .

# 5. Share new version with friends
```

---

## Cost Breakdown

### Railway (Backend + Database)

- **Trial**: $5 credit (lasts ~1 month for small usage)
- **Hobby**: $5/month (includes $5 credit)
- **Pro**: $20/month (includes $20 credit, recommended)

**Estimated costs for 10-50 users:**
- Backend: $5-10/month
- MongoDB: $5/month
- Redis: $3/month
- **Total**: ~$13-18/month

### Chrome Extension

- **Development/Testing**: FREE
- **Chrome Web Store**: $5 one-time (only if you want to publish)

---

## Next Steps

Once everything is working:

1. **Gather Feedback**
   - What features do users want?
   - What's confusing?
   - What's broken?

2. **Fix Critical Bugs**
   - Prioritize blocking issues
   - Quick iterations

3. **Add Features**
   - Categories (Politics, Crypto, etc.)
   - Private DMs
   - User profiles
   - AI insights

4. **Scale Up**
   - Upgrade Railway plan if needed
   - Optimize database queries
   - Add caching

5. **Publish to Chrome Web Store**
   - Reach wider audience
   - Auto-updates for users
   - Professional listing

---

## Support

If you get stuck:

1. Check Railway logs for backend errors
2. Check browser console for frontend errors
3. Review the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
4. Check Railway documentation
5. Ask in Railway Discord

---

**You're ready to deploy! Start with Step 1.** 🚀

**Estimated time: 30 minutes**
**Difficulty: Easy**
**Cost: $5-20/month**

