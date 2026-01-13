# PolyBanter - Current Project State
## Updated: January 13, 2026

---

## 🎯 Project Overview

**PolyBanter** is a Chrome extension side panel that provides real-time social features for Polymarket users. It combines chat, social networking, AI insights, and a reputation system into a persistent side panel interface that lives alongside your browsing.

### Core Value Proposition
- **Real-time chat** across multiple categories (Global, Market, Private, Groups)
- **Social networking** with friends, profiles, and rankings
- **AI-powered insights** for market analysis and notifications
- **Reputation system** with achievement-based ranks
- **Seamless integration** as a Chrome side panel (always accessible)

---

## 🏗️ Architecture

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite (Chrome extension optimized)
- **State Management:** Zustand (3 stores: auth, chat, notifications)
- **Styling:** Tailwind CSS + custom CSS modules
- **Real-time:** Socket.IO client
- **Key Libraries:**
  - `socket.io-client` - WebSocket connections
  - `axios` - HTTP requests
  - `react-router-dom` - Navigation (if needed)

**Directory Structure:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/          # Login, auth callback
│   │   ├── chat/          # ChatsList, ChatRoom, GifPicker, etc.
│   │   ├── common/        # Shared components (NotificationBanner)
│   │   ├── leaderboard/   # Rankings and leaderboard
│   │   ├── profile/       # UserProfile, ProfileDropdown
│   │   └── ui/            # Reusable UI elements
│   ├── services/
│   │   ├── api.ts         # Centralized API service
│   │   ├── websocket.ts   # WebSocket connection manager
│   │   ├── cloudinary.ts  # Image upload service
│   │   └── tenor.ts       # GIF search integration
│   ├── stores/
│   │   ├── authStore.ts   # User authentication state
│   │   ├── chatStore.ts   # Messages and conversations
│   │   └── notificationStore.ts  # App notifications
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces
│   ├── utils/
│   │   └── ranks.ts       # Rank calculation logic
│   └── App.tsx            # Root component
├── public/
│   ├── manifest.json      # Chrome extension manifest
│   ├── service-worker.js  # Extension background script
│   └── icons/             # Extension and rank icons
└── dist/                  # Build output
```

### Backend
- **Framework:** NestJS (Node.js + TypeScript)
- **Database:** MongoDB (Mongoose ODM)
- **Real-time:** Socket.IO server
- **Authentication:** JWT + Passport (Twitter OAuth)
- **Architecture:** Modular (auth, chat, users, media modules)

**Directory Structure:**
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentication & OAuth
│   │   ├── chat/          # Messages, conversations, WebSocket gateway
│   │   ├── users/         # User profiles, friends, requests
│   │   └── media/         # File uploads (images, GIFs)
│   ├── config/            # Environment configuration
│   └── main.ts            # Application entry point
├── dist/                  # Compiled JavaScript
└── package.json
```

### Database Schema (MongoDB)

**Collections:**
1. **users** - User accounts and profiles
2. **conversations** - Chat rooms (global, market, private, groups)
3. **messages** - Chat messages
4. **friendships** - User friendships
5. **friendrequests** - Friend request records
6. **blocks** - Blocked users

**Key Schema Fields:**

**User:**
```typescript
{
  _id: ObjectId,
  twitter_id: string,
  twitter_username: string,
  twitter_avatar: string,
  username: string,           // Unique, editable
  display_name: string,       // Editable, shown alongside username
  avatar_url: string,
  bio: string,
  rank: string,               // RECRUIT, VETERAN, CAPTAIN, etc.
  wallet_verified: boolean,
  status: 'active' | 'banned',
  role: 'user' | 'mod' | 'admin',
  is_online: boolean,
  created_at: Date,
  last_seen_at: Date,
  friends: ObjectId[],        // Cached friend IDs
  blocked_users: ObjectId[],  // Users this user blocked
  favorites: ObjectId[],      // Favorited conversation IDs
  muted_conversations: ObjectId[],
  notification_settings: {
    mentions: boolean,
    dms: boolean,
    friend_requests: boolean
  }
}
```

