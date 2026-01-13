PolyBanter — MVP Execution Guide

Status: Authoritative MVP specification
Audience: New Cursor agent with zero prior context
Do not deviate from this document without explicit instruction

⸻

1. Project Overview

What PolyBanter Is

PolyBanter is a Chrome Extension side panel that turns Polymarket into a social, reputation-aware platform. It provides real-time chat, identity verification, and credibility signals directly alongside Polymarket while users browse markets.

This is not a standalone web app.
This is not a general chat platform.

PolyBanter’s value comes from being:
	•	Contextual (market-aware)
	•	Credible (identity + positions)
	•	Lightweight (read-only, no trading, no custody)

⸻

Core MVP Value Proposition

“While browsing Polymarket, users can instantly discuss the exact market they’re viewing, see who is actually financially exposed, and identify whales — all without leaving the page.”

⸻

2. MVP Scope (Strict)

IN SCOPE
	•	X (Twitter) login (mandatory)
	•	Polymarket account verification (bio string method)
	•	General chat
	•	Category chats
	•	Prediction-specific chats (per market)
	•	Auto-join prediction chats while browsing (toggleable)
	•	Friends + DMs
	•	Position indicator (🟢 Yes / 🔴 No)
	•	Whale indicator (🐳 Top 10% per market)
	•	Profile display polish

⸻

OUT OF SCOPE (DO NOT BUILD)
	•	AI insights
	•	Trading, signing, or transactions
	•	Wallet custody
	•	Monetization
	•	Leaderboards for whales
	•	Historical analytics
	•	Mobile support
	•	Tests beyond basic sanity

If something is not explicitly listed above, assume it is out of MVP.

⸻

3. Architectural Assumptions
	•	Frontend: React + TypeScript + Zustand
	•	Backend: NestJS + MongoDB + Socket.IO
	•	Auth: Twitter (X) OAuth (already implemented)
	•	Extension: Chrome Side Panel API
	•	Polymarket data: Read-only only

⸻

4. MVP Execution Order (MANDATORY)

All steps must be completed in order.
Do not skip ahead.

⸻

STEP 1 — Polymarket Account Verification (DO THIS FIRST)

Goal

Tie a PolyBanter user to a real Polymarket identity without wallet signing.

Verification Method

Bio-string verification on Polymarket profile.

⸻

Backend Requirements

User Schema Extension
Add:

polymarket: {
  verified: boolean,
  username?: string,
  wallet_address?: string,
  verification_token?: string,
  verified_at?: Date
}

Endpoints
1. Start Verification

POST /polymarket/verification/start

	•	Generate unique token:
PB-VERIFY-<userId>-<random>
	•	Store token on user
	•	Return token

⸻

2. Confirm Verification

POST /polymarket/verification/confirm

Input:

{
  polymarketUsername: string
}

Server must:
	1.	Fetch Polymarket profile page (server-side)
	2.	Parse bio text
	3.	Confirm token exists verbatim
	4.	Extract wallet address if publicly available
	5.	Mark user as verified
	6.	Clear token

Rules
	•	Rate limit attempts
	•	Token expires (e.g. 30 minutes)
	•	No frontend scraping

⸻

Frontend Requirements

Settings → Polymarket Verification
	•	Show generated string
	•	Copy button
	•	Link to Polymarket profile
	•	“I’ve added it” → confirm
	•	On success:
	•	Display Polymarket username on profile
	•	Show verification badge

⸻

STEP 2 — Polymarket Page Detection (Extension Glue)

Goal

Detect which Polymarket market the user is browsing in real time.

⸻

Content Script
	•	Detect Polymarket market URLs
	•	Extract marketId (URL or DOM)
	•	Send message to side panel:
{
  type: 'POLYMARKET_CONTEXT',
  marketId
}

Side Panel Logic
	•	Store currentMarketId in global state
	•	Do not switch chats yet (handled in Step 4)

