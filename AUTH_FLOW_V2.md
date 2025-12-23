# 🔐 PolyBanter Auth Flow v2

## Overview

Users authenticate via Twitter (X), then link their Polymarket wallet for leaderboard tracking.

---

## Flow Steps

### 1. Twitter OAuth Login
- User clicks "Login with Twitter"
- OAuth flow to Twitter
- Get Twitter user ID, username, profile

### 2. Wallet Address Input
- User prompted: "Enter your Polymarket wallet address"
- Text input field (not MetaMask connection)
- User pastes their wallet address (0x...)

### 3. Verification
- Check if Twitter account is linked to wallet on Polymarket
- Method: Scrape or API call to `https://polymarket.com/0x{address}`
- Look for Twitter handle in profile
- Verify it matches authenticated Twitter account

### 4. Complete Registration
- If verified: Create user account
- Link Twitter ID + Wallet Address
- User is now authenticated
- Wallet tracked for leaderboard/stats

---

## Backend Changes Needed

### New Auth Endpoints:
```
POST /auth/twitter/callback - Twitter OAuth callback
GET  /auth/twitter/url - Get Twitter OAuth URL
POST /auth/verify-wallet - Verify wallet belongs to Twitter account
```

### User Schema Updates:
```typescript
{
  twitter_id: string,           // Primary auth
  twitter_username: string,
  twitter_avatar: string,
  wallet_address: string,       // For leaderboard
  wallet_verified: boolean,
  polymarket_profile_url: string,
}
```

### Verification Logic:
```typescript
async verifyWalletOwnership(twitterHandle: string, walletAddress: string) {
  // Option 1: Polymarket API (if available)
  // Option 2: Scrape https://polymarket.com/0x{address}
  // Look for Twitter handle in profile
  // Return true if matches
}
```

---

## Frontend Changes Needed

### New Components:
- `TwitterLogin.tsx` - OAuth button
- `WalletInput.tsx` - Text input for wallet address
- `VerificationStep.tsx` - Verification UI

### Flow:
```
1. Login Screen
   └─> "Login with Twitter" button

2. Twitter OAuth
   └─> Redirect to Twitter
   └─> User authorizes
   └─> Redirect back with token

3. Wallet Input Screen
   └─> "Enter your Polymarket wallet address"
   └─> Text input: 0x...
   └─> "Verify" button

4. Verification
   └─> Loading: "Checking Polymarket profile..."
   └─> Success: "Verified! ✅"
   └─> Error: "Twitter not linked to this wallet"

5. Chat Interface
   └─> User is authenticated
```

---

## Benefits of This Approach

✅ **No MetaMask required** - Just paste address
✅ **Polymarket integration** - Uses existing Polymarket profiles
✅ **Twitter verification** - Proves account ownership
✅ **Leaderboard ready** - Wallet tracked for stats
✅ **Social first** - Twitter is primary identity

---

## Implementation Priority

### Phase 1 (Now):
1. Add Twitter OAuth to backend
2. Create wallet verification endpoint
3. Update frontend auth flow
4. Test with real Polymarket profiles

### Phase 2 (Later):
1. Add Polymarket API integration (if available)
2. Fallback to web scraping
3. Cache verification results
4. Handle edge cases

---

## Questions to Resolve

1. **Polymarket API?** - Is there an official API for profile data?
2. **Scraping reliability?** - How stable is the profile page structure?
3. **Re-verification?** - How often to re-check wallet ownership?
4. **Multiple wallets?** - Can users link multiple wallets?

---

**This is a much better flow for Polymarket integration!** 

Should I start implementing this now?

