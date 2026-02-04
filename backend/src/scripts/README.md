# Bunch Backend Scripts

This directory contains all backend scripts for Bunch, organized by function.

## 📁 Directory Structure

```
scripts/
├── polymarket/       # Market status and position tracking
├── users/            # User dashboard and statistics
├── maintenance/      # Cleanup and maintenance jobs
└── utils/            # Shared utilities (cache, rate limiting, time)
```

## 🚀 Quick Start

### Running Scripts

```bash
# From backend directory

# Cleanup inactive chats
npm run cleanup:chats

# Refresh all user dashboards (scheduled job)
npm run refresh:dashboards
```

### Using Scripts in Code

```typescript
import { computeMarketStatus } from './scripts/polymarket/computeMarketStatus';
import { refreshUserDashboard } from './scripts/users/refreshUserDashboard';

// Compute market status for a user
const status = await computeMarketStatus(
  userId,
  walletAddress,
  marketId,
  marketUserStatusModel
);

// Refresh user dashboard
const result = await refreshUserDashboard(
  userId,
  walletAddress,
  userStatsModel
);
```

## 📚 Script Documentation

### Polymarket Scripts

#### `fetchUserPositions.ts`
Fetches a user's positions from Polymarket Data API.

```typescript
const positions = await fetchUserPositions(walletAddress, marketId?);
```

#### `fetchMarketPositions.ts`
Fetches all positions for a market (cached).

```typescript
const positions = await fetchMarketPositions(marketId);
```

#### `computeWhalePercentile.ts`
Determines if a user is a whale (top 10%).

```typescript
const isWhale = await isUserWhale(marketId, positionSizeUSD);
const percentile = await getUserPercentile(marketId, positionSizeUSD);
```

#### `computeMarketStatus.ts`
Main orchestrator for computing user market status.

```typescript
const result = await computeMarketStatus(
  userId,
  walletAddress,
  marketId,
  marketUserStatusModel
);
// Returns: { status: 'position' | 'whale' | null, ... }
```

### User Scripts

#### `computeUserDashboard.ts`
Computes full dashboard statistics for a user.

```typescript
const result = await computeUserDashboard(
  userId,
  walletAddress,
  userStatsModel
);
```

#### `refreshUserDashboard.ts`
Entry point with rate limiting for dashboard refresh.

```typescript
// Manual refresh (rate limited)
const result = await refreshUserDashboard(userId, wallet, model);

// Login refresh (skip rate limit)
const result = await refreshDashboardOnLogin(userId, wallet, model);

// Scheduled refresh (all users)
const stats = await scheduledDashboardRefresh(statsModel, userModel);
```

### Maintenance Scripts

#### `cleanupInactiveChats.ts`
Deletes low-value, inactive chats.

**Criteria:**
- Messages < 200 AND no activity for 7+ days
- Never deletes chats with ≥200 messages

```bash
npm run cleanup:chats
```

### Utility Modules

#### `cache.ts`
In-memory caching with TTL.

```typescript
import { cache, CacheKeys, CacheTTL } from './utils/cache';

// Set cache
cache.set(CacheKeys.marketPositions(marketId), data, CacheTTL.MARKET_POSITIONS);

// Get cache
const data = cache.get<MarketPosition[]>(CacheKeys.marketPositions(marketId));

// Delete cache
cache.delete(CacheKeys.marketPositions(marketId));
```

#### `rateLimit.ts`
Rate limiting for expensive operations.

```typescript
import { rateLimit, RateLimitWindows } from './utils/rateLimit';

// Check rate limit
await rateLimit.checkRateLimit({
  userId,
  action: 'refresh_dashboard',
  windowMs: RateLimitWindows.REFRESH_DASHBOARD,
});

// Get time until reset
const seconds = rateLimit.getTimeUntilReset({ userId, action });
```

#### `time.ts`
Time utility functions.

```typescript
import { daysAgo, hoursAgo, isOlderThan } from './utils/time';

const sevenDaysAgo = daysAgo(7);
const isOld = isOlderThan(date, 7);
```

## 🔧 Configuration

### Cache TTLs
- Market positions: 10 minutes
- User dashboard: 12 hours
- Market status: 5 minutes
- Whale threshold: 10 minutes

### Rate Limits
- Refresh dashboard: 1 per 5 minutes
- Set market status: 1 per market per 5 minutes

## 📊 Database Schemas

### MarketUserStatus
Stores user's market status (⚡ position / 🐳 whale).

```typescript
{
  user_id: ObjectId,
  market_id: string,
  status: 'position' | 'whale',
  position_size_usd: number,
  computed_at: Date
}
```

### UserStatsSnapshot
Stores cached user dashboard data.

```typescript
{
  user_id: ObjectId,
  wallet_address: string,
  totals: {
    total_markets: number,
    open_positions: number,
    total_pnl_usd: number,
    // ...
  },
  performance: {
    win_rate: number,
    avg_position_size_usd: number
  },
  history: {
    pnl_by_month: Array<{ month: string, pnl: number }>
  }
}
```

## 🎯 Design Principles

1. **No live Polymarket calls from frontend**
2. **Everything is cached and reused**
3. **User opt-in required for expensive operations**
4. **Rate limiting prevents abuse**
5. **Scripts are idempotent and safe to re-run**

## 🔍 Debugging

Enable detailed logging:

```typescript
// Scripts log automatically
// Check console for:
// ✓ Success messages
// ✗ Error messages
// 📍 Status updates
```

## 🚨 Error Handling

All scripts include proper error handling:
- Failed API calls return empty arrays
- Rate limit errors throw with clear messages
- Database errors are logged and propagated

## 📝 Testing

```typescript
// Example test
import { computeMarketStatus } from './polymarket/computeMarketStatus';

test('computes market status correctly', async () => {
  const result = await computeMarketStatus(
    'userId',
    'walletAddress',
    'marketId',
    mockModel
  );
  
  expect(result.status).toBe('whale');
});
```

## 🔄 Scheduled Jobs

Setup cron jobs in Railway:

```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  },
  "cron": [
    {
      "schedule": "0 2 * * *",
      "command": "npm run cleanup:chats"
    },
    {
      "schedule": "0 3 * * *",
      "command": "npm run refresh:dashboards"
    }
  ]
}
```

## 📚 Further Reading

- See `NEXT.md` for full architecture specification
- See `IMPLEMENTATION_SUMMARY.md` for implementation details
- See individual script files for detailed documentation

---

**Last Updated:** January 2026