**Conversation:**
```typescript
{
  _id: ObjectId,
  type: 'global' | 'market' | 'private' | 'group',
  name?: string,              // For groups
  title?: string,             // For global/market chats
  description?: string,
  participant_ids: ObjectId[],
  participant_count: number,  // For display
  creator_id?: ObjectId,
  is_dm: boolean,
  market_id?: string,         // For market chats
  category?: string,          // For themed chats
  created_at: Date,
  last_message_id?: ObjectId, // Populated for preview
  last_message_at?: Date,     // For sorting
  is_ai_feed?: boolean        // AI insight channels
}
```

**Message:**
```typescript
{
  _id: ObjectId,
  conversation_id: ObjectId,
  user_id: ObjectId,
  text: string,
  media_url?: string,         // Image/GIF URL
  media_type?: 'image' | 'gif',
  reply_to?: ObjectId,        // Message being replied to
  mentions: ObjectId[],       // @mentioned users
  reactions: [{
    user_id: ObjectId,
    emoji: string
  }],
  edited: boolean,
  deleted: boolean,           // Soft delete
  created_at: Date,
  updated_at: Date
}
```

**Friendship:**
```typescript
{
  _id: ObjectId,
  user1_id: ObjectId,
  user2_id: ObjectId,
  created_at: Date
}
```

**FriendRequest:**
```typescript
{
  _id: ObjectId,
  from_user_id: ObjectId,     // Request sender
  to_user_id: ObjectId,       // Request recipient
  status: 'pending' | 'accepted' | 'rejected',
  message?: string,           // Optional message
  created_at: Date,
  responded_at?: Date
}
```

---

## ✅ Currently Implemented & Working

### 🔐 Authentication System
- ✅ Twitter OAuth login flow
- ✅ JWT token generation and validation
- ✅ User session persistence
- ✅ Auth callback handling
- ✅ Protected routes/API endpoints
- ✅ User profile auto-refresh on mount

### 💬 Chat System
- ✅ Multiple conversation types (global, market, private, group, DM)
- ✅ Real-time message sending/receiving via WebSocket
- ✅ Message display with sender info
- ✅ **Optimistic UI updates** - messages appear instantly
- ✅ **Per-conversation message filtering** - each chat only shows its own messages
- ✅ **Auto-scroll to bottom** on new messages
- ✅ Message reactions (emoji picker)
- ✅ Message replies (threaded conversations)
- ✅ Message editing (inline edit mode)
- ✅ **Message deletion** (soft delete with filtering)
- ✅ Message timestamps (relative and absolute)
- ✅ GIF picker integration (Tenor API)
- ✅ Image upload (Cloudinary)
- ✅ @mention picker with user search
- ✅ Empty state UI for new chats
- ✅ Loading states
- ✅ **Chat preview** in list with last message and timestamp
- ✅ **Dynamic chat titles** - responsive font sizing for long titles
- ✅ Message count per conversation

### 🌐 Chat Categories
- ✅ **Global chats** - fetched from `/conversations/global`
- ✅ **Market chats** - fetched from `/conversations/market`
- ✅ **Private chats** - user's personal DMs and groups
- ✅ **Favorites tab** - starred conversations
- ✅ Category filtering UI (4 tabs in ChatsList)
- ✅ Search within chats

### 👥 Social Features
- ✅ User profiles (own + others)
- ✅ **Display name + username** shown together with separator
- ✅ **Editable display name** on own profile
- ✅ Profile bio editing
- ✅ Profile avatar display
- ✅ **Rank badges** with gradient styling
- ✅ **Loading state** for profiles (no more "RECRUIT" flash)
- ✅ **Friend system:**
  - ✅ Send friend requests
  - ✅ Accept/reject friend requests
  - ✅ View friends list
  - ✅ View pending requests
  - ✅ **Friends and requests now loading correctly from DB** (fixed schema mismatch)
- ✅ Block/unblock users
- ✅ Report users
- ✅ **Create group chats** from friends list
- ✅ **Create DMs** with single friend
- ✅ **Send message button** disabled for non-friends
- ✅ Group members modal with participant list

### 🏆 Rankings & Reputation
- ✅ User rank system (RECRUIT → LEGEND)
- ✅ Rank calculation based on activity
- ✅ Rank badge display with custom icons
- ✅ Leaderboard view
- ✅ Top users by rank
- ✅ Rank progression (recruit → veteran → captain → hero → champ → titan → legend)
- ✅ Special ranks: CREATOR (verified creator), MOD (moderator), ADMIN (admin)

