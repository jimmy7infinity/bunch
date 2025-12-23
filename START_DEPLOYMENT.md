# 🚀 Start Here: Deploy PolyBanter

**Goal**: Get your app live and accessible to friends in 30 minutes.

---

## Quick Overview

You're deploying a **Chrome Extension** that connects to a **Railway Backend**.

```
┌──────────────────────┐
│  Chrome Extension    │  ← Runs in user's browser
│  (React App)         │  ← Connects to your backend
└──────────┬───────────┘
           │
           │ HTTPS/WSS
           ▼
┌──────────────────────┐
│  Railway Backend     │  ← Your NestJS API
│  + MongoDB + Redis   │  ← Hosted on Railway
└──────────────────────┘
```

---

## Choose Your Path

### Path A: Quick Deploy (30 min) ⚡
**Best for**: Getting live ASAP, testing with friends

1. Deploy backend to Railway
2. Build extension
3. Share with friends

👉 **[Follow QUICK_DEPLOY.md](./QUICK_DEPLOY.md)**

### Path B: Full Setup (1 hour) 🛠️
**Best for**: Understanding everything, production-ready

1. Complete backend deployment
2. Build and test extension
3. Optional: Publish to Chrome Web Store
4. Set up monitoring and CI/CD

👉 **[Follow DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

---

## Before You Start

### ✅ What You Need

- [ ] GitHub account (for Railway deployment)
- [ ] Railway account ([sign up free](https://railway.app))
- [ ] Chrome browser
- [ ] MetaMask wallet (for testing)
- [ ] 30-60 minutes

### ✅ What You Have

- [x] Backend code (NestJS + MongoDB + Redis)
- [x] Frontend code (React + Chrome Extension)
- [x] Docker setup (for local development)
- [x] All dependencies configured

---

## Local Development First?

If you want to test locally before deploying:

### Quick Local Setup

```bash
# Run the setup script
./scripts/setup-local.sh

# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Load extension in Chrome
# chrome://extensions/ → Load unpacked → select frontend/dist
```

Or manually:

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Setup backend
cd backend
cp env.example .env
npm install
npm run dev

# 3. Setup frontend (in new terminal)
cd frontend
cp env.example .env
npm install
npm run dev
```

---

## Deployment Checklist

### Backend (Railway)

- [ ] Push code to GitHub
- [ ] Create Railway project
- [ ] Add MongoDB plugin
- [ ] Add Redis plugin
- [ ] Configure environment variables
- [ ] Generate domain
- [ ] Test API endpoints

### Frontend (Extension)

- [ ] Update .env.production with Railway URL
- [ ] Build extension for production
- [ ] Test extension locally
- [ ] Package extension (ZIP)
- [ ] Share with friends or publish

---

## Cost Summary

### Development (Free)
- Local development: FREE
- Docker containers: FREE
- Chrome extension testing: FREE

### Production (Paid)
- Railway backend: ~$13-18/month
  - Hobby plan: $5/month (includes $5 credit)
  - Pro plan: $20/month (includes $20 credit) ← Recommended
- Chrome Web Store: $5 one-time (optional)

**Total**: $13-23/month + $5 one-time

---

## Support & Resources

### Documentation
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Fast deployment guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete guide
- [README.md](./README.md) - Project overview
- [STATUS.md](./STATUS.md) - Current implementation status

### External Resources
- [Railway Docs](https://docs.railway.app)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions)
- [NestJS Docs](https://docs.nestjs.com)

### Getting Help
- Check Railway logs for backend errors
- Check browser console for frontend errors
- Review troubleshooting sections in guides

---

## What Happens After Deployment?

1. **Backend goes live on Railway**
   - API accessible at `https://your-app.railway.app/api`
   - WebSocket available at `wss://your-app.railway.app`
   - MongoDB and Redis running

2. **Extension connects to backend**
   - Users install extension in Chrome
   - Extension connects to your Railway backend
   - Real-time chat works across all users

3. **You can update anytime**
   - Push to GitHub → Railway auto-deploys
   - Rebuild extension → Share new version
   - No downtime for users

---

## Ready to Deploy?

### For Quick Deployment (30 min)
👉 **[Open QUICK_DEPLOY.md](./QUICK_DEPLOY.md)**

### For Full Setup (1 hour)
👉 **[Open DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

### For Local Testing First
```bash
./scripts/setup-local.sh
```

---

**Questions?** Check the troubleshooting sections in the guides or review the documentation.

**Let's deploy! 🚀**

