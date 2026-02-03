# Account Linking & Authentication Scenarios

## Overview

Bunch supports multiple authentication methods:
- **Twitter/X OAuth**
- **Crypto Wallet (SIWE)**
- **Polymarket Account Verification**

Users can link multiple authentication methods to a single account, enabling flexible login options while maintaining a unified identity.

---

## Supported Scenarios

### Scenario 1: Twitter Login → Polymarket Verification → Wallet Login
**Flow:**
1. User logs in with Twitter (creates account with `twitter_id`)
2. User verifies Polymarket account (adds `polymarket.wallet_address`)
3. User logs in with wallet that matches Polymarket address

**Behavior:**
✅ **Wallet login automatically links to existing Twitter account**
- Backend detects matching `polymarket.wallet_address`
- Adds `wallet_address` to existing account
- User can now log in with either Twitter OR wallet

**Code Location:** `users.service.ts` → `findOrCreateByWallet()`

```typescript
// Checks if wallet matches verified Polymarket account
const polymarketUser = await this.userModel.findOne({
  'polymarket.verified': true,
  'polymarket.wallet_address': walletLower
}).exec();

if (polymarketUser) {
  // Auto-link wallet to existing account
  polymarketUser.wallet_address = walletLower;
  polymarketUser.wallet_verified = true;
  await polymarketUser.save();
  return polymarketUser;
}
```

---

### Scenario 2: Wallet Login → Polymarket Verification → Twitter Login
**Flow:**
1. User logs in with wallet (creates account with `wallet_address`)
2. User verifies Polymarket account
3. User logs in with Twitter

**Behavior:**
⚠️ **Creates separate Twitter account** (for now)
- Twitter login creates new account with `twitter_id`
- User has 2 separate accounts

**Future Enhancement:** Detect Polymarket verification match during Twitter OAuth and merge accounts

---

### Scenario 3: Twitter Login → Wallet Login (No Polymarket)
**Flow:**
1. User logs in with Twitter
2. User logs in with wallet (different address, no Polymarket link)

**Behavior:**
⚠️ **Creates 2 separate accounts**
- No automatic linking without Polymarket connection

**Solution:** User must manually link accounts via Settings

---

### Scenario 4: Manual Account Linking (Settings Page)
**Flow:**
1. User logged in with one method (Twitter OR Wallet)
2. User goes to Settings → Connected Accounts
3. User clicks "Connect" on the other method

**Behavior:**
✅ **Backend endpoints handle linking**

**Endpoints:**
- `POST /api/users/link-wallet` - Link wallet to current account
  - Requires wallet signature for security
  - Prevents linking wallet already used by another account
  
- `POST /api/users/unlink-wallet` - Unlink wallet
  - Only allowed if Twitter is connected (prevents lockout)
  
- `POST /api/users/unlink-twitter` - Unlink Twitter
  - Only allowed if wallet is connected (prevents lockout)

---

## Account Linking Rules

### Automatic Linking ✅
**Triggered when:**
- User logs in with wallet that matches a verified Polymarket account
- Prevents duplicate accounts for same person

### Prevent Duplicate Linking 🚫
- Cannot link wallet already used by another account → `409 Conflict`
- Cannot link Twitter already used by another account → `409 Conflict`

### Prevent Account Lockout 🔒
- Cannot unlink only authentication method → `400 Bad Request`
- Must have at least Twitter OR wallet connected

---

## Database Schema

```typescript
User {
  // Twitter OAuth
  twitter_id?: string;
  twitter_username?: string;
  twitter_avatar?: string;
  
  // Wallet Auth
  wallet_address?: string;
  wallet_verified: boolean;
  
  // Polymarket Verification
  polymarket?: {
    verified: boolean;
    username?: string;
    wallet_address?: string;
    verification_token?: string;
    verified_at?: Date;
  };
  
  // Core Fields
  username: string;
  display_name?: string;
  avatar_url?: string;
  // ... other fields
}
```