### 🔔 Notification System
- ✅ **NotificationStore** (Zustand) - centralized notification state
- ✅ **NotificationBanner** component - temporary popups
- ✅ **Notification sound** (subtle alert tone)
- ✅ **Notification types:** info, success, warning, error, mention, dm
- ✅ **Notification triggers:**
  - ✅ @mentions in messages
  - ✅ DM messages
  - ✅ (Ready for: Friend requests, AI insights)
- ✅ **Notification badge** on user PFP (red circle with count)
- ✅ **Profile dropdown redesign:**
  - ✅ Two-column layout
  - ✅ Left: Scrollable notifications list
  - ✅ Right: Menu items (Profile, Settings, Logout)
  - ✅ Mark as read functionality
  - ✅ Dismiss notifications
  - ✅ Visual read/unread states
- ✅ **Short message previews** (40-50 chars max with "...")
- ✅ **Responsive width** - prevents overflow off screen

### 🎨 UI/UX
- ✅ Dark theme with gradient accents
- ✅ SF Pro / SF Compact font family
- ✅ Gradient borders on cards and buttons
- ✅ Smooth transitions and animations
- ✅ Hover states on interactive elements
- ✅ **Responsive layout** - adapts to side panel width
- ✅ **Dynamic font sizing** - titles scale down for long text
- ✅ **Text truncation** - ellipsis for overflow
- ✅ Empty states with helpful messaging
- ✅ Loading spinners
- ✅ Error states
- ✅ **Logo + Leaderboard** - logo on left, trophy on right
- ✅ Notification settings toggles:
  - ✅ Bell icon (push notifications per chat)
  - ✅ Star icon (favorite chats)

### 🔌 API Integration
- ✅ Centralized `api.ts` service
- ✅ All endpoints organized by domain:
  - `authService` - login, callback
  - `userService` - profile, friends, requests
  - `roomService` - conversations, create, toggle favorites/notifications
  - `messageService` - send, edit, delete, react
  - `cloudinaryService` - image uploads
  - `tenorService` - GIF search
- ✅ Error handling with try/catch
- ✅ Token management (JWT in localStorage)
- ✅ Request interceptors for auth headers

### 🔄 WebSocket (Real-time)
- ✅ Socket.IO connection on auth
- ✅ **Event handlers:**
  - ✅ `message:new` - new message received
  - ✅ `message:update` - message edited
  - ✅ `message:delete` - message deleted
  - ✅ `message:reaction` - reaction added/removed
- ✅ **Per-conversation filtering** - prevents messages appearing in wrong chats
- ✅ **Optimistic message handling** - filters out duplicates from server
- ✅ **Notification triggers** - mentions and DMs trigger notifications
- ✅ Join conversation rooms on chat open
- ✅ Leave rooms on chat close
- ✅ Disconnect/reconnect handling

---

## 🐛 Recent Bug Fixes (Last Session)

### Critical Fixes Applied:
1. ✅ **Chat switching bug** - Messages no longer appear in wrong chatrooms
   - Root cause: Global message store without per-conversation filtering
   - Fix: Added `conversationMessages` filter based on `conversation._id`
   - Added `key={selectedChat._id}` to force ChatRoom re-mount on conversation change

2. ✅ **GIF sending visual glitch** - GIFs send to correct room, no visual switching
   - Root cause: GIF picker closing triggered state change before message sent
   - Fix: Close picker *before* sending, use `useRef` to lock conversation ID

3. ✅ **Message disappearance** - Messages no longer vanish after sending
   - Root cause: Optimistic messages not properly filtered from WebSocket updates
   - Fix: Filter by `temp_id` in `onMessageNew` handler, use `getState()` for latest messages

4. ✅ **Message deletion** - Delete now works correctly
   - Root cause: Mismatch between optimistic update (remove) and store action (mark deleted)
   - Fix: Consistently mark messages as `deleted: true`, filter out in render

5. ✅ **Infinite loop errors** - `Maximum update depth exceeded` resolved
   - Root cause 1: ChatsList `useEffect` syncing `selectedChat` on every render
   - Fix: Removed unnecessary sync effect, rely on `key` prop
   - Root cause 2: ChatRoom `useEffect` depending on `conversationMessages` (new array ref every render)
   - Fix: Depend on `storeMessages` and `conversation._id` instead

6. ✅ **Chat previews** - Now show last message from DB, not just sent messages
   - Root cause: Unpopulated `last_message_id` field
   - Fix: Created migration script `backfill-last-messages.ts` to populate existing data

