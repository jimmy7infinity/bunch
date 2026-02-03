# Admin Dashboard Deployment Guide

## Quick Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

```bash
cd /Users/jimmyinfinity/Projects/poly_banter
git add admin/
git commit -m "Admin dashboard ready for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository (`jimmy7infinity/bunch`)
4. **Important:** Set Root Directory to `admin`
5. Click "Continue"

### Step 3: Configure Build Settings

Vercel should auto-detect Next.js. Verify:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Step 4: Add Environment Variable

Click "Environment Variables":

```
Name: NEXT_PUBLIC_API_URL
Value: https://bunch.up.railway.app/api
```

⚠️ **CRITICAL:** Ensure this matches your Railway backend URL!

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build (1-2 minutes)
3. ✅ Deployment complete!

---

## Post-Deployment Testing

### Test 1: Access Dashboard

1. Visit your Vercel URL (e.g., `https://admin-bunch.vercel.app`)
2. You should see the login page
3. ✅ If you see login page, continue

### Test 2: OAuth Flow

1. Click "Login with Twitter"
2. Authorize the app
3. You should redirect back to `/dashboard`
4. ✅ If you see dashboard, OAuth works!

### Test 3: Admin Pages

Test each page:
- [ ] Dashboard - View stats
- [ ] Messages - Load recent messages
- [ ] Media - View images/GIFs
- [ ] Users - Search for a user
- [ ] Reports - View reports
- [ ] Chatrooms - Select a room, send message
- [ ] Invite Codes - Generate a code
- [ ] Actions - Send announcement (test carefully!)
- [ ] Profile - View your profile

### Test 4: Emoji Reactions

1. Go to Chatrooms
2. Select a conversation
3. Click emoji button on a message
4. Select emoji
5. ✅ Emoji should appear below message, not overlapping

---

## Custom Domain Setup

### Add Custom Domain

1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Add domain (e.g., `admin.bunch.com`)
4. Follow DNS instructions

### DNS Configuration

Add these records to your DNS provider:

```
Type: A
Name: admin
Value: 76.76.21.21

Type: CNAME  
Name: admin
Value: cname.vercel-dns.com
```

### SSL Certificate

✅ Vercel automatically provisions SSL
✅ Wait 5-10 minutes for DNS propagation
✅ Visit `https://admin.bunch.com`

---

## Environment Variables

### Production Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```bash
# Required
NEXT_PUBLIC_API_URL=https://bunch.up.railway.app/api
```

### Development Variables

Create `/admin/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Troubleshooting

### Issue: "OAuth redirect not working"

**Symptom:** After Twitter login, you get error or blank page

**Fix:**
1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify Railway backend is running
3. Check backend Twitter OAuth redirect_uri accepts Vercel URL
4. Update backend `.env` if needed:
   ```
   FRONTEND_URL=https://admin-bunch.vercel.app
   ```

### Issue: "API calls failing"

**Symptom:** Pages load but show "Failed to fetch" errors

**Fix:**
1. Open browser DevTools → Network tab
2. Check API URL in requests
3. Verify `NEXT_PUBLIC_API_URL` is set correctly
4. Ensure Railway backend allows CORS from Vercel domain

### Issue: "Emoji reactions overlapping"

**Symptom:** Emojis stack on top of each other

**Fix:**
✅ Already fixed in latest code!
- Updated chatrooms page with `flex-wrap gap-1`
- Emojis now display side-by-side with proper spacing

### Issue: "Build failing on Vercel"

**Symptom:** Deployment fails during build

**Fix:**
1. Check Vercel build logs
2. Run `npm run build` locally first
3. Fix TypeScript errors
4. Ensure all dependencies in `package.json`
5. Verify `next.config.ts` is valid

### Issue: "Can't access admin panel"

**Symptom:** Get "Access Denied" or redirected to login

**Fix:**
1. Verify your account has role: `admin`, `moderator`, or `creator`
2. Check user status is `active` (not banned/suspended)
3. Check MongoDB: `db.users.findOne({ twitter_id: "YOUR_ID" })`
4. Update role if needed:
   ```javascript
   db.users.updateOne(
     { twitter_id: "YOUR_ID" },
     { $set: { role: "admin" } }
   )
   ```

---

## Monitoring & Maintenance

### Vercel Analytics

