# Rebranding: Grex → Grex

**IMPORTANT:** This is a comprehensive rebranding guide.

---

## 🎯 Critical Files for Chrome Store Launch

These MUST be changed before submission:

### 1. Extension Manifest
**File:** `frontend/public/manifest.json`
- Change `name`: "Grex" → "Grex"
- Change `description`: Update to mention Grex
- Change `short_name`: "Grex" → "Grex"

### 2. Extension HTML
**File:** `frontend/index.html`
- Change `<title>Grex</title>` → `<title>Grex</title>`

### 3. Privacy Policy
**File:** `PRIVACY_POLICY.md`
- Replace all "Grex" with "Grex"

### 4. Terms of Service
**File:** `TERMS_OF_SERVICE.md`
- Replace all "Grex" with "Grex"

### 5. Chrome Store Listing
**File:** `CHROME_STORE_LAUNCH_GUIDE.md`
- Update all references from Grex to Grex
- New name: "Grex - Chat for Polymarket"
- New description: "Grex brings real-time chat to Polymarket..."

---

## 📝 All Files to Update

### Frontend Files (37 total)

#### Critical (User-Facing)
1. `frontend/public/manifest.json` - Extension name
2. `frontend/index.html` - Page title
3. `frontend/public/auth-success.html` - Success page
4. `frontend/public/service-worker.js` - Service worker
5. `frontend/public/content-script.js` - Content script
6. `frontend/src/components/auth/WalletConnect.tsx` - Login page
7. `frontend/src/components/chat/ChatsList.tsx` - Chat list
8. `frontend/src/components/profile/Settings.tsx` - Settings
9. `frontend/src/services/marketDetection.ts` - Market detection
10. `frontend/src/services/cloudinary.ts` - Image uploads

#### Backend Files
11. `backend/package.json` - Package name
12. `backend/src/main.ts` - App startup
13. `backend/src/app.service.ts` - App service
14. `backend/src/app.controller.ts` - App controller
15. `backend/public/auth-success.html` - Auth success
16. `backend/src/modules/auth/auth.controller.ts` - Auth
17. `backend/src/modules/media/media.service.ts` - Media
18. `backend/src/modules/polymarket/polymarket.service.ts` - Polymarket
19. `backend/src/scripts/README.md` - Scripts docs
20. `backend/src/scripts/utils/cache.ts` - Cache
21. `backend/src/scripts/utils/time.ts` - Time utils
22. `backend/src/scripts/utils/rateLimit.ts` - Rate limiting
23. `backend/src/seed-test-data.ts` - Seed data
24. `backend/env.example` - Env example

#### Documentation Files
25. `PRIVACY_POLICY.md` - Privacy policy
26. `TERMS_OF_SERVICE.md` - Terms
27. `SECURITY_AUDIT.md` - Security audit
28. `CHROME_STORE_LAUNCH_GUIDE.md` - Launch guide
29. `PRODUCTION_READY_SUMMARY.md` - Summary
30. `MODERATION_GUIDE.md` - Moderation
31. `PRE_LAUNCH_FIXES.md` - Pre-launch fixes
32. `MVP_LAUNCH_CHECKLIST.md` - Checklist
33. `OVERVIEW.md` - Overview

#### Infrastructure Files
34. `docker-compose.yml` - Docker
35. `scripts/setup-local.sh` - Setup script
36. `scripts/build-production.sh` - Build script
37. `scripts/verify-setup.sh` - Verify script

---

## 🚀 Quick Rebrand Script

Run this to rebrand all files at once:

```bash
#!/bin/bash

# Navigate to project root
cd /Users/jimmyinfinity/Projects/poly_banter

# Find and replace in all files
find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/dist/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/Grex/Grex/g' {} +

find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/dist/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/polybanter/grex/g' {} +

find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/dist/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/poly_banter/grex/g' {} +

echo "✅ Rebranding complete!"
echo "⚠️  Don't forget to:"
echo "  1. Update logo images"
echo "  2. Rebuild frontend: cd frontend && npm run build"
echo "  3. Test extension"
echo "  4. Update GitHub repo name"
```

---

## 🎨 Visual Assets to Update

### Logo & Icons
- `frontend/public/logo.png` - Main logo
- `frontend/public/icon-16.png` - Small icon
- `frontend/public/icon-48.png` - Medium icon
- `frontend/public/icon-128.png` - Large icon
- `frontend/public/favicon.png` - Favicon
- `frontend/public/text_logo.png` - Text logo

**Action Required:**
- Create new "Grex" logo
- Replace all icon files
- Maintain same dimensions

### Screenshots for Chrome Store
- All screenshots need to show "Grex" branding
- Update any visible "Grex" text in UI

---

## 📦 Package Names

### Frontend
**File:** `frontend/package.json`
```json
{
  "name": "grex-frontend",
  // ...
}
```

### Backend
**File:** `backend/package.json`
```json
{
  "name": "grex-backend",
  // ...
}
```

---

## 🌐 URLs & Links

### GitHub
- Repo name: `poly_banter` → `grex`
- Update all GitHub links in docs

### Railway
- Backend URL stays same (or update)
- Update environment variables if needed

### MongoDB
- Database name: `polybanter` → `grex` (optional, can keep)
- Collection names stay same

---

## ✅ Post-Rebrand Checklist

### Testing
- [ ] Extension loads without errors
- [ ] Login works
- [ ] Chats load
- [ ] Messages send
- [ ] All features functional
- [ ] No "Grex" visible in UI
- [ ] Console has no errors

### Build
- [ ] Frontend builds successfully
- [ ] Backend builds successfully
- [ ] Extension ZIP created
- [ ] All files included

### Documentation
- [ ] Privacy Policy updated
- [ ] Terms of Service updated
- [ ] Chrome Store description updated
- [ ] README updated (if exists)

### Visual
- [ ] New logo created
- [ ] All icons replaced
- [ ] Screenshots updated
- [ ] Branding consistent

---

## 🚨 Critical for Launch

**MUST DO before Chrome Store submission:**

1. ✅ Update `manifest.json` name
2. ✅ Update Privacy Policy
3. ✅ Update Terms of Service
4. ✅ Update Chrome Store listing text
5. ✅ Create new logo/icons
6. ✅ Rebuild extension
7. ✅ Test thoroughly

---

## 💡 Brand Identity: Grex

**Name:** Grex (Latin for "flock" or "herd")

**Tagline Ideas:**
- "Grex - Chat for Polymarket"
- "Grex - Where Traders Talk"
- "Grex - Prediction Market Chat"
- "Grex - Community for Polymarket"

**Description Template:**
```
Grex brings real-time chat to Polymarket, the world's largest prediction market.

Connect with traders, discuss predictions, and share insights in dedicated chat rooms for every market.
```

---

## ⏱️ Estimated Time

- **Automated rebrand:** 5 minutes (run script)
- **Logo creation:** 30-60 minutes
- **Testing:** 15-30 minutes
- **Rebuild & verify:** 15 minutes

**Total:** 1-2 hours

---

## 🆘 If Something Breaks

### Rollback
```bash
git reset --hard HEAD
```

### Selective Rebrand
If automated script causes issues, manually update:
1. manifest.json
2. Privacy Policy
3. Terms of Service
4. Chrome Store listing
5. Main UI components

---

**Ready to rebrand?** Run the script or update files manually!