7. ✅ **Friends/requests not loading** - Now correctly fetches from database
   - Root cause: Schema field mismatch (`from_user_id`/`to_user_id` vs. `sender_id`/`receiver_id`)
   - Fix: Updated backend query and frontend references to use correct field names

8. ✅ **Profile dropdown overflow** - No longer extends off left side of screen
   - Fix: Added dynamic `maxWidth` calculation, responsive positioning

9. ✅ **Notification message length** - Short previews prevent UI bugs
   - Fix: Truncate to 40-50 chars with "..." and `textOverflow: ellipsis`

10. ✅ **Long chat titles** - Dynamic sizing prevents overflow over buttons
    - Fix: Font size scales down (15px → 13px) for titles > 20 chars, added ellipsis

11. ✅ **Profile rank loading** - No more "RECRUIT" flash on profile load
    - Fix: Added loading state, shows "Loading profile..." until data fetched

---

## 🚧 Known Issues & Limitations

### Backend Limitations:
- ⚠️ **No Polymarket wallet auth** - Only Twitter OAuth currently implemented
- ⚠️ **AI insights not implemented** - AI posting, market analysis, notifications
- ⚠️ **No market data integration** - Market chats exist but not tied to real Polymarket markets
- ⚠️ **No search functionality** - Global message/user search not built
- ⚠️ **No moderation tools** - Ban, timeout, message deletion by mods/admins not implemented
- ⚠️ **Basic file upload only** - Only images and GIFs, no file attachments

### Frontend Limitations:
- ⚠️ **No pagination** - Messages load all at once (could be slow for large chats)
- ⚠️ **No infinite scroll** - No "load more" for chat history
- ⚠️ **No typing indicators** - Can't see when others are typing
- ⚠️ **No read receipts** - No "seen by" or read status
- ⚠️ **No message search** - Can't search within a conversation
- ⚠️ **No user presence** - Online/offline status not real-time
- ⚠️ **No voice/video** - Text and media only
- ⚠️ **No pinned messages** - Can't pin important messages
- ⚠️ **No link previews** - URLs don't generate rich previews
- ⚠️ **No emoji reactions picker positioning** - Can go off-screen for edge messages

### Performance Considerations:
- ⚠️ **WebSocket reconnection** - May lose messages if disconnected during send
- ⚠️ **Large message counts** - Rendering thousands of messages may slow down
- ⚠️ **Image optimization** - No lazy loading or progressive images
- ⚠️ **Bundle size** - Not optimized, could be code-split

### UX Polish Needed:
- ⚠️ **Settings page incomplete** - Only basic fields, no comprehensive settings
- ⚠️ **No onboarding** - New users dropped straight into chats
- ⚠️ **No keyboard shortcuts** - No hotkeys for common actions
- ⚠️ **No dark/light theme toggle** - Dark theme only
- ⚠️ **Mobile responsiveness** - Designed for Chrome side panel, not mobile

---

## 📋 Environment Setup

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
VITE_TENOR_API_KEY=your_tenor_key
```

### Backend Environment Variables (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/polybanter

# JWT
JWT_SECRET=your_jwt_secret_here

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_CALLBACK_URL=http://localhost:3000/auth/callback

# CORS
FRONTEND_URL=http://localhost:3000

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Tenor (optional)
TENOR_API_KEY=your_tenor_key
```

### Installation & Running

**Prerequisites:**
- Node.js 18+
- MongoDB running locally or connection string
- npm or yarn

**Backend:**
```bash
cd backend
npm install
npm run start:dev  # Development with hot reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # Development server
npm run build      # Production build for extension
```

**Load Extension in Chrome:**
1. Run `npm run build` in `frontend/`
2. Open Chrome → Extensions → Enable Developer Mode
3. Click "Load unpacked"
4. Select `frontend/dist/` folder
5. Pin extension to toolbar
6. Click extension icon to open side panel

---

## 🗂️ Key Files Reference

### Frontend Critical Files:

**State Management:**
- `src/stores/authStore.ts` - User auth, login/logout, current user
- `src/stores/chatStore.ts` - Messages, conversations, setters
- `src/stores/notificationStore.ts` - Notification queue, read/unread

