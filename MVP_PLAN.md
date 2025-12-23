# MVP Development Plan

**Goal:** Get a working Chrome extension with basic chat functionality deployed in 4 weeks.

---

## MVP Scope (Minimum Viable Product)

### ✅ What's IN the MVP

1. **Authentication**
   - Wallet signature login (Polymarket)
   - JWT token management

2. **Chat System**
   - Global chat room (single room for all users)
   - Real-time messaging via WebSocket
   - Message reactions (👍 👎 🔥 💎)
   - User avatars and display names

3. **Chrome Extension**
   - Side panel interface
   - Basic UI with theme support
   - Message list and input
   - User list

4. **Backend API**
   - User management
   - Message storage and retrieval
   - WebSocket server
   - Basic rate limiting

### ❌ What's OUT of the MVP (Phase 2)

- Twitter OAuth (wallet only for MVP)
- Categories (Politics, Crypto, etc.)
- Market-specific chats
- Private DMs and groups
- AI insights system
- Rankings and achievements
- User profiles and stats

---

## 4-Week MVP Timeline

### Week 1: Foundation
**Goal:** Development environment + authentication

- [ ] Day 1-2: Project setup, Docker, backend initialization
- [ ] Day 3-4: User schema, wallet auth endpoint
- [ ] Day 5-7: Frontend setup, wallet connection UI, login flow

**Deliverable:** Users can connect wallet and authenticate

### Week 2: Real-time Chat
**Goal:** Basic messaging working

- [ ] Day 8-9: WebSocket setup, chat gateway
- [ ] Day 10-11: Message schema, send/receive messages
- [ ] Day 12-14: Chat UI, message list, input component

**Deliverable:** Users can send and receive messages in real-time

### Week 3: Polish Core Features
**Goal:** Make chat usable and pleasant

- [ ] Day 15-16: Message reactions, user avatars
- [ ] Day 17-18: Message persistence, pagination
- [ ] Day 19-21: Styling, animations, UX improvements

**Deliverable:** Chat feels smooth and professional

### Week 4: Deploy & Test
**Goal:** Live and accessible

- [ ] Day 22-23: Railway backend deployment
- [ ] Day 24-25: Vercel frontend deployment (for web testing)
- [ ] Day 26-27: Chrome extension packaging and testing
- [ ] Day 28: Bug fixes, final polish

**Deliverable:** Working extension + deployed backend

---

## Deployment Architecture (MVP)

### Backend (Railway)
- **Service:** Node.js (NestJS)
- **Database:** Railway MongoDB plugin
- **Cache:** Railway Redis plugin
- **Environment:** Production

### Frontend (Dual Deployment)

**Option 1: Chrome Extension (Primary)**
- Build and package extension
- Load unpacked for testing
- Submit to Chrome Web Store (optional for MVP)

**Option 2: Vercel Web App (Testing/Demo)**
- Deploy as regular web app for easy testing
- Share link for demos
- Same codebase, different build target

---

## Tech Stack (Simplified for MVP)

| Component | Technology |
|-----------|------------|
| Backend | NestJS + Node.js 20 |
| Database | MongoDB (Railway) |
| Cache | Redis (Railway) |
| Real-time | Socket.IO |
| Frontend | React 18 + TypeScript |
| Styling | TailwindCSS |
| Build | Vite |
| Auth | JWT + Wallet Signatures |
| Deployment | Railway (backend) + Vercel (web) + Chrome Extension |

---

## MVP Data Models (Simplified)

### users
```typescript
{
  _id: ObjectId,
  username: string,              // Generated from wallet
  display_name?: string,
  avatar_url?: string,
  wallet_address: string,
  created_at: Date,
  last_seen_at: Date
}
```

### messages
```typescript
{
  _id: ObjectId,
  sender_id: ObjectId,
  text: string,
  reactions: {
    '👍': [user_id],
    '👎': [user_id],
    '🔥': [user_id],
    '💎': [user_id]
  },
  created_at: Date,
  edited_at?: Date,
  deleted: boolean
}
```

---

## MVP API Endpoints

### Authentication
- `POST /auth/wallet` - Sign in with wallet
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Get current user

