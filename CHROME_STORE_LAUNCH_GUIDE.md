# Chrome Web Store Launch Guide

**Date:** January 16, 2026  
**Extension:** Grex

---

## 🚀 Pre-Launch Checklist

### ✅ Before Submitting

- [x] Extension built and tested locally
- [x] All features working
- [x] Security audit complete (100%)
- [x] Privacy Policy created
- [x] Terms of Service created
- [ ] **Fix General chat visibility**
- [ ] **Verify user counts are real**
- [ ] Create promotional images
- [ ] Write store description
- [ ] Test in Chrome Canary
- [ ] Test in Chrome Beta
- [ ] Test in Chrome Stable

---

## 📋 Required Materials

### 1. Extension Files
**Location:** `/frontend/dist/`

**Required files:**
- `manifest.json` ✅
- `index.html` ✅
- `index.js` ✅
- `index.css` ✅
- `service-worker.js` ✅
- `content-script.js` ✅
- All images in `/public/` ✅

**Create ZIP file:**
```bash
cd frontend/dist
zip -r polybanter-extension.zip .
```

### 2. Store Listing Assets

#### Icon (Required)
- **128x128px** - Main icon
- **Location:** `frontend/public/icon-128.png` ✅
- **Format:** PNG with transparency
- **Requirements:** Clear, recognizable, no text

#### Screenshots (Required - at least 1, max 5)
**Size:** 1280x800px or 640x400px

**Recommended screenshots:**
1. **Chat List** - Show global chats, market chats
2. **Chat Room** - Show active conversation
3. **Market Integration** - Show Polymarket page with extension
4. **User Profile** - Show profile with badges
5. **Settings** - Show Polymarket verification

**How to capture:**
```bash
# Open extension in Chrome
# Set window to exactly 1280x800
# Use Chrome DevTools screenshot tool
# Or use macOS: Cmd+Shift+4, then Space, click window
```

#### Promotional Images (Optional but recommended)

**Small Tile:** 440x280px
**Marquee:** 1400x560px

**Tools:**
- Figma
- Canva
- Photoshop

### 3. Store Listing Text

#### Name (Required)
**Max 45 characters**

```
Grex - Chat for Polymarket
```

#### Short Description (Required)
**Max 132 characters**

```
Real-time chat for Polymarket traders. Discuss predictions, share insights, and connect with the community.
```

#### Detailed Description (Required)
**Max 16,000 characters**

```markdown
Grex brings real-time chat to Polymarket, the world's largest prediction market.

🎯 KEY FEATURES

• Market-Specific Chats - Discuss predictions in dedicated chat rooms for each market
• Global Categories - Join conversations about Politics, Sports, Crypto, Finance, and more
• Live Badges - Show your position (⚡) or whale status (🐳) in markets
• Direct Messages - Chat privately with friends
• GIFs & Images - Express yourself with rich media
• @Mentions & Replies - Engage in threaded conversations
• Real-Time Updates - Instant notifications for new messages

🔒 PRIVACY & SECURITY

• Twitter authentication (no passwords)
• Optional Polymarket wallet verification
• Content moderation active
• Report inappropriate content
• Block users

🚀 HOW IT WORKS

1. Install the extension
2. Connect with Twitter
3. Start chatting on any Polymarket page
4. (Optional) Verify your Polymarket wallet for badges

💬 CHAT TYPES

• Global Chats - Politics, Sports, Crypto, Finance, Tech, Culture, and more
• Market Chats - Dedicated rooms for each Polymarket prediction
• Direct Messages - Private conversations with friends
• Group Chats - Create custom groups

🎖️ BADGES & RANKS

• ⚡ Position Badge - Show you have a position in a market
• 🐳 Whale Badge - Display your top 10% status
• Rank System - Earn ranks based on activity

📱 FEATURES

• Favorites - Pin your favorite chats
• Search - Find messages and users
• Reactions - React to messages with emojis
• Notifications - Stay updated on mentions and replies

🔗 LINKS

• Privacy Policy: [link]
• Terms of Service: [link]
• GitHub: https://github.com/jimmy7infinity/poly_banter
• Support: [link]

Grex is built by traders, for traders. Join the conversation!
```

#### Category (Required)
**Choose:** Social & Communication

#### Language (Required)
**Choose:** English

---

## 🏪 Chrome Web Store Submission Process

### Step 1: Create Developer Account

1. Go to: https://chrome.google.com/webstore/devconsole
2. Sign in with Google account
3. Pay **$5 one-time registration fee**
4. Verify your email
5. Accept Developer Agreement

### Step 2: Prepare Extension Package

```bash
cd /Users/jimmyinfinity/Projects/poly_banter/frontend

# Build production version
npm run build

# Copy extension files
node scripts/copy-extension-files.js

# Create ZIP
cd dist
zip -r ../polybanter-extension.zip .
cd ..

# Verify ZIP contents
unzip -l polybanter-extension.zip
```

**Verify ZIP includes:**
- ✅ manifest.json
- ✅ All JS/CSS/HTML files
- ✅ All images
- ✅ service-worker.js
- ✅ content-script.js

### Step 3: Upload Extension

1. Go to Chrome Web Store Developer Dashboard
2. Click **"New Item"**
3. Upload `polybanter-extension.zip`
4. Wait for upload to complete
5. Click **"Continue"**

### Step 4: Fill Out Store Listing

#### Product Details Tab

**Extension Name:**
```
Grex
```

**Summary:**
```
Real-time chat for Polymarket traders
```

**Description:**
```
[Paste detailed description from above]
```

**Category:**
- Social & Communication

**Language:**
- English

#### Graphic Assets Tab

**Upload:**
1. Icon (128x128) - `icon-128.png`
2. Small tile (440x280) - Create this
3. Screenshots (1280x800) - Create 3-5
4. Marquee (1400x560) - Optional

