# Fix Participant Counts

## Problem
Participant counts in conversations were inaccurate due to a bug in the `joinConversation` method. The count was never being incremented when users joined.

## Root Cause
The original code used this logic:
```typescript
if (participant && !participant.joined_at) {
  // Increment count
}
```

But `$setOnInsert` always sets `joined_at` on creation, so this condition was **never true**. The count was never incremented.

## Solution

### 1. Fixed the Join Logic (Already Applied)
Changed `joinConversation` to:
1. Check if participant already exists
2. If not, create new participant
3. Increment count (only for new participants)
4. Handle race conditions with duplicate key errors

### 2. Fix Existing Data (Run This Script)

**On your local machine:**
```bash
cd backend
npm run build
node dist/fix-participant-counts.js
```

**On Railway (via SSH or one-time script):**

Option A - Railway CLI:
```bash
railway run node dist/fix-participant-counts.js
```

Option B - Temporary endpoint (safer):
1. Add this to `app.controller.ts`:
```typescript
@Get('fix-counts')
async fixCounts() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('Only run in production with caution');
  }
  
  const conversationModel = this.chatService['conversationModel'];
  const participantModel = this.chatService['participantModel'];
  
  const conversations = await conversationModel.find({}).exec();
  let fixed = 0;
  
  for (const conversation of conversations) {
    const actualCount = await participantModel.countDocuments({
      conversation_id: conversation._id,
    }).exec();
    
    if (actualCount !== conversation.participant_count) {
      await conversationModel.findByIdAndUpdate(conversation._id, {
        participant_count: actualCount,
      }).exec();
      fixed++;
    }
  }
  
  return { fixed, total: conversations.length };
}
```

2. Call it once: `curl https://bunch.up.railway.app/api/fix-counts`
3. Remove the endpoint after running

## What the Fix Script Does

1. Fetches all conversations from database
2. For each conversation:
   - Counts actual participants in `participants` collection
   - Compares to stored `participant_count`
   - Updates if different
3. Reports summary of fixed vs unchanged

## Expected Results

After running:
- ✅ All conversation `participant_count` fields match actual participant records
- ✅ Chat list displays accurate member counts
- ✅ Chat rooms display accurate member counts
- ✅ Future joins/leaves will maintain accurate counts

## Verification

Check a few conversations manually:
```javascript
// In MongoDB shell or Compass
db.conversations.findOne({ _id: ObjectId('SOME_CHAT_ID') })
// Note the participant_count

db.participants.countDocuments({ conversation_id: ObjectId('SAME_CHAT_ID') })
// Should match participant_count
```

## Prevention

The bug is now fixed in the code, so:
- ✅ New joins will increment count correctly
- ✅ Leaves will decrement count correctly
- ✅ No more drift between actual and stored counts
