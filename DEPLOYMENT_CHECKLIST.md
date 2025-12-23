# PolyBanter Deployment Checklist

Use this checklist to ensure a smooth deployment.

---

## Pre-Deployment Checklist

### Code Preparation

- [ ] All code committed to Git
- [ ] No console.log statements in production code (or wrapped in DEV checks)
- [ ] Environment variables documented
- [ ] Dependencies up to date
- [ ] No security vulnerabilities (`npm audit`)

### Testing

- [ ] Backend runs locally without errors
- [ ] Frontend runs locally without errors
- [ ] Extension loads in Chrome without errors
- [ ] Wallet authentication works
- [ ] Chat messages send and receive
- [ ] WebSocket connection stable
- [ ] Reactions work
- [ ] Online user count displays

### Documentation

- [ ] README.md updated
- [ ] Deployment guides reviewed
- [ ] Environment variables documented
- [ ] API endpoints documented

---

## Railway Backend Deployment

### Setup

- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] Project created in Railway
- [ ] MongoDB plugin added
- [ ] Redis plugin added

### Configuration

- [ ] `NODE_ENV=production` set
- [ ] `PORT=3000` set
- [ ] `API_PREFIX=api` set
- [ ] `MONGODB_URI` configured (from MongoDB plugin)
- [ ] `REDIS_HOST` configured (from Redis plugin)
- [ ] `JWT_SECRET` generated and set (strong random string)
- [ ] `JWT_EXPIRES_IN=7d` set
- [ ] `FRONTEND_URL=chrome-extension://*` set
- [ ] `THROTTLE_TTL=60` set
- [ ] `THROTTLE_LIMIT=100` set

### Deployment

- [ ] Backend deployed successfully
- [ ] Public domain generated
- [ ] Domain URL copied and saved
- [ ] Deployment logs checked (no errors)
- [ ] MongoDB connection verified
- [ ] Redis connection verified

### Testing

- [ ] Health endpoint accessible: `curl https://your-app.railway.app/api`
- [ ] Auth nonce endpoint works: `curl https://your-app.railway.app/api/auth/nonce`
- [ ] WebSocket endpoint accessible
- [ ] No CORS errors in logs

---

## Chrome Extension Build

### Environment Setup

- [ ] `.env.production` created in frontend folder
- [ ] `VITE_API_URL` set to Railway URL + `/api`
- [ ] `VITE_WS_URL` set to Railway URL
- [ ] `VITE_ENV=production` set

### Manifest Update

- [ ] Version number updated (if not first deploy)
- [ ] Description is clear and professional
- [ ] `host_permissions` includes Railway domain
- [ ] Icons are present (16, 48, 128px)
- [ ] All required permissions listed

### Build

- [ ] `npm run build:extension` completes successfully
- [ ] `dist/` folder contains all necessary files
- [ ] `manifest.json` present in dist
- [ ] `index.html` present in dist
- [ ] Icons present in dist
- [ ] No build errors or warnings

### Packaging

- [ ] Extension zipped: `polybanter-extension-v{version}.zip`
- [ ] ZIP file size reasonable (<10MB)
- [ ] ZIP contains all necessary files

---

## Extension Testing

### Local Testing

- [ ] Extension loads in Chrome without errors
- [ ] Side panel opens when clicking extension icon
- [ ] No console errors on load
- [ ] API URL logs show correct Railway URL
- [ ] WebSocket URL logs show correct Railway URL

### Authentication Testing

- [ ] "Connect Wallet" button visible
- [ ] MetaMask popup appears on click
- [ ] Message signing works
- [ ] JWT token received and stored
- [ ] User data displayed after login
- [ ] Token persists after page refresh

### Chat Testing

- [ ] Chat interface displays
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Can add reactions
- [ ] Online user count displays
- [ ] WebSocket connection stable
- [ ] No disconnection issues

### Multi-User Testing

- [ ] Second user can install extension
- [ ] Both users can login
- [ ] Messages sync between users
- [ ] Reactions sync between users
- [ ] Online count updates correctly

---

## Distribution

### Private Distribution (Friends)

- [ ] Extension ZIP file ready
- [ ] Installation instructions prepared
- [ ] Shared via Google Drive/Dropbox/Email
- [ ] At least one friend tested successfully

### Chrome Web Store (Optional)