---

## API Endpoints

### Authentication
- `GET /api/auth/twitter` - Start Twitter OAuth
- `GET /api/auth/wallet` - Open wallet auth page
- `POST /api/auth/siwe/nonce` - Get SIWE nonce
- `POST /api/auth/siwe/verify` - Verify SIWE signature

### Account Linking
- `POST /api/users/link-wallet` - Link wallet to current account
  - Body: `{ wallet_address, signature, message }`
  - Requires: JWT auth
  - Returns: Updated user with linked wallet
  
- `POST /api/users/unlink-wallet` - Unlink wallet
  - Requires: JWT auth, Twitter must be connected
  - Returns: Updated user without wallet
  
- `POST /api/users/unlink-twitter` - Unlink Twitter
  - Requires: JWT auth, Wallet must be connected
  - Returns: Updated user without Twitter

---

## Frontend Implementation

### Settings Page
Location: `frontend/src/components/profile/Settings.tsx`

Shows "Connected Accounts" section with:
- **X (Twitter)** - Shows connection status and username
- **Crypto Wallet** - Shows connection status and truncated address

Each displays:
- ✅ "Connected" if linked
- 🔗 "Connect" button if not linked

Clicking "Connect" opens OAuth/Wallet flow in popup window.

---

## Security Considerations

### Wallet Linking
- Requires valid SIWE signature
- Verifies signature matches wallet address
- Prevents replay attacks with nonce system

### Account Merging
- Only automatic when Polymarket verification confirms identity
- Manual linking requires user to be logged in
- Cannot link accounts already in use

### Lockout Prevention
- Always requires at least one auth method
- Warns user before unlinking only method

---

## Edge Cases Handled

1. **User has Twitter + Polymarket, logs in with wallet**
   → Auto-links wallet to Twitter account ✅

2. **User has Wallet + Polymarket, logs in with Twitter**
   → Creates separate account (needs manual linking)

3. **User tries to link wallet already used**
   → Returns 409 Conflict error

4. **User tries to unlink only auth method**
   → Returns 400 Bad Request

5. **User verifies Polymarket after having both Twitter and Wallet**
   → No change, accounts already linked

---

## Future Enhancements

### Priority 1: Auto-merge during Twitter OAuth
- Check if Twitter user's verified Polymarket matches existing wallet account
- Merge accounts automatically (like wallet login does)

### Priority 2: Account merge suggestions
- Detect potential duplicate accounts
- Suggest merging based on Polymarket verification

### Priority 3: Multiple wallets
- Allow linking multiple wallets to one account
- Useful for users with multiple trading wallets

---

## Testing Scenarios

### Test 1: Happy Path (Twitter → Polymarket → Wallet)
1. Log in with Twitter
2. Verify Polymarket account
3. Log out
4. Log in with wallet (same as Polymarket)
5. ✅ Should be same account, see Twitter history

### Test 2: Manual Linking
1. Log in with Twitter
2. Go to Settings → Connected Accounts
3. Click "Connect" on Crypto Wallet
4. Sign message in MetaMask
5. ✅ Wallet should show as connected

### Test 3: Prevent Duplicate Linking
1. User A logs in with wallet 0x123
2. User B logs in with Twitter
3. User B tries to link wallet 0x123
4. ✅ Should show error: "Wallet already linked to another account"

### Test 4: Prevent Lockout
1. User logs in with Twitter only
2. Tries to unlink Twitter
3. ✅ Should show error: "Cannot unlink - only auth method"

---

## Deployment Status

✅ **Backend:** Deployed to Railway (account linking logic active)
✅ **Frontend:** Settings page shows Connected Accounts
⚠️ **In Progress:** Wallet auth redirect flow (testing in progress)

---

## Summary

The account linking system intelligently handles multiple authentication methods while preventing duplicate accounts and lockouts. The Polymarket verification serves as the "source of truth" for merging wallet and Twitter accounts, ensuring users maintain a single identity across different login methods.
