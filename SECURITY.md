# Security & API Credentials

## API Keys Storage

### ⚠️ Current Status: HARDCODED (Not Production Ready)

Currently, API keys are **hardcoded in the frontend source code** for development purposes. This is **NOT secure** for production and should be changed before deploying the Chrome extension to the store.

### Current Locations:

1. **Tenor API Key**
   - File: `frontend/src/services/tenor.ts`
   - Line: `const TENOR_API_KEY = 'AIzaSyCAis3__EqKPLZ60xNv6SZJWMIZxtdfczo';`
   - Status: ⚠️ Hardcoded (visible in source)

2. **Cloudinary Credentials**
   - File: `frontend/src/services/cloudinary.ts`
   - Line: `const CLOUDINARY_CLOUD_NAME = 'djzec1vdb';`
   - Line: `const CLOUDINARY_UPLOAD_PRESET = 'polybanter';`
   - Status: ⚠️ Hardcoded (visible in source)
   - Note: Uses unsigned upload preset (no API secret exposed)

---

## 🔒 Production Security Recommendations

### Option 1: Backend Proxy (RECOMMENDED)

Move all API calls through your backend:

```
Frontend → Your Backend → Tenor/Cloudinary
```

**Benefits:**
- API keys never exposed to users
- Can add rate limiting
- Can add usage tracking
- Can implement authentication checks

**Implementation:**
1. Create backend endpoints:
   - `POST /api/media/search-gifs?q=cats`
   - `POST /api/media/upload-image` (handles Cloudinary upload)
2. Backend stores API keys in environment variables
3. Frontend calls your backend instead of Tenor/Cloudinary directly

### Option 2: Environment Variables (Chrome Extension)

Chrome extensions can use environment variables during build time:

1. Create `.env.local` (gitignored):
```bash
VITE_TENOR_API_KEY=your_key_here
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

2. Update code to use:
```typescript
const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY;
```

3. Keys are bundled during build but not visible in source control

**⚠️ WARNING:** Users can still extract keys from the bundled extension code by inspecting the built files.

### Option 3: Chrome Extension Storage API

Store keys in Chrome's secure storage:

```typescript
// Store during setup
chrome.storage.local.set({ tenorKey: 'key' });

// Retrieve when needed
chrome.storage.local.get(['tenorKey'], (result) => {
  const key = result.tenorKey;
});
```

**Limitation:** Requires manual key entry by each user or an admin panel.

---

## 🚨 Security Risks (Current State)

1. **API Key Exposure**: Anyone can inspect your extension's code and extract API keys
2. **Quota Abuse**: Users could extract keys and use them for their own projects
3. **Cost**: Malicious users could rack up charges on your Cloudinary/Tenor accounts

---

## ✅ Recommended Approach for PolyBanter

Since you're building a Chrome extension with a backend on Railway:

1. **Backend Proxy** (recommended):
   - Create `/api/media/search-gifs` endpoint in NestJS
   - Create `/api/media/upload-image` endpoint for Cloudinary
   - Store keys in Railway environment variables
   - Frontend makes requests to your backend only

2. **Rate Limiting**: Add rate limits on backend endpoints to prevent abuse

3. **Authentication**: Ensure only authenticated users can access media endpoints

---

## 📝 TODO Before Production

- [ ] Move Tenor API calls to backend
- [ ] Move Cloudinary uploads to backend
- [ ] Remove hardcoded keys from frontend
- [ ] Add rate limiting on media endpoints
- [ ] Set up monitoring for API usage
- [ ] Rotate API keys after moving to backend

---

## Current Backend Environment Variables

Your Railway backend should have these in `.env`:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://jimmy7:LgIg88EFAdA5gkOl@polybanter.dnsdecj.mongodb.net/polybanter?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_jwt_secret_here

# Twitter OAuth (if applicable)
TWITTER_CONSUMER_KEY=your_key
TWITTER_CONSUMER_SECRET=your_secret

# Add these for media proxy:
TENOR_API_KEY=AIzaSyCAis3__EqKPLZ60xNv6SZJWMIZxtdfczo
CLOUDINARY_CLOUD_NAME=djzec1vdb
CLOUDINARY_API_KEY=373631116233143
CLOUDINARY_API_SECRET=kL6qopdN1ZiBlDVt46Y3XhZY7C0
```

---

## Testing Security

To verify your production build doesn't expose keys:

```bash
cd frontend
npm run build
cd dist
grep -r "AIzaSyCAis3__EqKPLZ60xNv6SZJWMIZxtdfczo" .
```

If the key appears in build output, it's exposed! ⚠️