- [ ] Developer account created ($5 paid)
- [ ] Store listing prepared
  - [ ] Name: PolyBanter
  - [ ] Description written
  - [ ] Category selected
  - [ ] Screenshots created (1280x800)
  - [ ] Promotional images created (optional)
  - [ ] Privacy policy URL (if needed)
- [ ] Extension uploaded
- [ ] Submitted for review
- [ ] Review approved
- [ ] Published to store

---

## Post-Deployment

### Monitoring

- [ ] Railway dashboard bookmarked
- [ ] Logs accessible and readable
- [ ] Metrics visible (CPU, memory, network)
- [ ] Alerts configured (optional)

### User Feedback

- [ ] Feedback channel established (Discord/Telegram/Email)
- [ ] Bug reporting process documented
- [ ] Feature request process documented

### Documentation

- [ ] Railway URL documented
- [ ] Extension version documented
- [ ] Known issues documented
- [ ] Roadmap updated

---

## Continuous Deployment

### Backend Updates

- [ ] Git workflow established
- [ ] Railway auto-deploy configured
- [ ] Rollback process understood
- [ ] Database migration strategy planned

### Extension Updates

- [ ] Version numbering strategy defined
- [ ] Build script tested
- [ ] Distribution process documented
- [ ] Update notification plan (if applicable)

---

## Security Checklist

### Backend

- [ ] JWT_SECRET is strong and unique
- [ ] HTTPS enforced (Railway does this automatically)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] MongoDB credentials secure
- [ ] Redis credentials secure
- [ ] No sensitive data in logs

### Extension

- [ ] No API keys in code
- [ ] No sensitive data in localStorage
- [ ] Permissions minimal and justified
- [ ] Content Security Policy configured
- [ ] No eval() or unsafe code

### Database

- [ ] MongoDB authentication enabled
- [ ] Database backups configured
- [ ] Access restricted to Railway network
- [ ] No default passwords

---

## Troubleshooting Checklist

### Backend Issues

- [ ] Railway service is running
- [ ] Environment variables are set correctly
- [ ] MongoDB is connected
- [ ] Redis is connected
- [ ] Logs show no errors
- [ ] Domain is accessible

### Extension Issues

- [ ] Manifest.json is valid
- [ ] All files present in dist/
- [ ] API URL is correct
- [ ] WebSocket URL is correct
- [ ] CORS headers allow extension
- [ ] No console errors

### Connection Issues

- [ ] Railway backend is accessible
- [ ] HTTPS/WSS protocols used
- [ ] CORS configured for chrome-extension://
- [ ] Network tab shows successful requests
- [ ] WebSocket handshake successful

---

## Success Criteria

### Minimum Viable Deployment

- [x] Backend deployed and accessible
- [x] Extension builds successfully
- [x] At least 1 user can login
- [x] Chat messages work
- [x] No critical errors

### Production Ready

- [ ] Backend stable for 24 hours
- [ ] 3+ users tested successfully
- [ ] No data loss
- [ ] WebSocket stable
- [ ] Performance acceptable
- [ ] Documentation complete

### Scale Ready

- [ ] 10+ concurrent users tested
- [ ] Database optimized
- [ ] Monitoring in place
- [ ] Backup strategy implemented
- [ ] CI/CD pipeline configured

---

## Emergency Contacts

### Services

- **Railway Support**: https://railway.app/help
- **Chrome Web Store**: https://support.google.com/chrome_webstore
- **MongoDB Atlas**: https://www.mongodb.com/support

### Internal

- **Project Lead**: [Your Name]
- **Backend**: [Contact]
- **Frontend**: [Contact]
- **DevOps**: [Contact]

---

## Rollback Plan

### Backend Rollback

1. Go to Railway dashboard
2. Click "Deployments" tab
3. Find last working deployment
4. Click "Redeploy"
5. Verify rollback successful

### Extension Rollback

1. Find previous version ZIP
2. Upload to Chrome Web Store (if published)
3. Or share previous version with users
4. Notify users of rollback

---

## Next Steps After Deployment

### Week 1

- [ ] Monitor logs daily
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Document issues

### Week 2-4

- [ ] Analyze usage patterns
- [ ] Optimize performance
- [ ] Add requested features
- [ ] Improve documentation

### Month 2+

- [ ] Scale infrastructure if needed
- [ ] Add advanced features
- [ ] Expand user base
- [ ] Consider monetization

---

**Print this checklist and check off items as you complete them!** ✅

