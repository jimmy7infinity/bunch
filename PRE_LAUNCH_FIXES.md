# Pre-Launch Fixes

**Priority:** HIGH - Fix before Chrome Store submission

---

## 🔴 Issue 1: General Chat Not Visible

**Problem:** "General" chat not appearing at top of Global Banter list

**Root Cause:** Chat not seeded to production database

**Fix Options:**

### Option A: MongoDB Atlas (Recommended)

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Navigate to your `polybanter` database
3. Open `conversations` collection
4. Click "Insert Document"
5. Paste this JSON:

```json
{
  "type": "global",
  "title": "General",
  "slug": "general",
  "is_private": false,
  "participant_count": 0,
  "created_at": {"$date": "2026-01-16T00:00:00.000Z"},
  "updated_at": {"$date": "2026-01-16T00:00:00.000Z"}
}
```

6. Click "Insert"
7. Refresh your extension - "General" should appear

### Option B: Railway CLI

```bash
# Connect to Railway
railway login

# Link to project
railway link

# Run seed script
railway run npm run seed:chats
```

### Option C: Backend Endpoint

If your backend is deployed at a different URL, find it in Railway dashboard and run:

```bash
curl -X POST https://YOUR-RAILWAY-URL/api/seed-global-chats
```

### Verify Fix

1. Open extension
2. Go to "Global Banter" tab
3. "General" should be first in the list
4. Click it - should open empty chat room

---

## 🔴 Issue 2: Fake User Counts

**Problem:** Politics and Crypto chats showing incorrect participant counts

**Root Cause:** Possibly hardcoded values or not updating on join/leave

**Investigation Steps:**

### 1. Check Database

```javascript
// MongoDB query
db.conversations.find({ 
  slug: { $in: ['politics', 'crypto'] } 
}, { 
  title: 1, 
  participant_count: 1 
})
```

**Expected:** `participant_count` should match actual participants

### 2. Check Backend Code

**File:** `backend/src/modules/chat/chat.service.ts`

Look for:
```typescript
// Check if participant_count is being updated
async joinConversation(conversationId, userId) {
  // Should increment participant_count
}

async leaveConversation(conversationId, userId) {
  // Should decrement participant_count
}
```

### 3. Check Frontend Display

**File:** `frontend/src/components/chat/ChatsList.tsx`

Line ~973:
```typescript
{chat.participant_count || 0}
```

This should display the real count from backend.

### Fix: Recalculate Counts

Run this in MongoDB to fix all counts:

```javascript
// For each conversation, count actual participants
db.conversations.find().forEach(function(conv) {
  var count = db.participants.countDocuments({ 
    conversation_id: conv._id 
  });
  
  db.conversations.updateOne(
    { _id: conv._id },
    { $set: { participant_count: count } }
  );
});
```

### Verify Fix

1. Open extension
2. Check Politics chat count
3. Check Crypto chat count
4. Join a chat - count should increment
5. Leave chat - count should decrement

---

## 🟡 Issue 3: Sorting with General First

**Problem:** Even after seeding, General might not appear first

**Current Code:** `frontend/src/components/chat/ChatsList.tsx`

```typescript
// Sort chats: favorites first, then special sorting rules
rooms = rooms.sort((a, b) => {
  // Favorites always come first
  if (a.is_favorite && !b.is_favorite) return -1;
  if (!a.is_favorite && b.is_favorite) return 1;
  
  // Within same favorite status, apply category-specific sorting
  if (activeChatCategory === 'global') {
    // "General" comes first among globals
    if (a.slug === 'general') return -1;
    if (b.slug === 'general') return 1;
  }
  
  // Default: sort by last message time
  const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
  const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
  return bTime - aTime;
});
```

**This should work!** If General still doesn't appear first:

1. Check if `slug` field exists in database
2. Verify `slug === 'general'` (lowercase)
3. Check if General is favorited (would override)

---

## ✅ Quick Test Checklist

Before submitting to Chrome Store:

### General Chat
- [ ] "General" appears in Global Banter
- [ ] "General" is first in the list (unless favorited chats exist)
- [ ] Can click and open General chat
- [ ] Can send messages in General
- [ ] Messages appear in real-time

### User Counts
- [ ] Politics shows real count (not fake)
- [ ] Crypto shows real count (not fake)
- [ ] Count increases when you join
- [ ] Count decreases when you leave
- [ ] Count matches number of participants

### Other Chats
- [ ] All global chats visible
- [ ] Market chats work on Polymarket
- [ ] DMs work between friends
- [ ] Favorites pin to top

---

## 🚀 After Fixes

Once both issues are resolved:

1. Test thoroughly in extension
2. Create screenshots for Chrome Store
3. Follow `CHROME_STORE_LAUNCH_GUIDE.md`
4. Submit to Chrome Web Store
5. Wait 1-3 days for review
6. Launch! 🎉

---

## 🆘 If Still Having Issues

### General Chat Not Showing

**Debug:**
```javascript
// Check if chat exists
db.conversations.findOne({ slug: 'general' })

// Check all global chats
db.conversations.find({ type: 'global' }).pretty()
```

### User Counts Wrong

**Debug:**
```javascript
// Check participants for a chat
db.participants.find({ 
  conversation_id: ObjectId('CHAT_ID_HERE') 
}).count()

// Compare to participant_count field
db.conversations.findOne({ _id: ObjectId('CHAT_ID_HERE') })
```

### Need Help?

- Check Railway logs for backend errors
- Check browser console for frontend errors
- Review MongoDB for data issues
- GitHub Issues: https://github.com/jimmy7infinity/poly_banter/issues

---

**Estimated Fix Time:** 15-30 minutes

**Priority:** Fix these before Chrome Store submission!