Enable in Dashboard → Analytics:
- Page views
- Response times
- Error rates

### Deployment Notifications

Configure in Settings → Git:
- Slack notifications
- Email alerts
- Discord webhooks

### Auto-Deploy

✅ Enabled by default!
- Push to `main` branch
- Vercel auto-deploys
- Takes 1-2 minutes

---

## Rollback

### If Deployment Breaks

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. ✅ Instantly rolled back!

### Revert Code

```bash
git log --oneline
git revert <commit-hash>
git push origin main
```

---

## Performance Optimization

### Already Configured

✅ Next.js Image Optimization
✅ Automatic code splitting
✅ Static generation where possible
✅ React Strict Mode enabled

### Recommendations

1. **Enable Vercel Speed Insights**
   - Dashboard → Speed Insights
   - Monitor Core Web Vitals

2. **Use Vercel Edge Network**
   - Automatic with Vercel
   - CDN for assets

3. **Optimize Images**
   - Use Next.js `<Image>` component
   - Already configured for Cloudinary, Twitter, Tenor, Giphy

---

## Security Updates

### Keep Dependencies Updated

```bash
cd admin

# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix

# Test locally
npm run build
npm run dev

# If tests pass, deploy
git add .
git commit -m "Update dependencies"
git push
```

### Vercel Security

✅ Automatically applied:
- DDoS protection
- SSL/TLS certificates
- Edge firewall
- Rate limiting

---

## Scaling

### Current Setup

- **Frontend:** Vercel (auto-scales)
- **Backend:** Railway (single instance)
- **Database:** MongoDB Atlas (shared cluster)

### If Traffic Increases

1. **Upgrade Railway Plan**
   - More CPU/RAM
   - Multiple instances

2. **Upgrade MongoDB Atlas**
   - Dedicated cluster
   - More storage
   - Better performance

3. **Add Caching**
   - Redis for API responses
   - Vercel Edge Caching

---

## Backup & Recovery

### Automatic Backups

✅ MongoDB Atlas: Daily backups (last 7 days)
✅ Vercel: All deployments saved
✅ GitHub: Full git history

### Manual Backup

```bash
# Backup MongoDB
mongodump --uri="mongodb+srv://..." --out=backup-2026-02-03

# Backup Code
git clone https://github.com/jimmy7infinity/bunch.git backup
```

### Recovery

1. MongoDB: Restore from Atlas snapshot
2. Code: Deploy previous commit from Vercel
3. Environment Variables: Keep backup in secure location

---

## Cost Estimation

### Vercel Pricing

**Hobby (Free):**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Custom domains
- ✅ Automatic HTTPS
- ⚠️ Analytics limited

**Pro ($20/month):**
- ✅ Advanced analytics
- ✅ 1 TB bandwidth
- ✅ Team collaboration
- ✅ Custom redirect rules

### Recommendation

Start with **Hobby (Free)** for admin dashboard:
- Low traffic expected
- Small team
- Free tier sufficient

Upgrade to Pro if:
- Need detailed analytics
- Multiple admins
- High bandwidth usage

---

## Support

### Documentation

- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Deployment Issues: Check Vercel logs

### Community

- GitHub Issues (non-security)
- Discord/Twitter (general help)

### Security Issues

Email: jimmy7infinity@gmail.com
Subject: "Bunch Admin Security"

---

## Checklist: Ready for Production?

### Before Deploying

- [ ] Code pushed to GitHub
- [ ] `.env.example` documented
- [ ] `.env` and `.env.local` in `.gitignore`
- [ ] Security headers configured
- [ ] All pages tested locally
- [ ] TypeScript builds without errors
- [ ] No ESLint warnings

### After Deploying

- [ ] OAuth flow works end-to-end
- [ ] All pages load correctly
- [ ] API calls succeed
- [ ] Admin actions work (ban, mute, delete)
- [ ] Invite codes generate properly
- [ ] Emoji reactions display correctly
- [ ] Mobile responsive (test on phone)

### Ongoing

- [ ] Monitor Vercel logs weekly
- [ ] Update dependencies monthly
- [ ] Review security quarterly
- [ ] Test disaster recovery annually

---

**Deployment Date:** February 3, 2026
**Deployed By:** jimmy7infinity
**Status:** ✅ Production Ready

Happy deploying! 🚀
