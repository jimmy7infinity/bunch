# Beta Gating System Documentation

## Overview

The Bunch Beta System is a comprehensive invite-code based access control system with a global on/off toggle. It's designed for easy removal when launching publicly.

---

## Quick Start

### Enable Beta Mode

Set in Railway environment variables:
```bash
BETA_MODE=true
```

### Disable Beta Mode (Public Launch)

```bash
BETA_MODE=false
```

When `BETA_MODE=false`, the system is completely disabled and all users have access automatically.

---

## System Architecture

### 1. Backend Components

**Schemas:**
- `InviteCode` - Stores invite codes with usage tracking
- `User.betaAccess` - Boolean flag for user access

**Modules:**
- `InviteCodesModule` - Manages invite code generation and validation
- `BetaGuard` - Global guard that enforces beta access

**API Endpoints:**

**Admin (requires admin/mod/creator role):**
- `POST /api/admin/invites/generate` - Generate invite codes
- `GET /api/admin/invites` - List all codes
- `GET /api/admin/invites/stats` - Get usage statistics
- `DELETE /api/admin/invites/:code` - Delete a code

**User:**
- `POST /api/auth/activate-beta` - Activate beta with code (rate limited: 5/hour)
- `GET /api/auth/beta-status` - Check user's beta access status

### 2. Frontend Components

**Components:**
- `BetaActivation.tsx` - Activation screen with code input
- Integrated into `App.tsx` authentication flow

**Flow:**
1. User authenticates (Twitter/Wallet)
2. System checks `betaAccess` status
3. If `false`, show activation screen
4. User enters invite code
5. Backend validates and grants access
6. User proceeds to app

### 3. Admin Dashboard

**Location:** `/admin/invite-codes`

**Features:**
- Generate N codes at once
- Set max uses per code (reusable codes)
- Optional expiration dates
- View all codes with status
- Copy codes easily
- Delete codes
- Usage statistics dashboard

---

## Invite Code Format

**Format:** `BUNCH-XXXX-XX`

**Example:** `BUNCH-A9K3-LQ`

**Character Set:** A-Z, 2-9 (excludes confusing chars: 0, O, I, 1)

---

## InviteCode Schema

```typescript
{
  code: string;           // Unique code (BUNCH-XXXX-XX)
  used: boolean;          // True on first use
  usedBy?: userId;        // First user who used it
  maxUses: number;        // How many times it can be used
  useCount: number;       // Current use count
  createdBy: userId;      // Admin who created it
  expiresAt?: Date;       // Optional expiration
  createdAt: Date;        // Creation timestamp
}
```

---

## User Schema Addition

```typescript
{
  betaAccess: boolean;  // Default: false
  // ...existing fields
}
```

---

## Environment Variables

**Railway (Production):**
```bash
BETA_MODE=true              # Enable/disable beta gating
# All other existing vars...
```

**Local Development:**
```bash
BETA_MODE=false             # Typically disabled for development
```

---

## Usage Examples

### Generate 10 codes (max 1 use each)

```bash
POST /api/admin/invites/generate
{
  "count": 10,
  "maxUses": 1
}
```

### Generate 5 reusable codes (10 uses each, expires in 30 days)

```bash
POST /api/admin/invites/generate
{
  "count": 5,
  "maxUses": 10,
  "expiresAt": "2026-03-05T00:00:00.000Z"
}
```

### Activate beta access

```bash
POST /api/auth/activate-beta
{
  "code": "BUNCH-A9K3-LQ"
}
```

---

## Security Features

### Rate Limiting
- Beta activation endpoint: **5 attempts per hour per user**
- Prevents brute force attacks

### Validation
- Code format validation (regex)
- Expiration checking
- Max uses enforcement
- Single-use tracking (`usedBy` field)

### Error Messages
- Generic messages to prevent enumeration
- No hints about valid vs. invalid codes

---

## Admin Roles

Who can manage invite codes:
- **admin** - Full access
- **moderator** - Full access  
- **creator** - Full access

Regular users cannot access invite code management.

---

## Public Launch Process

### Step 1: Disable Beta Mode
Update Railway environment variable:
```bash
BETA_MODE=false
```

### Step 2: (Optional) Grant All Users Access
Run database migration:
```javascript
db.users.updateMany({}, { $set: { betaAccess: true } });
```

**Note:** Step 2 is optional. With `BETA_MODE=false`, the `betaAccess` field is ignored entirely.

