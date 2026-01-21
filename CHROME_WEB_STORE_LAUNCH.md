# Chrome Web Store Launch Guide for Bunch

**Status:** Ready for Submission ✅  
**Last Updated:** January 14, 2026

---

## 🎯 Pre-Launch Checklist

### ✅ Technical Requirements
- [x] Extension tested in Chrome/Chromium
- [x] Manifest v3 compliant
- [x] All permissions justified
- [x] No console errors or warnings
- [x] OAuth flow working (Twitter)
- [x] WebSocket connections stable
- [x] All features tested end-to-end
- [x] Security audit complete
- [x] Privacy Policy & Terms of Service created
- [x] Route conflicts fixed (favorite endpoint)

### ✅ Assets Required
- [x] 128x128 icon (`frontend/public/icon-128.png`)
- [x] 48x48 icon (`frontend/public/icon-48.png`)
- [x] 16x16 icon (`frontend/public/icon-16.png`)
- [x] Logo (`frontend/public/logo.png`)
- [ ] **NEED: Screenshots (1280x800 or 640x400)**
- [ ] **NEED: Promotional tile (440x280)**
- [ ] **OPTIONAL: Marquee promo tile (1400x560)**

---

## 📸 Required Assets to Create

### 1. Screenshots (REQUIRED - at least 1, max 5)
**Dimensions:** 1280x800 or 640x400  
**Format:** PNG or JPEG  
**What to capture:**

1. **Login Screen** - Show the wallet connect and Twitter auth options
2. **Chat List** - Show global chats, market chats, and DMs
3. **Active Chat** - Show a conversation with messages, reactions, positions
4. **Market Context** - Show how Bunch detects Polymarket pages
5. **Leaderboard/Profile** - Show user ranks and profiles

**How to take screenshots:**
```bash
# 1. Open your extension in Chrome
# 2. Set browser window to 1280x800
# 3. Use Chrome DevTools > Device Mode or screenshot tool
# 4. Save as PNG files named:
#    - screenshot-1-login.png
#    - screenshot-2-chatlist.png
#    - screenshot-3-chat.png
#    - screenshot-4-market.png
#    - screenshot-5-leaderboard.png
```

### 2. Small Promotional Tile (REQUIRED)
**Dimensions:** 440x280 pixels  
**Format:** PNG or JPEG  
**Design suggestions:**
- Bunch logo centered
- Tagline: "Chat for Polymarket Traders"
- Clean, minimal design
- Brand colors (match your UI)

### 3. Marquee Promo Tile (OPTIONAL but RECOMMENDED)
**Dimensions:** 1400x560 pixels  
**Format:** PNG or JPEG  
**Design suggestions:**
- Hero image showing extension in action
- "Connect, Collaborate, Compete" tagline
- Feature highlights (Real-time Chat, Market Context, Leaderboards)

---

## 📝 Chrome Web Store Listing Content

### Extension Name
```
Bunch - Chat for Polymarket Traders
```

### Short Description (132 characters max)
```
Real-time chat for Polymarket traders. Connect with the community, discuss markets, and share insights directly in your browser.
```

### Detailed Description (16,000 characters max)

```markdown
# Bunch - The Ultimate Chat Experience for Polymarket Traders

Connect, collaborate, and compete with fellow Polymarket traders in real-time. Bunch brings community chat directly to your browser with context-aware conversations and seamless integration.

## 🚀 Key Features

### Real-Time Chat
- Instant messaging with WebSocket technology
- Message reactions and replies
- GIF support via Tenor
- @mentions to notify specific users
- Message threading for organized discussions

### Market Context Awareness
- Automatically detects which Polymarket page you're viewing
- Join market-specific chats with one click
- Share positions and discuss predictions in context
- Auto-join feature keeps you connected to relevant conversations

### Global Community Chats
- General discussion chat for all traders
- Topic-specific channels (Sports, Politics, Crypto, etc.)
- Create private group chats with friends
- Direct messaging for one-on-one conversations

### User Ranks & Leaderboards
- Earn ranks based on activity and engagement
- Track your progress from Rookie to Legend
- Compete on leaderboards
- Special badges for creators, moderators, and admins

### Privacy & Security
- Wallet-based authentication via MetaMask/WalletConnect
- Twitter OAuth for social login
- Content moderation and reporting
- User blocking and privacy controls
- End-to-end message encryption (coming soon)

### Seamless Integration
- Chrome extension side panel
- Non-intrusive design
- Works alongside your Polymarket browsing
- Desktop notifications for mentions and DMs

## 🎯 Perfect For

- **Active Traders** - Discuss strategies and market movements in real-time
- **Community Builders** - Create groups and foster discussion
- **Information Seekers** - Get insights from experienced traders
- **Social Traders** - Connect with like-minded individuals

## 🔒 Privacy & Data

Your privacy matters to us:
- Minimal data collection (only what's necessary)
- No selling of user data
- Secure authentication
- Full Privacy Policy available at: https://bunch.up.railway.app/privacy
- Terms of Service: https://bunch.up.railway.app/terms

## 📱 Getting Started

1. Install the Bunch extension
2. Click the extension icon to open the side panel
3. Connect your wallet or sign in with Twitter
4. Start chatting in global rooms or market-specific chats
5. Invite friends and build your network

## 💡 Tips

- Use @username to mention specific users
- React with emojis to show quick agreement
- Join market chats automatically when viewing Polymarket pages
- Create private groups for your trading squad
- Check leaderboards to see top community members

## 🛠️ Support

Need help? Have feedback?
- Email: support@bunch.app (replace with your actual support email)
- Twitter: @BunchChat (replace with your actual Twitter handle)
- Report issues directly in the app

## 🔄 Regular Updates

We're constantly improving Bunch with new features:
- Enhanced moderation tools
- Advanced analytics
- Whale detection alerts
- Portfolio tracking integration
- And much more!

---

**Disclaimer:** Bunch is a community chat platform and does not provide financial advice. All discussions and opinions shared are those of individual users. Trade responsibly.

**Not affiliated with Polymarket** - Bunch is an independent, community-driven platform.
```