#### Privacy Tab

**Single Purpose:**
```
Grex provides real-time chat functionality for Polymarket users, enabling community discussions around prediction markets.
```

**Permission Justification:**

**For `storage` permission:**
```
Required to store user authentication tokens and chat preferences locally.
```

**For `activeTab` permission:**
```
Required to detect when users are viewing Polymarket pages to show relevant market chats.
```

**For `identity` permission:**
```
Required for Twitter OAuth authentication flow.
```

**Privacy Policy URL:**
```
https://github.com/jimmy7infinity/poly_banter/blob/main/PRIVACY_POLICY.md
```

**Data Usage:**
- [x] Authentication information
- [x] Personal communications
- [x] User activity

**Data Handling:**
- [x] Data is encrypted in transit
- [x] Users can request data deletion
- [x] Data is not sold to third parties

#### Distribution Tab

**Visibility:**
- [x] Public
- [ ] Unlisted

**Regions:**
- [x] All regions (or select specific countries)

**Pricing:**
- [x] Free

### Step 5: Submit for Review

1. Review all information
2. Click **"Submit for Review"**
3. Wait for Google review (typically 1-3 days)

---

## 📊 Review Process

### What Google Reviews

1. **Functionality** - Extension works as described
2. **Privacy** - Follows privacy best practices
3. **Security** - No malicious code
4. **Content** - Appropriate content
5. **Permissions** - Justified permissions
6. **Manifest** - Valid manifest.json
7. **Store Listing** - Accurate description

### Common Rejection Reasons

❌ **Misleading description**
- Solution: Be accurate and specific

❌ **Unjustified permissions**
- Solution: Explain each permission clearly

❌ **Privacy policy missing**
- Solution: Include valid privacy policy URL ✅

❌ **Broken functionality**
- Solution: Test thoroughly before submitting

❌ **Poor quality screenshots**
- Solution: Use high-resolution, clear images

### Review Timeline

- **Typical:** 1-3 business days
- **Complex:** Up to 7 days
- **Rejected:** Resubmit after fixes

---

## 🔧 Post-Submission

### If Approved ✅

1. **Celebrate!** 🎉
2. Extension goes live immediately
3. Share the link:
   ```
   https://chrome.google.com/webstore/detail/[your-extension-id]
   ```
4. Monitor reviews and ratings
5. Respond to user feedback

### If Rejected ❌

1. Read rejection email carefully
2. Fix the issues mentioned
3. Update extension if needed
4. Resubmit (no additional fee)
5. Respond to reviewer comments

---

## 📈 Post-Launch

### Marketing

1. **Twitter/X Announcement**
   ```
   🚀 Grex is now live!
   
   Real-time chat for @Polymarket traders
   
   ✅ Market-specific chats
   ✅ Whale badges
   ✅ Direct messages
   ✅ GIFs & reactions
   
   Install: [Chrome Store Link]
   ```

2. **Polymarket Discord**
   - Share in appropriate channels
   - Get community feedback

3. **Reddit**
   - r/Polymarket
   - r/PredictionMarkets

4. **Product Hunt**
   - Submit as new product
   - Get upvotes and feedback

### Monitoring

**Daily (First Week):**
- Check Chrome Web Store reviews
- Monitor Railway logs for errors
- Check MongoDB for issues
- Respond to user feedback

**Weekly:**
- Review analytics
- Check crash reports
- Update based on feedback
- Plan new features

### Updates

**To Update Extension:**
1. Make changes to code
2. Increment version in `manifest.json`
3. Build: `npm run build`
4. Create new ZIP
5. Upload to Chrome Web Store
6. Submit for review

**Version Numbering:**
- Major: `2.0.0` - Breaking changes
- Minor: `1.1.0` - New features
- Patch: `1.0.1` - Bug fixes

---

## 🛠️ Pre-Launch Fixes Needed

### 1. Fix General Chat Visibility

**Issue:** General chat not showing at top of Global Banter

**Solution:**
```bash
# Seed global chats to production database
# Use Railway dashboard or MongoDB Atlas to run:
db.conversations.insertOne({
  type: 'global',
  title: 'General',
  slug: 'general',
  is_private: false,
  participant_count: 0,
  created_at: new Date(),
  updated_at: new Date()
})
```

### 2. Fix Fake User Counts

**Issue:** Politics and Crypto showing fake counts

**Check backend:**
- Verify `participant_count` is real
- Check if hardcoded values exist
- Ensure counts update on join/leave

**Files to check:**
- `backend/src/modules/chat/chat.service.ts`
- `backend/src/modules/chat/chat.gateway.ts`

---

## 📞 Support Resources

**Chrome Web Store Help:**
- https://developer.chrome.com/docs/webstore/

**Developer Dashboard:**
- https://chrome.google.com/webstore/devconsole

**Extension Best Practices:**
- https://developer.chrome.com/docs/extensions/mv3/

**Contact:**
- GitHub Issues: https://github.com/jimmy7infinity/poly_banter/issues

---

## ✅ Final Checklist

Before submitting to Chrome Web Store:

- [ ] Extension tested in Chrome
- [ ] All features working
- [ ] Screenshots created (3-5)
- [ ] Store description written
- [ ] Privacy Policy URL added
- [ ] Terms of Service URL added
- [ ] Icon (128x128) ready
- [ ] ZIP file created
- [ ] Developer account created ($5 paid)
- [ ] General chat seeded to database
- [ ] User counts verified as real
- [ ] Tested on Polymarket.com
- [ ] No console errors
- [ ] Railway backend stable

---

**Estimated Time to Launch:** 2-4 hours (plus 1-3 days review)

**Good luck with your launch!** 🚀
