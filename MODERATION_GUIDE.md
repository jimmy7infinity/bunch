# PolyBanter Moderation Guide

## Content Moderation

### Automatic Content Filtering

The platform automatically filters messages for:
- **Hate speech and slurs** (n-word, f-slur, etc.)
- **Character substitutions** (n1gger, f4ggot, etc.)
- **Spacing tricks** (n i g g e r)
- **Empty or excessively long messages** (>5000 chars)

**Swearing is allowed** - only hate speech and slurs are blocked.

### Violation Tracking

- Users get **3 strikes in 24 hours** before flagged for ban
- Violations are logged with user ID and timestamp
- After 24 hours, violation count resets
- All violations are logged to console for review

### Adding Banned Words

Edit `/backend/src/utils/content-moderation.ts`:

```typescript
const BANNED_WORDS = [
  'nigger',

  // Add more here
];
```

Restart the backend after changes.

---

## User Banning

### Method 1: MongoDB Compass (Recommended for Quick Bans)

1. **Connect to MongoDB**
   - Open MongoDB Compass
   - Connect to your database (Railway MongoDB or local)

2. **Find the User**
   - Navigate to `polybanter` database → `users` collection
   - Search by username, twitter_username, or wallet_address:
     ```json
     { "username": "baduser123" }
     ```

3. **Ban the User**
   - Click on the user document
   - Update the `status` field:
     ```json
     {
       "status": "banned"
     }
     ```
   - Optionally add reason and timestamp:
     ```json
     {
       "status": "banned",
       "banned_at": "2026-01-16T12:00:00.000Z",
       "banned_reason": "Hate speech violation"
     }
     ```
   - Click "Update"

4. **Effect** ⚡ INSTANT
   - User is immediately disconnected from WebSocket
   - Cannot reconnect or send messages
   - All API requests blocked with ban message
   - Works on next request (no server restart needed)

### Method 2: MongoDB Shell

```bash
# Connect to MongoDB
mongosh "your-mongodb-connection-string"

# Switch to database
use polybanter

# Ban a user by username
db.users.updateOne(
  { username: "baduser123" },
  { 
    $set: { 
      status: "banned",
      banned_at: new Date(),
      banned_reason: "Hate speech violation"
    }
  }
)

# Ban a user by Twitter username
db.users.updateOne(
  { twitter_username: "baduser_twitter" },
  { 
    $set: { 
      status: "banned",
      banned_at: new Date(),
      banned_reason: "Multiple content violations"
    }
  }
)

# Verify the ban
db.users.findOne({ username: "baduser123" }, { status: 1, banned_at: 1, banned_reason: 1 })
```

### Method 3: MongoDB Atlas Dashboard

1. Go to MongoDB Atlas → Browse Collections
2. Select `polybanter` → `users`
3. Find the user (use Filter: `{ "username": "baduser123" }`)
4. Click "Edit Document"
5. Change:
   - `status`: `"banned"`
   - `banned_at`: (click "Add Field" → Type: Date → Select current date)
   - `banned_reason`: (click "Add Field" → Type: String → Enter reason)
6. Click "Update"

---

## Temporary Suspension

For less severe violations, you can temporarily suspend users:

```javascript
db.users.updateOne(
  { username: "troubleuser" },
  { 
    $set: { 
      status: "suspended",
      suspended_until: new Date("2026-01-23T00:00:00.000Z"), // 7 days from now
      banned_reason: "Spam - 7 day suspension"
    }
  }
)
```

**Note:** You'll need to implement auto-unsuspend logic in the backend to check `suspended_until` dates.

---

## Unbanning Users

```javascript
db.users.updateOne(
  { username: "reformeduser" },
  { 
    $set: { 
      status: "active"
    },
    $unset: {
      banned_at: "",
      banned_reason: "",
      suspended_until: ""
    }
  }
)
```

---

## Finding Users to Ban

### Find users with multiple violations (from logs)

Check Railway logs for:
```
⚠️ User 6954dcf967b3dbdf7c2f2cd1 should be banned (3+ violations in 24h)
```

Then ban by user ID:
```javascript
db.users.updateOne(
  { _id: ObjectId("6954dcf967b3dbdf7c2f2cd1") },
  { 
    $set: { 
      status: "banned",
      banned_at: new Date(),
      banned_reason: "Automated ban - 3+ content violations in 24h"
    }
  }
)
```

### Find all banned users

```javascript
db.users.find({ status: "banned" }, { username: 1, banned_at: 1, banned_reason: 1 })
```

### Find all suspended users

```javascript
db.users.find({ status: "suspended" }, { username: 1, suspended_until: 1, banned_reason: 1 })
```

---

## Rate Limiting

### Message Rate Limit
- **10 messages per 10 seconds** per user
- Automatically enforced in WebSocket gateway
- Returns error: "Rate limit exceeded. Please slow down."

### Market Status Check Rate Limit
- **Once per hour** per user per market
- Prevents API abuse
- Cached results served for subsequent requests

### Future: API Rate Limiting

Consider adding global API rate limiting with `@nestjs/throttler`:

```bash
npm install @nestjs/throttler
```

Then add to `app.module.ts`:
```typescript
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100, // 100 requests per minute
})
```

---

## Monitoring & Alerts

### What to Monitor

1. **Content Violations**
   - Check Railway logs for `🚫 Message blocked`
   - Look for patterns (same user, same words)

2. **Rate Limit Hits**
   - Check for `Rate limit exceeded` errors
   - May indicate spam bots

3. **Suspicious Activity**
   - New accounts immediately sending messages
   - Accounts with no Polymarket verification
   - Rapid friend requests

### Setting Up Alerts (Future)

Consider integrating:
- **Sentry** for error tracking
- **LogDNA/Datadog** for log aggregation
- **Discord webhook** for real-time violation alerts

---

## Best Practices

1. **Always include a reason** when banning
2. **Document bans** in a spreadsheet or admin panel
3. **Review logs daily** during beta
4. **Warn before banning** for first-time minor violations
5. **Be consistent** with enforcement
6. **Communicate rules** clearly to users

---

## User Status Reference

| Status | Description | Can Login | Can Message | Can View |
|--------|-------------|-----------|-------------|----------|
| `active` | Normal user | ✅ Yes | ✅ Yes | ✅ Yes |
| `suspended` | Temporary ban | ⚠️ Limited | ❌ No | ✅ Yes |
| `banned` | Permanent ban | ❌ No | ❌ No | ❌ No |

---

## Quick Reference Commands

```javascript
// Ban user
db.users.updateOne(
  { username: "USERNAME" },
  { $set: { status: "banned", banned_at: new Date(), banned_reason: "REASON" }}
)

// Unban user
db.users.updateOne(
  { username: "USERNAME" },
  { $set: { status: "active" }, $unset: { banned_at: "", banned_reason: "" }}
)

// Find banned users
db.users.find({ status: "banned" })

// Count violations (check logs)
# Railway logs → Search for: "User USERID should be banned"
```

---

**Last Updated:** January 16, 2026