**Core Components:**
- `src/App.tsx` - Root component, routes, NotificationBanner integration
- `src/components/chat/ChatsList.tsx` - Conversation list, category tabs, navigation
- `src/components/chat/ChatRoom.tsx` - Message display, send, reactions, replies (2100+ lines)
- `src/components/profile/UserProfile.tsx` - Profile display/edit, friends, requests
- `src/components/profile/ProfileDropdown.tsx` - Notification list + menu
- `src/components/common/NotificationBanner.tsx` - Popup notifications

**Services:**
- `src/services/api.ts` - All API endpoints organized by domain (800+ lines)
- `src/services/websocket.ts` - Socket.IO connection and event handlers
- `src/types/index.ts` - TypeScript interfaces for User, Message, Conversation, etc.

**Chrome Extension:**
- `public/manifest.json` - Extension configuration
- `public/service-worker.js` - Background script

### Backend Critical Files:

**Modules:**
- `src/modules/auth/auth.service.ts` - Twitter OAuth, JWT generation
- `src/modules/auth/auth.controller.ts` - Auth endpoints
- `src/modules/chat/chat.service.ts` - Message CRUD, conversation management
- `src/modules/chat/chat.controller.ts` - Chat REST endpoints
- `src/modules/chat/chat.gateway.ts` - WebSocket gateway (Socket.IO)
- `src/modules/users/users.service.ts` - User profiles, friends, requests
- `src/modules/users/users.controller.ts` - User REST endpoints

**Schemas:**
- `src/modules/users/schemas/user.schema.ts` - User model
- `src/modules/chat/schemas/conversation.schema.ts` - Conversation model
- `src/modules/chat/schemas/message.schema.ts` - Message model
- `src/modules/users/schemas/friendship.schema.ts` - Friendship model
- `src/modules/users/schemas/friend-request.schema.ts` - FriendRequest model

**Configuration:**
- `src/main.ts` - App bootstrap, CORS, WebSocket setup
- `src/app.module.ts` - Main module, imports all feature modules

**Utilities:**
- `src/seed-test-data.ts` - Seed script for test users and conversations
- `src/backfill-last-messages.ts` - Migration script for chat previews

---

## 🚀 Deployment

### Current Deployment (Railway):
- Backend deployed to Railway
- MongoDB Atlas for production database
- Environment variables configured in Railway dashboard
- Frontend built and distributed as Chrome extension (not hosted)

### Deployment Files:
- `railway.json` - Railway configuration
- `nixpacks.toml` - Build configuration
- `scripts/build-production.sh` - Production build script

---

## 🧪 Testing

### Current Testing State:
- ⚠️ **No automated tests** - No unit, integration, or e2e tests written
- ✅ Manual testing performed for all features
- ✅ Test data seeding script available (`seed-test-data.ts`)

### Test Users in DB:
The seed script creates several test users for development:
- `jimmy7infinity` (ADMIN, CREATOR rank)
- `cryptoqueen` (MOD)
- `marketmaster`, `tradingpro`, `predictorx`, etc. (regular users)

### Testing Checklist:
See `TESTING_CHECKLIST.md` for comprehensive manual testing guide

---

## 📚 Additional Documentation

- **`OVERVIEW.md`** - Original project specification and feature requirements (1929 lines)
- **`CONFIGURATION.md`** - Detailed setup and configuration guide
- **`QUICK_START.md`** - Quick setup guide for local development
- **`FEATURES_COMPLETE.md`** - Feature completion tracking
- **`FRONTEND_BACKEND_READINESS.md`** - Integration status
- **`SCHEMA_MIGRATION.md`** - Database schema changes and migrations
- **`MIGRATION_QUICK_REF.md`** - Migration script reference
- **`RAILWAY_ENV_VARS.md`** - Railway deployment environment variables
- **`TESTING_CHECKLIST.md`** - Manual testing procedures
- **`SECURITY.md`** - Security considerations and best practices
- **`rank_guide.md`** - User rank system details

---

## 🎯 Next Steps / Roadmap

### High Priority (Core Functionality):
1. **Polymarket Wallet Auth** - Implement wallet connection + signature verification
2. **AI Insights System** - Implement AI posting, market analysis, notifications
3. **Market Data Integration** - Connect market chats to real Polymarket markets via API
4. **Message Pagination** - Infinite scroll, load more history
5. **Search Functionality** - Global search for messages, users, markets
6. **Typing Indicators** - Show when users are typing
7. **Read Receipts** - Message read status

