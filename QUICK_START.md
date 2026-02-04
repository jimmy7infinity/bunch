# 🚀 Quick Start: Secure Migration

## 📋 Pre-Flight Checklist

### 1. Generate New JWT Secrets (5 minutes)
```bash
# Generate JWT_SECRET
openssl rand -hex 64

# Generate JWT_REFRESH_SECRET  
openssl rand -hex 64
```
**Save these somewhere safe!**

### 2. Update Railway Environment Variables (2 minutes)
1. Go to Railway Dashboard
2. Select Backend service
3. Variables tab
4. Update:
   - `JWT_SECRET` → paste new value
   - `JWT_REFRESH_SECRET` → paste new value
5. Click "Deploy" to restart with new secrets

### 3. Verify Old MongoDB is Gone (1 minute)
1. Log into MongoDB Atlas
2. Check that cluster `polybanter.dnsdecj.mongodb.net` is deleted
3. If still exists → DELETE IT NOW

### 4. Create New GitHub Repository (2 minutes)
1. Go to your new GitHub organization
2. Create new repository (name: `bunch` or similar)
3. **DO NOT** initialize with README
4. **DO NOT** add .gitignore or license
5. Copy the SSH URL (looks like: `git@github.com:YOUR-ORG/bunch.git`)

---

## 🏃 Run Migration (1 command)

```bash
cd /Users/jimmyinfinity/Projects/poly_banter
./migrate-to-new-org.sh git@github.com:YOUR-ORG/bunch.git
```

**That's it!** The script will:
- ✅ Create clean copy (no git history)
- ✅ Initialize fresh repository
- ✅ Push to new organization
- ✅ Give you next steps

---

## 🔄 Post-Migration Setup (10 minutes)

### Railway Backend:
1. Dashboard → Backend Service → Settings
2. GitHub Repo → Configure
3. Select new repository
4. Verify: Root directory = `/backend`
5. Click "Deploy"

### Railway Frontend:
1. Dashboard → Frontend Service → Settings
2. GitHub Repo → Configure  
3. Select new repository
4. Verify: Root directory = `/frontend`
5. Click "Deploy"

### Vercel Admin:
1. Dashboard → Project → Settings
2. Git → Disconnect → Connect
3. Select new repository
4. **Set root directory: `/admin`**
5. Deploy

---

## ✅ Verification (5 minutes)

Test everything works:

```bash
# Backend API
curl https://your-backend.railway.app/api/health

# Frontend (visit in browser)
https://your-frontend.railway.app

# Admin (visit in browser)
https://your-admin.vercel.app
```

**Test login:**
- Wallet connect
- Twitter OAuth
- WebSocket messages

**Note**: All users will need to re-login (new JWT secrets)

---

## 🗑️ Clean Up Old Repo (optional)

**After verifying everything works:**

1. Go to old repository
2. Settings → Danger Zone
3. **Option A**: Archive repository (RECOMMENDED)
   - Preserves history
   - Prevents accidents
   - Can unarchive later
   
4. **Option B**: Delete repository
   - After 30 days
   - If you don't need history

---

## 🆘 If Something Goes Wrong

**Rollback:**
1. Railway: Reconnect to old repository
2. Vercel: Reconnect to old repository
3. Both will redeploy from old code
4. All env vars preserved

**Your old repository is safe** - nothing is deleted until you choose to!

---

## 📞 Support

If you hit any issues:
1. Check `SECURITY_AUDIT_REPORT.md` for details
2. Check `MIGRATION_GUIDE.md` for full instructions
3. All environment variables stay in Railway/Vercel
4. Only git repository changes

---

## Time Estimate

- ⏱️ Pre-flight: **10 minutes**
- ⏱️ Migration: **1 minute** (automated)
- ⏱️ Post-setup: **10 minutes**
- ⏱️ **Total: ~20 minutes**

**Ready? Let's go! 🚀**
