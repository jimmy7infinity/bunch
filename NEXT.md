Purpose

This document defines the backend scripts architecture for PolyBanter.
These scripts are responsible for:
	•	Fetching Polymarket data efficiently
	•	Computing per-market user status (⚡ position / 🐳 whale)
	•	Building cached user dashboards
	•	Running cleanup & maintenance jobs
	•	Enforcing rate limits to prevent abuse and scaling issues

This document is authoritative.
If existing code conflicts with this document, this document wins.

⸻

Core Design Principles (Important)
	1.	No live Polymarket calls from the frontend
	2.	All Polymarket data is fetched server-side
	3.	Everything is cached and reused
	4.	Users must explicitly opt-in to expose market status
	5.	Scripts must be idempotent and safe to re-run
	6.	Rate limits are enforced server-side

⸻

Folder Structure (Final)

All scripts live inside the backend (Railway-deployed).

backend/
  scripts/
    polymarket/
      fetchUserPositions.ts
      fetchMarketPositions.ts
      computeMarketStatus.ts
      computeWhalePercentile.ts

    users/
      computeUserDashboard.ts
      refreshUserDashboard.ts

    maintenance/
      cleanupInactiveChats.ts

    utils/
      rateLimit.ts
      cache.ts
      time.ts

1️⃣ Market Status System (⚡ / 🐳)

Goal

Determine a user’s per-market status, only when the user explicitly requests it.

Statuses:
	•	⚡ → User has an open position in this market
	•	🐳 → User is in the top 10% by position size in this market

No negative status exists.
No status is shown unless user opts in.

⸻

User Flow
	1.	User clicks “Show my position” in a market chat
	2.	Backend:
	•	Fetches the user’s position for that market
	•	Fetches all positions for that market (cached)
	•	Computes percentile
	3.	Result is cached and reused for chat messages

⸻

Data Model (Mongo)

MarketUserStatus {
  userId: ObjectId
  marketId: string

  status: 'position' | 'whale'   // whale overrides position
  positionSizeUSD: number

  computedAt: Date
}

Script Responsibilities

fetchUserPositions.ts
	•	Fetches only this user’s positions
	•	Can filter by marketId
	•	Uses Polymarket Data API

fetchMarketPositions.ts
	•	Fetches all positions for a market
	•	Cached aggressively (Redis or in-memory)
	•	TTL recommended: 5–15 minutes

computeWhalePercentile.ts
	•	Sorts market positions by size
	•	Computes top 10% threshold
	•	Returns boolean isWhale

computeMarketStatus.ts
Orchestrator:
	•	Calls the above scripts
	•	Determines final status
	•	Stores MarketUserStatus

⸻

2️⃣ User Dashboard & Performance Snapshot

Goal

Provide a cached snapshot of user performance for:
	•	“My Profile”
	•	Optional public profile

No live recomputation on every view.

⸻

Snapshot Model

UserStatsSnapshot {
  userId: ObjectId
  walletAddress: string
  updatedAt: Date

  totals: {
    totalMarkets: number
    openPositions: number
    resolvedMarkets: number
    totalRiskedUSD: number
    totalPnLUSD: number
  }

  performance: {
    winRate: number
    avgPositionSizeUSD: number
  }

  history: {
    pnlByMonth: Array<{
      month: string
      pnl: number
    }>
  }
}

Update Rules (Very Important)

User dashboard is recomputed only when:
	•	User logs in
	•	User manually refreshes
	•	Scheduled background job (e.g. once per 24h)

Never:
	•	On every page load
	•	On chat activity
	•	On profile view by others

⸻

Scripts

computeUserDashboard.ts
	•	Fetches:
	•	User positions
	•	User trades
	•	User activity
	•	Aggregates stats
	•	Produces UserStatsSnapshot

refreshUserDashboard.ts
	•	Entry point for:
	•	Login-triggered refresh
	•	Manual refresh
	•	Scheduled job

⸻

3️⃣ Rate Limiting Utility (Critical)

Goal

Prevent abuse and control API costs.

⸻

Rate Limits (MVP)

Action	Limit
Refresh dashboard	1 per 5 minutes
Set market status	1 per market per 5 minutes
Utility Script

utils/rateLimit.ts

checkRateLimit({
  userId,
  action: 'refresh_dashboard' | 'set_market_status',
  key?: marketId,
  windowMs: number
})

Implementation:
	•	Redis preferred
	•	Mongo fallback acceptable for MVP

If exceeded:
	•	Throw controlled error
	•	Frontend shows cooldown message

⸻

4️⃣ Chat Cleanup & Maintenance Script

Goal

Automatically delete dead, low-value chats to keep DB lean.

⸻

Cleanup Rules (MVP)

A chat is deleted if:
	•	Total messages < 200
	•	AND no messages for 7 days

A chat is never deleted if:
	•	Messages ≥ 200 (historical value)

⸻

Script

cleanupInactiveChats.ts
Responsibilities:
	•	Scan chats collection
	•	Apply deletion rules
	•	Log deletions
	•	Safe to run multiple times

Recommended schedule:
	•	Once per day (Railway cron)

⸻

Chat Fields Required

Chat {
  _id
  messageCount: number
  lastMessageAt: Date
}

5️⃣ Caching Strategy (MVP-safe)

What to Cache

	TTL
Market positions	5–15 min
User dashboard	12–24h
Market status	Until user refreshes

Utility

utils/cache.ts
	•	Simple wrapper around Redis or memory
	•	Keyed by:
	•	market:{id}:positions
	•	user:{id}:dashboard

⸻

6️⃣ Why This Architecture Scales
	•	No per-message API calls
	•	No live recomputation
	•	User-triggered expensive operations only
	•	Background jobs are isolated
	•	Chat cleanup prevents DB bloat

This design comfortably scales to thousands of users.

⸻

7️⃣ Explicit Non-Goals (Do NOT Build)
	•	Live market prices
	•	Order books
	•	Market charts
	•	Directional position indicators (YES / NO)
	•	Negative status badges

These add cost without adding value in an extension context.

⸻

9️⃣ Instructions for Cursor

When executing this document:
	•	Follow steps in order
	•	Do not invent additional features
	•	Prefer clarity over optimization
	•	If Polymarket API data is ambiguous, stop and ask