### Medium Priority (UX Polish):
8. **Onboarding Flow** - Welcome screens, tutorial for new users
9. **Settings Page** - Comprehensive settings (notifications, privacy, theme)
10. **Keyboard Shortcuts** - Hotkeys for common actions
11. **Link Previews** - Rich previews for URLs in messages
12. **Pinned Messages** - Pin important messages in chats
13. **User Presence** - Real-time online/offline status
14. **Image Optimization** - Lazy loading, progressive images

### Low Priority (Nice to Have):
15. **Dark/Light Theme Toggle** - Theme switcher
16. **Voice Messages** - Record and send audio
17. **File Attachments** - Send documents, PDFs, etc.
18. **Message Threads** - Better threading UI for replies
19. **Moderation Dashboard** - Admin/mod tools for content moderation
20. **Analytics** - Usage tracking, engagement metrics

### Technical Debt:
21. **Automated Tests** - Unit, integration, e2e test coverage
22. **Code Splitting** - Optimize bundle size
23. **Performance Optimization** - Memoization, virtualization for large lists
24. **Error Boundaries** - Graceful error handling in React
25. **WebSocket Reconnection Logic** - Retry, queue messages during disconnect
26. **Database Indexing** - Optimize queries with proper indexes
27. **Rate Limiting** - Prevent API abuse
28. **Logging & Monitoring** - Structured logging, error tracking (Sentry)

---

## 👥 Team Onboarding Checklist

### For New Developers:

**Day 1: Setup & Exploration**
- [ ] Clone repository
- [ ] Install dependencies (frontend + backend)
- [ ] Set up MongoDB locally or get Atlas connection string
- [ ] Copy `.env.example` files and configure environment variables
- [ ] Run backend: `cd backend && npm run start:dev`
- [ ] Run frontend: `cd frontend && npm run dev`
- [ ] Load extension in Chrome
- [ ] Run seed script: `cd backend && npm run seed:test-data`
- [ ] Log in with Twitter OAuth (or use test user)
- [ ] Explore UI: chats, profiles, leaderboard, notifications
- [ ] Read `OVERVIEW.md` for full feature spec
- [ ] Read this document (`PROJECT_CURRENT_STATE.md`) for current status

**Day 2: Code Deep Dive**
- [ ] Review Zustand stores (`authStore`, `chatStore`, `notificationStore`)
- [ ] Trace a message send flow: `ChatRoom` → `api.ts` → backend → WebSocket → back to `ChatRoom`
- [ ] Review WebSocket event handlers in `websocket.ts`
- [ ] Understand conversation filtering logic in `ChatRoom.tsx`
- [ ] Review backend modules: auth, chat, users
- [ ] Understand database schemas (User, Message, Conversation, Friendship, FriendRequest)

**Day 3: Make First Change**
- [ ] Pick a small task from "Next Steps" or GitHub issues
- [ ] Create a feature branch
- [ ] Implement change
- [ ] Test manually (follow `TESTING_CHECKLIST.md`)
- [ ] Submit PR for review

**Week 1 Goals:**
- Understand full stack flow (frontend → backend → DB → WebSocket)
- Make 1-2 small contributions
- Identify areas for improvement

---

## 🆘 Common Issues & Troubleshooting

### Issue: WebSocket not connecting
**Symptoms:** Messages don't appear in real-time, no live updates  
**Solution:**
1. Check backend is running (`npm run start:dev`)
2. Check WebSocket URL in frontend `.env` (`VITE_WS_URL`)
3. Open browser console, look for Socket.IO connection errors
4. Verify CORS settings in `backend/src/main.ts`

### Issue: Images/GIFs not uploading
**Symptoms:** Upload fails, broken image icons  
**Solution:**
1. Check Cloudinary credentials in `.env`
2. Verify upload preset is set to "unsigned" in Cloudinary dashboard
3. Check CORS settings in Cloudinary (allow your domains)
4. Check Tenor API key for GIFs

### Issue: Friends/requests not showing
**Symptoms:** Empty lists despite data in DB  
**Solution:**
1. Verify schema field names match: `from_user_id`, `to_user_id` (not `sender_id`, `receiver_id`)
2. Check backend logs for query errors
3. Verify friendships use `user1_id` and `user2_id` fields
4. Check `UserProfile.tsx` uses correct field names when populating

