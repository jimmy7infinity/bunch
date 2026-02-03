# Beta System Setup Guide

## Quick Setup (5 minutes)

### Step 1: Add Environment Variable to Railway

1. Go to **Railway Dashboard**: https://railway.app/dashboard
2. Click your **backend service**
3. Click **Variables** tab
4. Add new variable:
   ```
   BETA_MODE=true
   ```
5. Click **Save** (Railway will auto-redeploy in ~2 minutes)

### Step 2: Push Code to Railway

```bash
git push origin main
```

Railway will automatically detect the push and redeploy.

### Step 3: Generate First Invite Codes

1. Go to admin dashboard: `https://yourdomain.com/admin/invite-codes`
2. In the "Generate New Codes" form:
   - **Count**: 10 (generate 10 codes)
   - **Max Uses**: 1 (single-use codes)
   - **Expires In**: Leave blank (never expire)
3. Click **Generate**
4. Copy the codes and share them!

---

## Testing the System

### Test 1: Beta Activation Flow

1. **Logout** from extension (if logged in)
2. **Login** with wallet or Twitter
3. You should see: **"Welcome to Bunch Beta"** activation screen
4. Enter one of your generated codes (e.g., `BUNCH-A9K3-LQ`)
5. Click **"Activate Beta Access"**
6. You should be redirected to the app ✅

### Test 2: Already Activated User

1. **Refresh** the extension
2. You should skip the activation screen
3. Go directly to ChatsList ✅

### Test 3: Admin Dashboard

1. Go to `/admin/invite-codes`
2. You should see:
   - Stats cards (total, used, unused, total uses)
   - Your generated codes
   - One code marked as "In Use" ✅

---

## Common Code Configurations

### Single-Use Codes (Most Common)

For individual beta testers:
```
Count: 50
Max Uses: 1
Expires In: (blank)
```

### Reusable Codes

For sharing on Twitter or Discord:
```
Count: 5
Max Uses: 100
Expires In: 30 days
```

### VIP Codes

For influencers or partners:
```
Count: 10
Max Uses: 10
Expires In: (blank)
```

---

## Distributing Codes

### Option 1: Direct Message

Copy code from admin dashboard and send directly:
```
Hey! Here's your Bunch beta access code:

BUNCH-A9K3-LQ

Install the extension and enter this code after login.
Welcome! 🚀
```

### Option 2: Twitter/Discord

For reusable codes:
```
🚀 Bunch Beta Access!

Use code: BUNCH-A9K3-LQ

✅ Works for the first 100 people
⏰ Expires in 30 days

Get the Chrome extension: [link]
```

### Option 3: Spreadsheet

Track who you gave codes to:
| Code | Given To | Used | Date |
|------|----------|------|------|
| BUNCH-A9K3-LQ | @user | ✅ | Jan 5 |

---

## Monitoring Usage

### View Stats

Admin dashboard shows:
- **Total Codes** - All codes generated
- **Used Codes** - Codes that have been activated
- **Unused Codes** - Codes still available
- **Total Uses** - Total activations

### Code Status

Each code shows:
- **Available** - Green (never used)
- **In Use** - Blue (used but can be used again)
- **Max Used** - Gray (reached maxUses)
- **Expired** - Red (past expiresAt date)

---

## Turning Off Beta Mode (Public Launch)

### When You're Ready to Go Public

**Step 1:** Update Railway
```
BETA_MODE=false
```

**Step 2:** (Optional) Grant everyone access
```javascript
// In MongoDB, run:
db.users.updateMany({}, { $set: { betaAccess: true } });
```

**That's it!** 🎉

- No code changes needed
- No redeployment needed (except env var update)
- BetaGuard becomes inactive
- All users can access immediately

---

## Troubleshooting

### "Invalid invite code" error

Check:
- ✅ Code format is exactly `BUNCH-XXXX-XX` (capitals, no spaces)
- ✅ Code hasn't expired
- ✅ Code hasn't reached max uses
- ✅ User hasn't tried more than 5 times in past hour

### Activation screen shows even though BETA_MODE=false

Check:
- ✅ Railway deployment finished
- ✅ Backend restarted with new env var
- ✅ Try hard refresh in browser (Cmd+Shift+R)

### Can't generate codes in admin dashboard

Check:
- ✅ You're logged in as admin/mod/creator
- ✅ Count is between 1-100
- ✅ Max Uses is at least 1

---

## Database Queries (Advanced)

### Grant beta access manually
```javascript
db.users.updateOne(
  { username: "jimmy7infinity" },
  { $set: { betaAccess: true } }
);
```

### See all users with beta access
```javascript
db.users.find({ betaAccess: true }).count();
```

### Find unused codes
```javascript
db.invitecodes.find({ used: false });
```

### Delete all expired codes
```javascript
db.invitecodes.deleteMany({
  expiresAt: { $lt: new Date() }
});
```

---

## Next Steps

1. ✅ Set `BETA_MODE=true` in Railway
2. ✅ Push code to Railway
3. ✅ Generate 10-50 invite codes
4. ✅ Share codes with early testers
5. ✅ Monitor usage in admin dashboard
6. ✅ Gather feedback
7. ✅ When ready: `BETA_MODE=false` for public launch

---

## Support

For detailed documentation, see: **`BETA_SYSTEM.md`**

Enjoy your beta launch! 🚀
