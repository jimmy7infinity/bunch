# Database Migration Scripts

## fix-participant-counts.js

**Purpose:** Fix incorrect participant counts in conversations.

**Issue:** Group chats were double-counting members (setting initial count + incrementing on join).

**What it does:**
- Connects to MongoDB
- Counts actual participants for each conversation
- Updates `participant_count` to match reality
- Shows which conversations were fixed

**Usage:**
```bash
cd backend
node scripts/fix-participant-counts.js
```

**When to run:**
- After deploying the participant count fix
- If you notice incorrect member counts in chats
- Safe to run multiple times (idempotent)

**Example output:**
```
✅ Connected to MongoDB

📊 Found 45 conversations

🔧 Fixing conversation 6981e55c6e82bd9460f2c71b
   Type: group
   Title: Trading Squad
   Stored count: 6 → Actual count: 3

🔧 Fixing conversation 6982a12f4b92cd8471e3d82a
   Type: dm
   Title: DM
   Stored count: 4 → Actual count: 2

✅ Migration complete!
   Fixed: 8 conversations
   Already correct: 37 conversations
   Total: 45 conversations

👋 Disconnected from MongoDB
```

## Adding New Scripts

When creating new migration scripts:

1. Add to this `scripts/` folder
2. Use `require('dotenv').config()` to load env vars
3. Add entry to this README
4. Make scripts idempotent (safe to run multiple times)
5. Add proper logging and error handling
6. Test locally before running in production