### Messages
- `GET /messages?limit=50&before=timestamp` - Get messages (paginated)
- `POST /messages` - Send message (via WebSocket preferred)
- `POST /messages/:id/react` - Add/remove reaction

### Users
- `GET /users/online` - Get online users count
- `PATCH /users/me` - Update profile

### WebSocket Events
- `message:send` - Send message
- `message:new` - Receive new message
- `message:react` - React to message
- `user:online` - User came online
- `user:offline` - User went offline

---

## MVP UI Components

### Core Components
1. **LoginModal** - Wallet connection
2. **ChatRoom** - Main chat interface
3. **MessageList** - Scrollable message feed
4. **MessageItem** - Individual message with reactions
5. **MessageInput** - Text input with send button
6. **UserAvatar** - User profile picture
7. **OnlineIndicator** - Green dot for online users

### Layout
```
┌─────────────────────────────────┐
│  PolyBanter          [👤] [⚙️]  │
├─────────────────────────────────┤
│  🌍 Global Chat                 │
│  👥 42 online                   │
├─────────────────────────────────┤
│                                 │
│  [Message List]                 │
│                                 │
│  User1: Hey everyone!           │
│  👍 3  🔥 1                      │
│                                 │
│  User2: GM!                     │
│  👍 5                            │
│                                 │
├─────────────────────────────────┤
│  Type a message...         [📤] │
└─────────────────────────────────┘
```

---

## Development Setup (Quick Start)

### 1. Install Dependencies
```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install root dependencies
pnpm install

# Start Docker services
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
pnpm install
cp .env.example .env
# Edit .env with your values
pnpm dev
```

### 3. Frontend Setup
```bash
cd frontend
pnpm install
pnpm dev
```

### 4. Test Extension
```bash
cd frontend
pnpm build
# Load unpacked in chrome://extensions/
```

---

## Railway Deployment Guide

### Backend Setup on Railway

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   cd backend
   railway init
   ```

2. **Add MongoDB Plugin**
   - Go to Railway dashboard
   - Click "New" → "Database" → "MongoDB"
   - Copy connection string to environment variables

3. **Add Redis Plugin**
   - Click "New" → "Database" → "Redis"
   - Copy connection string to environment variables

4. **Configure Environment Variables**
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=<from Railway MongoDB plugin>
   REDIS_URL=<from Railway Redis plugin>
   JWT_SECRET=<generate secure secret>
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Get Backend URL**
   - Railway will provide a public URL
   - Copy this for frontend configuration

---

## Vercel Deployment Guide

### Frontend Setup on Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=<your Railway backend URL>
     VITE_WS_URL=<your Railway backend URL>
     ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

---

## Chrome Extension Packaging

### Build Extension
```bash
cd frontend
pnpm build:extension
```

### Test Locally
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `frontend/dist` folder

### Publish to Chrome Web Store (Optional)
1. Create ZIP of dist folder
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. Pay one-time $5 developer fee
4. Upload ZIP and fill out listing
5. Submit for review (1-3 days)

---

## Success Criteria for MVP

### Technical
- [ ] Backend deployed and accessible on Railway
- [ ] Frontend deployed on Vercel (web version)
- [ ] Chrome extension loads without errors
- [ ] WebSocket connection stable
- [ ] Messages persist in database
- [ ] Authentication works reliably

### User Experience
- [ ] User can connect wallet in <10 seconds
- [ ] Messages appear in real-time (<1 second)
- [ ] UI is responsive and smooth
- [ ] No critical bugs
- [ ] Works in Chrome browser

### Performance
- [ ] API response time <500ms
- [ ] WebSocket latency <100ms
- [ ] Extension loads in <2 seconds
- [ ] Can handle 100+ concurrent users

---

## Post-MVP (Phase 2)

Once MVP is live and stable:

1. **Add Twitter OAuth** (Week 5)
2. **Add Categories** (Week 6)
3. **Add Market Chats** (Week 7-8)
4. **Add AI Insights** (Week 9-10)
5. **Add Rankings** (Week 11-12)

---

## Let's Build! 🚀

**Next Steps:**
1. Run `pnpm install` in root directory
2. Start Docker: `docker-compose up -d`
3. Follow backend setup in next document
4. Start coding!

**Focus:** Get something working quickly, iterate based on feedback.