### Category
```
Social & Communication
```

### Language
```
English (United States)
```

### Privacy Policy URL
```
https://bunch.up.railway.app/privacy
```

(Note: You'll need to create this page on your domain or host the PRIVACY_POLICY.md as a public webpage)

### Terms of Service URL (Optional but Recommended)
```
https://bunch.up.railway.app/terms
```

---

## 🏗️ Step-by-Step Submission Process

### Step 1: Create Developer Account
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Sign in with your Google account
3. Pay the one-time $5 developer registration fee
4. Complete your developer profile

### Step 2: Prepare Your Extension Package

**Build the production version:**
```bash
cd frontend
npm run build
```

**Create the ZIP file:**
```bash
# The build creates a 'dist' folder
cd dist
zip -r ../bunch-extension.zip .
cd ..
```

**Verify the ZIP contains:**
- `manifest.json`
- `service-worker.js`
- `content-script.js`
- All icon files (16x16, 48x48, 128x128)
- All necessary assets
- `index.html` and compiled JS/CSS

### Step 3: Upload to Chrome Web Store

1. **Go to Developer Dashboard**
   - Visit https://chrome.google.com/webstore/devconsole/

2. **Click "New Item"**
   - Upload your `bunch-extension.zip` file
   - Wait for it to process (usually < 1 minute)

3. **Fill Out Store Listing**

   **Product Details:**
   - Extension Name: `Bunch - Chat for Polymarket Traders`
   - Summary: (Use short description above)
   - Description: (Use detailed description above)
   - Category: `Social & Communication`
   - Language: `English (United States)`

   **Graphic Assets:**
   - Small tile: Upload your 440x280 image
   - Screenshots: Upload your 5 screenshots
   - (Optional) Marquee: Upload 1400x560 image if you created one

   **Additional Fields:**
   - Official URL: `https://bunch.up.railway.app`
   - Homepage URL: `https://bunch.up.railway.app`
   - Support URL: `https://bunch.up.railway.app/support` (or your support email)

4. **Privacy Tab**
   - Single Purpose Description:
     ```
     Bunch provides real-time chat functionality for Polymarket traders, enabling community discussions, market-specific conversations, and social features.
     ```
   
   - Permission Justifications:
     ```
     - storage: Store user preferences and authentication tokens
     - tabs: Detect active Polymarket pages for context-aware chat
     - sidePanel: Display chat interface in Chrome side panel
     - host permissions (polymarket.com): Detect market context on Polymarket pages
     ```
   
   - Data Usage:
     - Select "Yes" for collecting user data
     - Check: "Authentication information", "Personally identifiable information", "Website content"
     - Purpose: "App functionality", "Personalization", "Authentication"
     - Data is transmitted: Check "Data is transmitted off the user's device"
     - Data handling: Check "Data is encrypted in transit"
   
   - Privacy Policy URL: `https://bunch.up.railway.app/privacy`
   - Terms of Service URL: `https://bunch.up.railway.app/terms`

5. **Distribution Tab**
   - Visibility: Choose `Public` or `Unlisted` (unlisted = only accessible via direct link)
   - Countries: Select countries (recommend "All regions" for maximum reach)
   - Pricing: Select `Free`

6. **Submit for Review**
   - Click "Submit for Review"
   - Estimated review time: 1-3 business days (sometimes faster)

### Step 4: Respond to Review Feedback (if needed)

**Common rejection reasons and fixes:**

1. **"Insufficient permissions justification"**
   - Provide more detailed explanation of why each permission is needed
   - Reference specific features that require each permission

2. **"Privacy policy missing or inadequate"**
   - Ensure your Privacy Policy is publicly accessible
   - Must cover all data collected and how it's used
   - Must be served via HTTPS

3. **"Screenshot quality issues"**
   - Use 1280x800 resolution (not smaller)
   - Ensure screenshots clearly show extension functionality
   - Don't include browser chrome (just the extension itself)

4. **"Manifest issues"**
   - Ensure manifest.json follows Manifest V3 spec
   - No deprecated permissions
   - All URLs properly declared

### Step 5: Monitoring Post-Launch

**After approval:**
1. Test the published extension thoroughly
2. Monitor user reviews and respond promptly
3. Track installation metrics in Developer Dashboard
4. Prepare for updates and improvements

**Update process:**
1. Make changes to your extension
2. Increment version number in manifest.json
3. Build and create new ZIP
4. Upload to existing extension in Dashboard
5. Submit for review again (usually faster than initial review)

---

## 🚨 Important Notes

### Before Submitting

1. **Test OAuth Flows**
   - Ensure Twitter OAuth works with published extension ID
   - Update redirect URIs after getting extension ID
   - Test wallet connect flow

2. **Update Extension ID References**
   - After first submission, Chrome assigns an extension ID
   - Update any hardcoded extension IDs in your code
   - Update OAuth redirect URIs with real extension ID

3. **Domain Verification** (Optional but Recommended)
   - Verify ownership of bunch.up.railway.app in Google Search Console
   - Link verified site to your developer account
   - Shows "Verified" badge in store listing

### After Getting Extension ID

**Your extension ID will look like:** `abcdefghijklmnopqrstuvwxyz123456`

**Update these locations:**
1. Twitter Developer App OAuth redirect URI:
   ```
   https://[EXTENSION_ID].chromiumapp.org/auth
   ```

2. `manifest.json` (if you have oauth2 section):
   ```json
   "oauth2": {
     "client_id": "YOUR_TWITTER_CLIENT_ID",
     "scopes": ["tweet.read", "users.read"]
   }
   ```

3. Backend CORS settings if needed

---

## 📊 Post-Launch Marketing

### Promote Your Extension

1. **Social Media**
   - Post on Twitter with #Polymarket #Crypto hashtags
   - Share in Polymarket Discord/Telegram
   - Post on r/Polymarket if allowed

2. **Polymarket Community**
   - Share with active traders
   - Ask for reviews from early adopters
   - Gather feedback for improvements

3. **Direct Outreach**
   - Email influential Polymarket traders
   - Partner with prediction market creators
   - Reach out to crypto YouTubers/podcasters

### Monitor Key Metrics

- **Installations:** Track daily/weekly installs
- **Active Users:** Monitor daily active users (DAU)
- **Reviews:** Respond to all reviews (good and bad)
- **Crash Reports:** Fix issues quickly
- **Uninstalls:** Identify patterns causing uninstalls

---

## 🔄 Maintenance & Updates

### Regular Tasks

**Weekly:**
- Check for and respond to user reviews
- Monitor error reports in Chrome Web Store
- Review analytics in Developer Dashboard

**Monthly:**
- Release feature updates
- Security patches
- Performance improvements

**Quarterly:**
- Major feature releases
- Review and update Privacy Policy if needed
- Analyze user feedback for roadmap

---

## 🎉 Launch Day Checklist

- [ ] Extension approved and published
- [ ] Test installation from Chrome Web Store
- [ ] Verify all features work in production
- [ ] OAuth flows functional with published extension ID
- [ ] Social media posts scheduled
- [ ] Support email/system ready
- [ ] Analytics tracking set up
- [ ] Celebrate! 🎊

---

## 📞 Support Resources

- **Chrome Web Store Developer Documentation:**  
  https://developer.chrome.com/docs/webstore/

- **Manifest V3 Migration Guide:**  
  https://developer.chrome.com/docs/extensions/mv3/intro/

- **Chrome Extension Publishing:**  
  https://developer.chrome.com/docs/webstore/publish/

- **Developer Support Forum:**  
  https://groups.google.com/a/chromium.org/g/chromium-extensions

---

## ✅ Final Pre-Submit Checklist

- [ ] Extension builds without errors
- [ ] All features tested and working
- [ ] Icons and screenshots prepared
- [ ] Privacy Policy hosted and accessible
- [ ] Terms of Service hosted and accessible
- [ ] Store listing content written
- [ ] Developer account created and paid
- [ ] Extension ZIP file created
- [ ] Permission justifications prepared
- [ ] Support system ready
- [ ] Marketing plan prepared

**You're ready to launch! 🚀**

---

**Questions?** Review this guide carefully. Most issues are covered in the "Common rejection reasons" section.

**Good luck with your launch!** 🎉