### Issue: Chat messages appear in wrong room
**Symptoms:** Send message in Chat A, appears in Chat B  
**Solution:**
1. Verify `key={selectedChat._id}` on `ChatRoom` component in `ChatsList.tsx`
2. Check `conversationMessages` filter uses `conversation._id`
3. Ensure WebSocket `onMessageNew` filters by `conversation_id`
4. Check for stale `currentConversationIdRef` in GIF/image sending

### Issue: Infinite loop / Maximum update depth exceeded
**Symptoms:** Browser freezes, console spam, React error  
**Solution:**
1. Check `useEffect` dependencies - avoid objects that change every render
2. Don't update state in `useEffect` without proper dependencies
3. For ChatRoom, depend on `storeMessages` not `conversationMessages`
4. Remove unnecessary state synchronization effects

### Issue: Extension not loading in Chrome
**Symptoms:** Extension install fails, manifest errors  
**Solution:**
1. Run `npm run build` in `frontend/` first
2. Load unpacked from `frontend/dist/` (not `frontend/src/`)
3. Check `manifest.json` is valid JSON (no trailing commas)
4. Verify all icons referenced in manifest exist in `dist/`
5. Check for console errors in `chrome://extensions/`

---

## 📞 Support & Resources

### Key Contacts:
- **Project Owner:** jimmy∞ (@jimmy7infinity)
- **Backend Lead:** [TBD]
- **Frontend Lead:** [TBD]

### Useful Links:
- **Repository:** [GitHub URL]
- **Deployment:** [Railway Dashboard URL]
- **Database:** [MongoDB Atlas URL]
- **Design:** See `Figma/` folder for mockups

### External APIs:
- **Tenor GIF API:** [https://developers.google.com/tenor](https://developers.google.com/tenor)
- **Cloudinary:** [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Twitter OAuth:** [https://developer.twitter.com/en/docs/authentication/oauth-2-0](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- **Polymarket API:** [https://docs.polymarket.com](https://docs.polymarket.com) (not yet integrated)

---

## 📝 Code Style & Conventions

### TypeScript:
- Use **strict mode** (`strict: true` in `tsconfig.json`)
- Prefer **interfaces** over types for object shapes
- Use **explicit return types** for functions
- Avoid `any` - use `unknown` or proper types

### React:
- **Functional components** with hooks (no class components)
- Use **TypeScript** for all components
- Keep components **single-responsibility** (< 500 lines ideal)
- Extract complex logic into **custom hooks**
- Use **named exports** (not default exports)

### State Management:
- **Zustand** for global state (auth, chat, notifications)
- **useState** for local component state
- **useRef** for values that don't trigger re-renders (like current conversation ID)
- Avoid prop drilling - use stores or context

### Styling:
- **Tailwind classes** for utility styling
- **CSS modules** for component-specific styles
- **Inline styles** for dynamic/computed values
- Use **CSS variables** for theme colors (defined in `styles/theme.css`)

### API/Backend:
- **REST** for CRUD operations
- **WebSocket** (Socket.IO) for real-time updates
- **JWT** for authentication
- Use **DTOs** (Data Transfer Objects) for request/response validation
- Handle errors with proper HTTP status codes
- Log important events for debugging

### Git Workflow:
- **Feature branches** from `main`
- **Descriptive commit messages** ("Fix: Chat switching bug" not "fix bug")
- **PR reviews** required before merge
- Keep PRs **focused** (1 feature/fix per PR)
- Update docs if changing APIs or major features

---

## 🎉 Conclusion

**PolyBanter is ~70% feature-complete** for the core social chat experience. The foundation is solid:
- Real-time chat works reliably across multiple conversation types
- Social features (friends, profiles, rankings) are functional
- Notification system is comprehensive and polished
- UI/UX is modern and responsive
- Authentication and API integration are robust

**Next major milestones:**
1. AI insights integration (most unique feature)
2. Polymarket market data integration (core value prop)
3. Performance optimization (pagination, lazy loading)
4. Testing & bug fixes
5. Launch prep (onboarding, polish, documentation)

The codebase is well-organized, documented, and ready for team collaboration. New developers should be able to get up and running quickly and start contributing within a week.

**Welcome to the team! 🚀**

---

*Document maintained by: jimmy∞*  
*Last updated: January 13, 2026*