### Step 3: That's It!
No code changes needed. The `BetaGuard` becomes a no-op when `BETA_MODE=false`.

---

## Frontend Behavior

### When BETA_MODE=true

**New User Flow:**
1. Login via Twitter/Wallet
2. Check beta status → `betaAccess: false`
3. Show `BetaActivation` screen
4. Enter invite code
5. Code validated → `betaAccess: true`
6. Proceed to app

**Existing User with Beta Access:**
1. Login
2. Check beta status → `betaAccess: true`
3. Skip activation, go straight to app

### When BETA_MODE=false

**All Users:**
1. Login
2. Go straight to app (beta check skipped)

---

## Implementation Details

### BetaGuard Logic

```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  // Check BETA_MODE env var
  const betaMode = this.configService.get<string>('BETA_MODE') === 'true';
  
  // If disabled, allow everyone
  if (!betaMode) {
    return true;
  }

  // If enabled, check user's betaAccess
  const user = await this.usersService.findById(req.user.userId);
  
  if (!user.betaAccess) {
    throw new ForbiddenException({
      message: 'Beta access required',
      requiresBetaActivation: true,
    });
  }

  return true;
}
```

### Code Generation Algorithm

1. Generate random chars from safe character set
2. Format as `BUNCH-XXXX-XX`
3. Check for uniqueness in database
4. Retry up to 10 times if collision
5. Store in database with metadata

### Reusable Codes

Codes can be configured with `maxUses > 1`:
- `useCount` increments on each use
- `usedBy` only set on first use (tracks original user)
- Code remains valid until `useCount >= maxUses`
- Multiple users can activate with same code

---

## Testing

### Test Beta Activation Flow

1. Set `BETA_MODE=true` in Railway
2. Login as new user (no beta access)
3. Should see activation screen
4. Generate code in admin dashboard
5. Enter code → access granted
6. Refresh → should stay logged in

### Test Public Launch

1. Set `BETA_MODE=false` in Railway
2. Login as new user
3. Should skip activation entirely
4. App works normally

---

## Monitoring

### Admin Dashboard Stats

View at `/admin/invite-codes`:
- **Total Codes** - Number of codes generated
- **Used Codes** - Codes that have been used at least once
- **Unused Codes** - Codes never used
- **Total Uses** - Sum of all use counts

### Invite Code Table

Each code shows:
- Status (Available, In Use, Max Used, Expired)
- Use count vs. max uses
- Creator
- User who first used it
- Expiration date
- Creation date

---

## Troubleshooting

### User can't activate with valid code

Check:
1. Code hasn't expired (`expiresAt`)
2. Code hasn't reached max uses (`useCount < maxUses`)
3. Rate limit not exceeded (5/hour)
4. Code format is correct (`BUNCH-XXXX-XX`)

### BetaGuard not working

Check:
1. `BETA_MODE` env var is set to `"true"` (string)
2. User has `betaAccess: false` in database
3. Guard is properly imported and applied

### Frontend shows activation when BETA_MODE=false

Check:
1. Railway deployment completed
2. Backend restarted with new env var
3. Frontend is calling `/auth/beta-status` correctly

---

## Future Enhancements

Potential improvements (not currently implemented):

1. **Email invites** - Send codes via email
2. **Waitlist integration** - Auto-generate codes for waitlist
3. **Analytics** - Track conversion rates
4. **Batch operations** - Bulk delete/expire codes
5. **Code customization** - Custom prefix/format
6. **Referral tracking** - Track who invited whom

---

## Database Queries

### Grant beta access manually
```javascript
db.users.updateOne(
  { wallet_address: "0x..." },
  { $set: { betaAccess: true } }
);
```

### Grant all users beta access
```javascript
db.users.updateMany(
  {},
  { $set: { betaAccess: true } }
);
```

### Count users with beta access
```javascript
db.users.countDocuments({ betaAccess: true });
```

### Find unused codes
```javascript
db.invitecodes.find({ used: false });
```

### Find expired codes
```javascript
db.invitecodes.find({
  expiresAt: { $lt: new Date() }
});
```

---

## Summary

The beta system is:
- ✅ **Flexible** - Global on/off switch
- ✅ **Secure** - Rate limited, validated
- ✅ **Reusable** - Multi-use codes supported
- ✅ **Admin-friendly** - Full dashboard UI
- ✅ **Removable** - Zero refactoring for public launch
- ✅ **Comprehensive** - Frontend + Backend + Admin

**Public launch = Set `BETA_MODE=false`. Done.**
