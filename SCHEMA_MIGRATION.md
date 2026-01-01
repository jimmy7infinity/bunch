# Schema Migration Complete! 🎉

## What We Just Built

We've completely restructured the backend to use a **unified conversation architecture** that supports:

✅ **DMs (Direct Messages)** - Private 1-on-1 chats
✅ **Group Chats** - Private group conversations  
✅ **Global Chats** - Public topic-based discussions (Crypto, Politics, etc.)
✅ **Market Chats** - Auto-created chats for any Polymarket market

## New Database Structure

### 3 Core Collections:

1. **Conversations** - The central hub for all chat types
2. **Participants** - Who's in each conversation (with roles, mute settings, etc.)
3. **Messages** - All messages now belong to a conversation

### Key Features:
- ✅ Unique indexes prevent duplicate rooms
- ✅ DM hash ensures one DM per user pair
- ✅ Market ID linking for Polymarket integration
- ✅ Per-user conversation settings (mute, favorite, notifications)
- ✅ Role-based permissions (owner, admin, member)
- ✅ Unread message tracking
- ✅ Last read timestamps

## 🚀 Next Steps: Run the Migration

### Step 1: Stop the Backend (if running)

```bash
# Press Ctrl+C in your backend terminal
```

### Step 2: Run the Migration

```bash
cd backend
npm run migration:messages
```

This will:
1. Create a "General" global conversation
2. Move all existing messages to this conversation
3. Create default global chats (Crypto, Politics, Sports, Entertainment)
4. Update timestamps and participant counts

### Step 3: Restart the Backend

```bash
npm run dev
```

## 📊 What the Migration Does

```
Before:
Messages → [floating in space, no room association]

After:
Conversations
  └─ General (global)
      └─ Messages → [all your existing messages]
  └─ Crypto (global)  
  └─ Politics (global)
  └─ Sports (global)
  └─ Entertainment (global)
```

## 🧪 Testing the New System

### Test 1: Check Default Conversations

Open MongoDB Compass or mongosh and run:

```javascript
db.conversations.find({})
```

You should see 5 conversations (General + 4 default global chats).

### Test 2: Check Message Migration

```javascript
db.messages.find({ conversation_id: { $exists: true } }).count()
```

All messages should have a `conversation_id` now.

### Test 3: Test API Endpoints

```bash
# Get all global chats
curl http://localhost:3000/conversations/global \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get messages from General chat
curl http://localhost:3000/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 New API Endpoints

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations/my` | Get user's conversations |
| GET | `/conversations/global` | Get all global chats |
| GET | `/conversations/market/search?q=trump` | Search market chats |
| POST | `/conversations/market` | Create/get market chat |
| POST | `/conversations/dm` | Create/get DM |
| POST | `/conversations/group` | Create group chat |
| GET | `/conversations/:id` | Get conversation details |
| GET | `/conversations/:id/participants` | Get participants |
| POST | `/conversations/:id/join` | Join conversation |
| POST | `/conversations/:id/leave` | Leave conversation |
| PATCH | `/conversations/:id/mute` | Toggle mute |
| PATCH | `/conversations/:id/favorite` | Toggle favorite |
| PATCH | `/conversations/:id/notifications` | Toggle notifications |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations/:id/messages` | Get messages |
| POST | `/conversations/:id/messages` | Send message |
| POST | `/conversations/messages/:id/react` | React to message |
| DELETE | `/conversations/messages/:id` | Delete message |
| GET | `/conversations/:id/unread` | Get unread count |
| POST | `/conversations/:id/read` | Mark as read |

### WebSocket Events

**Emit (Client → Server):**
- `room:join` - Join a conversation room
- `room:leave` - Leave a conversation room
- `message:send` - Send a message
- `message:react` - React to a message
- `message:delete` - Delete a message
- `typing:start` - Start typing
- `typing:stop` - Stop typing

**Listen (Server → Client):**
- `message:new` - New message received
- `message:reaction` - Reaction added/removed
- `message:deleted` - Message deleted
- `room:user_joined` - User joined room
- `room:user_left` - User left room
- `user:typing` - User typing indicator

## 🎯 Polymarket Integration Ready

The system is now ready for Polymarket integration!

### How it works:

1. **User visits Polymarket page** - e.g., "Who will die in Stranger Things S5?"
2. **Extension extracts market ID** - from URL or page data
3. **Frontend calls** - `POST /conversations/market` with `marketId` and `title`
4. **Backend finds or creates** - a conversation for that market
5. **User joins** - automatically via WebSocket
6. **Chat loads** - messages specific to that market

### Example:

```javascript
// Extension detects market
const marketId = "polymarket:stranger-things-s5-death";
const title = "Who will die in Stranger Things S5?";

// Create/get market chat
const response = await fetch('/conversations/market', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    marketId,
    title,
    metadata: {
      url: window.location.href,
      outcomes: ['Steve', 'Nancy', 'Robin', 'Eddie'],
    },
  }),
});

const { conversation } = await response.json();

// Join via WebSocket
socket.emit('room:join', { conversationId: conversation._id });
```

## 🔥 What's Different Now

### Old System:
- ❌ One global chat only
- ❌ No room support
- ❌ No participant tracking
- ❌ No DMs possible
- ❌ No market linking

### New System:
- ✅ Unlimited conversations
- ✅ Multiple chat types (DM, group, global, market)
- ✅ Full participant management
- ✅ Per-conversation settings
- ✅ Polymarket integration ready
- ✅ Unread tracking
- ✅ Role-based permissions

## ⚠️ Breaking Changes

The following old endpoints are **deprecated**:

- ❌ `GET /messages` (no conversation ID)
- ❌ `POST /messages` (no conversation ID)

Use the new conversation-based endpoints instead:

- ✅ `GET /conversations/:id/messages`
- ✅ `POST /conversations/:id/messages`

## 🧹 Clean State

If you want to start completely fresh (⚠️ deletes all data):

```javascript
// In MongoDB
db.conversations.deleteMany({})
db.participants.deleteMany({})
db.messages.deleteMany({})
```

Then run the migration again to recreate default chats.

## 📈 Next: Frontend Integration

Now that the backend is ready, we need to update the frontend to:

1. Load conversations instead of hardcoded chat list
2. Join conversation rooms via WebSocket
3. Send messages to specific conversations
4. Handle market detection from Polymarket URLs
5. Support DM and group chat creation

Ready to test? Run the migration and let me know if you see any errors!