⸻

STEP 3 — Prediction Banter Rooms (Concrete Rules)

Goal

Create one chat room per Polymarket market.

⸻

Backend Rules

Conversation schema:

Side Panel Logic
	•	Store currentMarketId in global state
	•	Do not switch chats yet (handled in Step 4)

⸻

STEP 3 — Prediction Banter Rooms (Concrete Rules)

Goal

Create one chat room per Polymarket market.

⸻

Backend Rules

Conversation schema:

type: 'market'
market_id: string

Rules:
	•	One room per market_id
	•	Create lazily (on first join)
	•	Enforce uniqueness on market_id

⸻

Frontend Rules
	•	When joining a prediction chat:
	•	Fetch or create room
	•	Display market title if available
	•	Prediction chats are distinct from:
	•	General banter
	•	Category banter

⸻

STEP 4 — Settings Toggle (Small but Important)

Goal

User controls whether chats auto-switch while browsing.

⸻

User Setting

settings: {
  autoPredictionChat: boolean
}

Behavior
	•	Default: ON
	•	If ON:
	•	Auto-join prediction chat when market detected
	•	If OFF:
	•	Show CTA: “Join Prediction Banter”

Persist immediately.

⸻

STEP 5 — Position Emoji (MVP Version)

Goal

Show whether a user is Yes or No in that specific market.

⸻

Backend

Create lightweight collection:

user_market_positions {
  user_id,
  market_id,
  position: 'yes' | 'no'
}

Frontend
	•	In prediction chat header:
	•	“Set your position”
	•	Display emoji next to username:
	•	🟢 Yes
	•	🔴 No
	•	Only visible inside that market’s chat

No automation. User-declared only.

⸻

STEP 6 — Whale Emoji (Top 10% — Data-Backed)

Goal

Identify users in the top 10% by position size per market.

⸻

Eligibility Rules
	•	User must have verified Polymarket account
	•	Whale status is per market
	•	Read-only data only

⸻

Backend Tasks
	1.	Position Fetcher
	•	Given wallet + market_id
	•	Fetch open position size (USD or equivalent)
	•	Handle “no position”
	2.	Cache Layer
	•	Cache positions per market
	•	TTL: 2–5 minutes
	•	Only users active in chat
	3.	Percentile Logic
	•	Sort positions descending
	•	Calculate 90th percentile cutoff
	•	Include ties at cutoff
	•	<10 users → no whales
	4.	API

GET /markets/:marketId/whales

Returns:

{
  [userId]: boolean
}

Never expose raw position sizes to frontend.

⸻

Frontend
	•	Fetch whale map per market
	•	Cache locally
	•	Render 🐳 next to username:
	•	Only in prediction chats
	•	Only if verified
	•	Silent failure if data unavailable

No tooltips. No explanations.

⸻

STEP 7 — Profile Polish (Final MVP Touch)

Profile Must Display
	•	Profile picture
	•	Header image
	•	Display name + username
	•	Bio
	•	X profile link
	•	Polymarket username (if verified)
	•	Verification badge

Nothing else.

⸻

5. MVP Stop Line (CRITICAL)

After Step 7, STOP.

Do not implement:
	•	AI
	•	Market analytics
	•	Pagination
	•	Search
	•	Typing indicators
	•	Read receipts
	•	Moderation dashboards
	•	Whale leaderboards

These are post-MVP.

⸻

6. Definition of MVP Complete

MVP is complete when:
	•	A new user can log in via X
	•	Verify their Polymarket account
	•	Browse Polymarket
	•	Automatically join the correct prediction chat
	•	See who is long/short
	•	See who the whales are
	•	Chat, DM, and manage friends
	•	Control auto-switch behavior

⸻

7. Final Instruction to Cursor

Execute this document strictly in order.
Do not add features, expand scope, or refactor unrelated systems.
When uncertain, stop and ask.
