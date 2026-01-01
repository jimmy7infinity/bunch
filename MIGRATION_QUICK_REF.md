# Quick Migration Commands

## Run Migration (Clean Break)

```bash
cd backend
npm run migration:messages
```

## Verify Migration

```bash
# Check conversations were created
npm run dev
# Then in another terminal:
curl http://localhost:3000/conversations/global

# Should return 5 default global chats
```

## Test Messaging

```bash
# 1. Get your auth token (login first via frontend)
# 2. Get a conversation ID from the global chats endpoint
# 3. Send a test message:

curl -X POST http://localhost:3000/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message from new schema!"}'
```

## Database Queries (MongoDB)

```javascript
// Check all conversations
db.conversations.find().pretty()

// Check all messages have conversation_id
db.messages.find({ conversation_id: { $exists: false } }).count()
// Should return 0

// Check participants
db.participants.find().pretty()

// Get message count per conversation
db.messages.aggregate([
  { $group: { _id: "$conversation_id", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## Rollback (if needed)

```javascript
// ⚠️ WARNING: This deletes everything!
db.conversations.deleteMany({})
db.participants.deleteMany({})
db.messages.updateMany({}, { $unset: { conversation_id: "" } })
```

## Common Issues

### Issue: Migration fails with "conversation_id required"
**Solution:** Your messages already have conversation_id. Migration already ran!

### Issue: Can't send messages
**Solution:** 
1. Check you're using new endpoint: `POST /conversations/:id/messages`
2. Verify conversation exists: `GET /conversations/:id`
3. Check you're a participant: `GET /conversations/:id/participants`

### Issue: WebSocket not connecting
**Solution:**
1. Check backend is running
2. Verify token is valid
3. Use new event: `room:join` with `conversationId`

## What Changed

### Old WebSocket Flow:
```javascript
socket.emit('message:send', { text: 'Hello' })
```

### New WebSocket Flow:
```javascript
// 1. Join conversation first
socket.emit('room:join', { conversationId: 'abc123' })

// 2. Then send messages
socket.emit('message:send', { 
  conversationId: 'abc123', 
  text: 'Hello' 
})
```

## Schema Summary

```
User (existing)
  ├─ username
  ├─ twitter_id
  └─ avatar_url

Conversation (NEW!)
  ├─ type: 'dm' | 'group' | 'global' | 'market'
  ├─ market_id (for market chats)
  ├─ slug (for global chats)
  ├─ dm_hash (for DMs)
  ├─ title
  ├─ is_private
  ├─ participant_count
  └─ last_message_at

Participant (NEW!)
  ├─ conversation_id → Conversation
  ├─ user_id → User
  ├─ role: 'owner' | 'admin' | 'member'
  ├─ last_read_at
  ├─ muted
  ├─ has_notifications
  └─ is_favorite

Message (updated)
  ├─ conversation_id → Conversation (NEW!)
  ├─ sender_id → User
  ├─ text
  ├─ reply_to → Message (NEW!)
  ├─ mentions → [User] (NEW!)
  ├─ reactions
  └─ created_at
```

## Ready to Test?

```bash
# 1. Run migration
cd backend && npm run migration:messages

# 2. Start backend
npm run dev

# 3. Test in another terminal
curl http://localhost:3000/conversations/global

# 4. Open frontend and try sending a message
cd ../frontend && npm run dev
```

**Note:** Frontend will need updates to work with new conversation system. We'll do that next!

