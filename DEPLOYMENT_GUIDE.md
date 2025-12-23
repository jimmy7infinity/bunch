# PolyBanter Deployment Guide

## Overview

This guide covers deploying PolyBanter to production:
- **Backend**: Railway (API + WebSocket + MongoDB + Redis)
- **Frontend**: Chrome Extension (distributed via Chrome Web Store)

## Architecture

```
┌─────────────────────────────────────────────┐
│  Chrome Extension (User's Browser)         │
│  - React App (runs locally)                │
│  - Connects to Railway Backend API         │
└─────────────────┬───────────────────────────┘
                  │
                  │ HTTPS + WSS
                  ▼
┌─────────────────────────────────────────────┐
│  Railway (Backend)                          │
│  ├─ NestJS API Server                       │
│  ├─ WebSocket Server (Socket.IO)           │
│  ├─ MongoDB (Railway Plugin)                │
│  └─ Redis (Railway Plugin)                  │
└─────────────────────────────────────────────┘
```

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your email

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select the `poly_banter` repository
5. Railway will detect the configuration automatically

### Step 3: Add MongoDB Plugin

1. In your Railway project, click "New"
2. Select "Database" → "MongoDB"
3. Wait for MongoDB to provision
4. Copy the connection string from the MongoDB service
   - Click on MongoDB service
   - Go to "Variables" tab
   - Copy `MONGO_URL` value

### Step 4: Add Redis Plugin

1. Click "New" again
2. Select "Database" → "Redis"
3. Wait for Redis to provision
4. Copy the connection string
   - Click on Redis service
   - Go to "Variables" tab
   - Copy `REDIS_URL` value

### Step 5: Configure Environment Variables

1. Click on your backend service
2. Go to "Variables" tab
3. Add the following variables:

```bash
# Environment
NODE_ENV=production

# Server
PORT=3000
API_PREFIX=api

# Database (use the MongoDB connection string from Step 3)
MONGODB_URI=mongodb://mongo:***@***:27017/railway?authSource=admin

# Redis (Railway provides REDIS_URL automatically)
# You can also manually set:
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379

# JWT (IMPORTANT: Generate a strong secret!)
JWT_SECRET=<generate-a-strong-random-secret-here>
JWT_EXPIRES_IN=7d

# Frontend URLs (for CORS) - we'll update this after getting the Railway URL
FRONTEND_URL=chrome-extension://*

# Chrome Extension - leave empty for now
EXTENSION_ID=

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

**To generate a strong JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 6: Deploy Backend

1. Railway will automatically deploy after you add variables
2. Wait for deployment to complete (check "Deployments" tab)
3. Once deployed, go to "Settings" tab
4. Click "Generate Domain" to get a public URL
5. Copy your Railway URL (e.g., `https://your-app.railway.app`)

### Step 7: Update CORS Configuration

1. Go back to "Variables" tab
2. Update `FRONTEND_URL` to include your Railway domain:
   ```
   FRONTEND_URL=https://your-app.railway.app
   ```
3. Railway will automatically redeploy

### Step 8: Test Backend API

Test your deployed backend:

```bash
# Check health
curl https://your-app.railway.app/api

# Get nonce for wallet auth
curl https://your-app.railway.app/api/auth/nonce
```

---

## Part 2: Build & Deploy Chrome Extension

### Step 1: Update Frontend Environment

1. Create a production environment file locally:

```bash
cd frontend
cat > .env.production << EOF
# API Configuration - USE YOUR RAILWAY URL
VITE_API_URL=https://your-app.railway.app/api
VITE_WS_URL=https://your-app.railway.app

# Environment
VITE_ENV=production
EOF
```

### Step 2: Build Extension for Production

```bash
cd frontend
npm run build:extension
```

This will:
- Build the React app with production environment variables
- Copy extension files to `dist/` folder
- Create a production-ready extension

### Step 3: Test Extension Locally

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `frontend/dist` folder
5. Click the extension icon to open side panel
6. Test the connection to your Railway backend:
   - Try logging in with wallet
   - Send a test message
   - Check browser console for any errors

### Step 4: Package Extension for Distribution

Once tested, create a ZIP file for Chrome Web Store:

```bash
cd frontend/dist
zip -r ../polybanter-extension-v0.1.0.zip .
cd ..
```

### Step 5: Update Extension Manifest for Production

