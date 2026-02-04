# Migration Guide: Moving to New GitHub Organization

## ✅ Pre-Migration Checklist

- [x] Cleaned up internal documentation (14 files removed)
- [x] Committed and pushed cleanup to current repo
- [ ] Create new organization on GitHub
- [ ] Create new repository in organization
- [ ] Update Railway configuration
- [ ] Update Vercel configuration
- [ ] Test deployments

## 📋 Step-by-Step Instructions

### 1. Create New GitHub Organization & Repository

1. Go to GitHub → Create new organization
2. Create new repository in the organization (e.g., `your-org/bunch`)
3. **DO NOT initialize with README** (we'll push existing code)

### 2. Update Local Repository

```bash
cd /Users/jimmyinfinity/Projects/poly_banter

# Add new remote (keep old as backup)
git remote add new-org git@github.com:YOUR-ORG/bunch.git

# Push to new repository
git push new-org main

# Optional: Set new-org as default origin
git remote rename origin old-origin
git remote rename new-org origin
```

### 3. Update Railway (Backend + Frontend)

**Railway automatically deploys from GitHub repo, so we need to update the connection:**

1. Go to Railway Dashboard
2. For **Backend Service**:
   - Settings → Service Settings → GitHub Repo
   - Click "Configure GitHub App"
   - Grant access to new organization
   - Select new repository
   - Verify root directory is still `/backend`
   - Verify build command: `npm install && npm run build`
   - Verify start command: `npm run start:prod`

3. For **Frontend Service**:
   - Settings → Service Settings → GitHub Repo
   - Click "Configure GitHub App"
   - Select new repository  
   - Verify root directory is still `/frontend`
   - Verify build command: `npm install && npm run build`
   - No start command needed (static files)

4. **Environment Variables** (No changes needed):
   - All env vars are stored in Railway
   - They don't need to be updated for repo change
   - Just verify they're still there after repo switch

5. **Trigger New Deployment**:
   - After connecting new repo, Railway should auto-deploy
   - If not, click "Deploy" manually

### 4. Update Vercel (Admin Panel)

1. Go to Vercel Dashboard
2. Select the admin panel project
3. Settings → Git
4. Click "Disconnect Git"
5. Click "Connect Git Repository"
6. Grant access to new organization
7. Select new repository
8. **Important**: Set root directory to `admin`
9. Framework Preset: Next.js
10. Build Command: `npm run build`
11. Output Directory: `.next`
12. Install Command: `npm install`

**Environment Variables** (No changes needed):
- All env vars are stored in Vercel
- They persist through repo changes
- Verify they're still there after reconnection

### 5. Verify Deployments

**Backend (Railway):**
```bash
curl https://your-backend.railway.app/api/health
```

**Frontend (Railway):**
- Visit your frontend URL
- Test wallet login
- Test Twitter login
- Check WebSocket connection

**Admin Panel (Vercel):**
- Visit your admin URL
- Test admin login
- Verify dashboard loads

### 6. Update Repository Settings (New Org)

1. **Branch Protection** (if needed):
   - Settings → Branches
   - Add rule for `main` branch

2. **Secrets** (if any):
   - Settings → Secrets and variables → Actions
   - Add any GitHub Actions secrets if needed

3. **Collaborators**:
   - Settings → Collaborators
   - Add team members

### 7. Clean Up Old Repository (Optional)

**After verifying everything works:**

1. Archive old repository:
   - Go to old repo settings
   - Scroll to "Danger Zone"
   - Click "Archive this repository"

2. Or redirect to new one:
   - Add notice in old repo README
   - Point to new organization

## 🚨 Important Notes

### What DOESN'T Break:
- ✅ Railway deployments (just reconnect repo)
- ✅ Vercel deployments (just reconnect repo)
- ✅ Environment variables (stored in Railway/Vercel)
- ✅ Database connections (env vars unchanged)
- ✅ API keys (env vars unchanged)
- ✅ Domain names (stay the same)

### What REQUIRES Action:
- ⚠️ Railway GitHub connection (manual update)
- ⚠️ Vercel GitHub connection (manual update)
- ⚠️ GitHub webhooks (if any custom ones)

### File Structure (Unchanged):
```
/
├── backend/          # Railway service
├── frontend/         # Railway service  
├── admin/            # Vercel project
├── website/          # Not deployed yet
├── scripts/          # Maintenance scripts
├── package.json      # Monorepo config
└── railway.json      # Railway config
```

## 🔍 Verification Checklist

After migration, verify:

- [ ] Backend API responds at Railway URL
- [ ] Frontend loads at Railway URL
- [ ] Admin panel loads at Vercel URL
- [ ] WebSocket connections work
- [ ] Database queries work
- [ ] File uploads work (if any)
- [ ] Authentication works (wallet + Twitter)
- [ ] All environment variables present

## 📞 Rollback Plan (If Needed)

If something breaks:

1. Railway: Reconnect to old repository
2. Vercel: Reconnect to old repository
3. Both services will redeploy from old repo
4. All env vars and configs preserved

## 🎉 Post-Migration

1. Update documentation references to new repo URL
2. Update any external links
3. Archive or delete old repo
4. Celebrate! 🚀