Before publishing, update `frontend/public/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "PolyBanter",
  "version": "0.1.0",
  "description": "Social chat for Polymarket - Connect with traders in real-time",
  "side_panel": {
    "default_path": "index.html"
  },
  "permissions": [
    "sidePanel",
    "storage"
  ],
  "host_permissions": [
    "https://polymarket.com/*",
    "https://your-app.railway.app/*"
  ],
  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },
  "action": {
    "default_title": "Open PolyBanter",
    "default_icon": {
      "16": "icon-16.png",
      "48": "icon-48.png",
      "128": "icon-128.png"
    }
  },
  "icons": {
    "16": "icon-16.png",
    "48": "icon-48.png",
    "128": "icon-128.png"
  }
}
```

**Important**: Update `host_permissions` to include your Railway domain!

---

## Part 3: Publish to Chrome Web Store (Optional)

### Option A: Private Distribution (For Testing with Friends)

You can share the extension with friends without publishing:

1. Build the extension (Step 2 above)
2. Share the ZIP file with your friends
3. They can install it by:
   - Going to `chrome://extensions/`
   - Enabling "Developer mode"
   - Dragging the ZIP file onto the page
   - Or using "Load unpacked" with the extracted folder

**Pros**: Instant, no review process, free
**Cons**: Users need to enable Developer mode, no auto-updates

### Option B: Publish to Chrome Web Store

For wider distribution with auto-updates:

1. **Create Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Pay one-time $5 developer registration fee
   - Verify your email

2. **Prepare Store Listing**
   - Create screenshots (1280x800 or 640x400)
   - Write description
   - Create promotional images (optional)

3. **Upload Extension**
   - Click "New Item"
   - Upload your ZIP file
   - Fill out store listing:
     - **Name**: PolyBanter
     - **Summary**: Social chat for Polymarket traders
     - **Description**: (Write detailed description)
     - **Category**: Social & Communication
     - **Language**: English
   - Upload screenshots
   - Set privacy policy URL (if collecting data)

4. **Submit for Review**
   - Click "Submit for review"
   - Review typically takes 1-3 business days
   - You'll receive email when approved

5. **Publish**
   - Once approved, click "Publish"
   - Extension goes live immediately
   - Users can install from Chrome Web Store

---

## Part 4: Continuous Deployment Setup

### Backend (Railway)

Railway automatically deploys when you push to GitHub:

1. **Connect GitHub** (if not already)
   - Go to Railway project settings
   - Connect to your GitHub repo
   - Select branch (e.g., `main` or `production`)

2. **Auto-Deploy on Push**
   - Every push to the connected branch triggers deployment
   - Railway builds and deploys automatically
   - Check "Deployments" tab for status

3. **Deployment Workflow**
   ```bash
   # Make changes to backend
   git add .
   git commit -m "Update backend"
   git push origin main
   # Railway automatically deploys
   ```

### Frontend (Chrome Extension)

For extension updates:

1. **Update Version Number**
   ```json
   // frontend/public/manifest.json
   {
     "version": "0.1.1"  // Increment version
   }
   ```

2. **Build New Version**
   ```bash
   cd frontend
   npm run build:extension
   cd dist
   zip -r ../polybanter-extension-v0.1.1.zip .
   ```

3. **Upload to Chrome Web Store**
   - Go to Developer Dashboard
   - Click on your extension
   - Click "Upload new package"
   - Upload new ZIP
   - Submit for review

4. **Auto-Update for Users**
   - Once approved, Chrome automatically updates the extension for all users
   - Usually happens within a few hours

---

## Part 5: Environment-Specific Configuration

### Development Environment

```bash
# Backend (.env)
NODE_ENV=development
MONGODB_URI=mongodb://admin:password@localhost:27017/polybanter?authSource=admin
REDIS_HOST=localhost
FRONTEND_URL=http://localhost:5173

# Frontend (.env)
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

### Production Environment

```bash
# Backend (Railway Variables)
NODE_ENV=production
MONGODB_URI=<Railway MongoDB URL>
REDIS_HOST=<Railway Redis Host>
FRONTEND_URL=chrome-extension://*

# Frontend (.env.production)
VITE_API_URL=https://your-app.railway.app/api
VITE_WS_URL=https://your-app.railway.app
```

---

## Part 6: Testing Production Setup

### Test Backend

```bash
# Health check
curl https://your-app.railway.app/api

# Auth nonce
curl https://your-app.railway.app/api/auth/nonce

# WebSocket (requires wscat)
npm install -g wscat
wscat -c wss://your-app.railway.app
```

### Test Extension

1. Load extension in Chrome
2. Open DevTools (F12)
3. Click extension icon to open side panel
4. Check Console for connection logs:
   ```
   ✅ WebSocket connected
   API URL: https://your-app.railway.app/api
   ```
5. Test authentication:
   - Connect wallet
   - Sign message
   - Verify JWT token stored
6. Test chat:
   - Send message
   - Check message appears
   - Test reactions

---

## Part 7: Monitoring & Maintenance

### Railway Monitoring

1. **View Logs**
   - Go to Railway project
   - Click on service
   - Go to "Logs" tab
   - Filter by level (info, warn, error)

2. **Metrics**
   - CPU usage
   - Memory usage
   - Network traffic
   - Response times

3. **Alerts**
   - Set up alerts for:
     - High error rate
     - High memory usage
     - Deployment failures

### Extension Monitoring

1. **Chrome Web Store Analytics**
   - View installs
   - Active users
   - Ratings & reviews
   - Crash reports

2. **User Feedback**
   - Monitor reviews
   - Respond to issues
   - Track feature requests

---

## Part 8: Rollback & Recovery

### Backend Rollback

If deployment fails:

1. Go to Railway "Deployments" tab
2. Find previous working deployment
3. Click "Redeploy"
4. Or rollback via Git:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

### Extension Rollback

1. Go to Chrome Web Store Dashboard
2. Upload previous version ZIP
3. Submit for review (usually fast-tracked)

---

## Part 9: Cost Estimation

### Railway Costs

- **Hobby Plan**: $5/month (includes $5 credit)
  - Good for testing
  - Limited resources
  
- **Pro Plan**: $20/month (includes $20 credit)
  - Recommended for production
  - Better resources
  - Priority support

**Estimated Monthly Costs:**
- Backend service: ~$5-10/month
- MongoDB: ~$5/month (or use Railway plugin)
- Redis: ~$3/month (or use Railway plugin)
- **Total**: ~$13-18/month

### Chrome Web Store

- **One-time fee**: $5 (developer registration)
- **No recurring costs**

---

## Part 10: Security Checklist

Before going live:

- [ ] Generate strong JWT secret
- [ ] Enable HTTPS only (Railway does this automatically)
- [ ] Configure CORS properly (whitelist only your domains)
- [ ] Set up rate limiting (already configured in backend)
- [ ] Review and update environment variables
- [ ] Test authentication flow thoroughly
- [ ] Enable Railway's built-in DDoS protection
- [ ] Set up monitoring and alerts
- [ ] Create backup strategy for MongoDB
- [ ] Review Chrome extension permissions
- [ ] Add privacy policy (if collecting user data)
- [ ] Test with multiple users

---

## Quick Start Commands

### Deploy Backend to Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link to project
cd backend
railway link

# 4. Deploy
railway up
```

### Build & Test Extension

```bash
# 1. Update production environment
cd frontend
# Edit .env.production with your Railway URL

# 2. Build extension
npm run build:extension

# 3. Test in Chrome
# Load unpacked from frontend/dist

# 4. Package for distribution
cd dist
zip -r ../polybanter-extension.zip .
```

---

## Support & Troubleshooting

### Common Issues

**1. CORS Errors**
- Check `FRONTEND_URL` in Railway variables
- Verify `host_permissions` in manifest.json
- Check browser console for specific error

**2. WebSocket Connection Failed**
- Verify Railway URL is correct
- Check if Railway service is running
- Test WebSocket endpoint with wscat

**3. Authentication Fails**
- Check JWT_SECRET is set in Railway
- Verify MongoDB connection
- Check browser console for errors

**4. Extension Not Loading**
- Check manifest.json syntax
- Verify all files are in dist folder
- Check Chrome extension errors page

### Getting Help

- **Railway**: [railway.app/help](https://railway.app/help)
- **Chrome Extensions**: [developer.chrome.com/docs/extensions](https://developer.chrome.com/docs/extensions)
- **Project Issues**: Create issue on GitHub

---

## Next Steps

After successful deployment:

1. **Test with Friends**
   - Share extension with 5-10 friends
   - Gather feedback
   - Fix critical bugs

2. **Monitor Performance**
   - Watch Railway metrics
   - Check error logs
   - Monitor user activity

3. **Iterate**
   - Fix bugs based on feedback
   - Add requested features
   - Optimize performance

4. **Scale**
   - Upgrade Railway plan if needed
   - Add more backend instances
   - Optimize database queries

---

**Ready to deploy? Start with Part 1!** 🚀

