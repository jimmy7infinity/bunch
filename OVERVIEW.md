# Grex — Chrome Extension Side Panel for Polymarket Social

## Executive Summary

**Grex** is a Chrome extension that transforms Polymarket into a social platform. It adds a persistent side panel to Chrome that enables real-time chat, AI-powered market insights, user rankings, and community engagement—all without leaving your current page.

**Key Features:**
- 🗨️ **Multi-category chat system** — Global, themed (Politics, Crypto, etc.), market-specific, private groups, and DMs
- 🤖 **AI-powered insights** — Automated analysis and notifications for significant market events
- 🏆 **Rankings & achievements** — Reputation system with leaderboards and unlockable roles
- 🔐 **Seamless auth** — Login via Polymarket wallet or Twitter
- 🎨 **Highly customizable** — Component-based architecture with easy theme editing

**Target Users:** Active Polymarket traders and prediction market enthusiasts who want to discuss markets in real-time, track their reputation, and receive intelligent alerts.

**Timeline:** 12-16 weeks from start to launch

**Tech Stack:** React + TypeScript (frontend), NestJS + Node.js (backend), MongoDB (database), Redis (cache), Socket.IO (real-time), OpenAI/Claude (AI)

---

## Purpose

Grex is a Chrome extension side panel that provides real-time social features, market chat, and community engagement for Polymarket users. It lives alongside your browsing experience, offering instant access to market discussions, user rankings, and social features without leaving your current page.

## Platform

**Chrome Extension Side Panel Only** — No standalone web or mobile app. The extension integrates directly into Chrome's side panel API, providing a persistent, always-accessible interface.

## High-Level Summary

Grex combines:
- **Multi-category chat system** — Global, themed, market-specific, private groups, DMs, and AI insights
- **Social networking** — Follow users, build reputation, earn achievement-based roles
- **User rankings** — Leaderboards and achievement system with visual roles/badges
- **AI-powered insights** — Automated notifications and analysis for followed markets/categories
- **Seamless authentication** — Login via Polymarket wallet or Twitter OAuth

## Chat Categories

Grex organizes conversations into six distinct categories:

1. **Global** — Public chat for all users, general Polymarket discussion
2. **Theme/Category** — Public chats organized by topic (e.g., Politics, Crypto, Sports, Entertainment)
3. **Market** — Individual market-specific chat rooms tied to specific Polymarket markets
4. **Group Chat** — Private group conversations (invite-only or link-based)
5. **DMs** — Private one-on-one direct messages
6. **AI** — Read-only notification channel where AI posts significant market insights (users cannot reply)

## AI Role & Behavior

**AI as an Intelligent Notifier:**

The AI acts as a smart analyst that monitors markets and categories users follow, posting insights when significant events occur:

- **Trigger-based messaging:** AI analyzes market activity (price movements, volume spikes, news, chat sentiment) and posts to relevant channels when thresholds are met
- **Personalized notifications:** Users receive notifications when AI posts to categories/markets they follow
- **Read-only channel:** Users cannot send messages to AI channels; AI posts are informational only
- **Context-aware insights:** AI provides interpretation, not just raw data (e.g., "Crypto markets seeing unusual volatility - Bitcoin prediction market shifted 15% in 30 minutes following Fed announcement")

**AI Posting Locations:**
- **Category AI channels:** AI posts to theme-specific channels (e.g., "Crypto AI", "Politics AI")
- **Market AI threads:** AI can post insights directly in market chat rooms (visually distinguished from user messages)
- **Direct AI notifications:** For high-priority events, AI can send direct notifications to users' notification center

**Example Flow:**
1. User follows "Crypto" category
2. Significant event detected: Major crypto market sees 20% price swing
3. AI generates insight: "🤖 Crypto Alert: 'Will Bitcoin hit $100k by EOY?' market surged 20% in 15 minutes following ETF approval news. Trading volume up 300%."
4. AI posts to "Crypto AI" channel
5. User receives notification: "AI posted in Crypto"
6. User clicks notification → opens Crypto AI channel → reads insight → can jump to market chat

## Key User Actions

1. **Authenticate** — Login via Polymarket wallet or Twitter
2. **Browse & follow** — Explore markets, categories, and users to follow
3. **Chat & discuss** — Participate in global, category, market, group, and DM conversations
4. **Monitor AI insights** — Receive AI-generated alerts for followed markets/categories
5. **Track reputation** — Earn points, unlock achievements, climb rankings
6. **Build network** — Follow users, create groups, engage with community
7. **Earn roles** — Achievement-based roles displayed as badges/titles

## Authentication

**Two login methods:**
1. **Polymarket Wallet** — Connect wallet, sign message for authentication
2. **Twitter OAuth** — Standard OAuth flow for Twitter login

Both methods create/link to a unified user account.

---

## Frontend Architecture (Chrome Extension Side Panel)

### Technology Stack

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite (optimized for Chrome extension builds)
- **Styling:** TailwindCSS with CSS variables for theming
- **State Management:** Zustand or Jotai (lightweight, perfect for extensions)
- **WebSocket:** Socket.IO client for real-time updates
- **Extension API:** Chrome Extension Manifest V3

### Component Architecture Philosophy

**Extreme Component Modularity** — Every UI element is a reusable component with clear variants:

#### Button System
All buttons use a unified component with explicit states:
- `<PrimaryButton variant="selected" />`
- `<PrimaryButton variant="deselected" />`
- `<SecondaryButton variant="selected" />`
- `<SecondaryButton variant="deselected" />`

#### Component Structure
```
frontend/src/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── buttons/
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── SecondaryButton.tsx
│   │   │   └── IconButton.tsx
│   │   ├── inputs/
│   │   │   ├── TextInput.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   └── TextArea.tsx
│   │   ├── cards/
│   │   │   ├── Card.tsx
│   │   │   ├── MarketCard.tsx
│   │   │   └── UserCard.tsx
│   │   ├── badges/
│   │   │   ├── Badge.tsx
│   │   │   ├── RoleBadge.tsx
│   │   │   └── AchievementBadge.tsx
│   │   ├── avatars/
│   │   │   ├── Avatar.tsx
│   │   │   └── AvatarGroup.tsx
│   │   └── layout/
│   │       ├── Container.tsx
│   │       ├── Stack.tsx
│   │       └── Grid.tsx
│   ├── features/              # Feature-specific components
│   │   ├── auth/
│   │   │   ├── LoginModal.tsx
│   │   │   ├── WalletConnect.tsx
│   │   │   └── TwitterLogin.tsx
│   │   ├── chat/
│   │   │   ├── ChatRoom.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── AIMessageItem.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── ChatCategoryTabs.tsx
│   │   │   └── AIInsightsPanel.tsx
│   │   ├── markets/
│   │   │   ├── MarketList.tsx
│   │   │   ├── MarketDetail.tsx
│   │   │   └── MarketHeader.tsx
│   │   ├── rankings/
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── UserRankCard.tsx
│   │   │   └── AchievementGrid.tsx
│   │   └── profile/
│   │       ├── UserProfile.tsx
│   │       ├── UserStats.tsx
│   │       └── RoleDisplay.tsx
│   └── layouts/
│       ├── SidePanelLayout.tsx
│       └── NavigationBar.tsx
```

### Theme System — Easy Customization

**CSS Variables Architecture** — All design tokens defined in CSS custom properties for instant theme switching.

#### Theme Configuration (`frontend/src/styles/theme.css`)

```css
:root {
  /* Colors */
  --background: rgb(231, 229, 228);
  --foreground: rgb(30, 41, 59);
  --card: rgb(245, 245, 244);
  --card-foreground: rgb(30, 41, 59);
  --popover: rgb(245, 245, 244);
  --popover-foreground: rgb(30, 41, 59);
  --primary: rgb(99, 102, 241);
  --primary-foreground: rgb(255, 255, 255);
  --secondary: rgb(214, 211, 209);
  --secondary-foreground: rgb(75, 85, 99);
  --muted: rgb(231, 229, 228);
  --muted-foreground: rgb(107, 114, 128);
  --accent: rgb(243, 229, 245);
  --accent-foreground: rgb(55, 65, 81);
  --destructive: rgb(239, 68, 68);
  --destructive-foreground: rgb(255, 255, 255);
  --border: rgb(214, 211, 209);
  --input: rgb(214, 211, 209);
  --ring: rgb(99, 102, 241);
  
  /* Chart colors */
  --chart-1: rgb(99, 102, 241);
  --chart-2: rgb(79, 70, 229);
  --chart-3: rgb(67, 56, 202);
  --chart-4: rgb(55, 48, 163);
  --chart-5: rgb(49, 46, 129);
  
  /* Sidebar (if needed) */
  --sidebar: rgb(214, 211, 209);
  --sidebar-foreground: rgb(30, 41, 59);
  --sidebar-primary: rgb(99, 102, 241);
  --sidebar-primary-foreground: rgb(255, 255, 255);
  --sidebar-accent: rgb(243, 229, 245);
  --sidebar-accent-foreground: rgb(55, 65, 81);
  --sidebar-border: rgb(214, 211, 209);
  --sidebar-ring: rgb(99, 102, 241);
  
  /* Typography */
  --font-sans: Plus Jakarta Sans, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: Roboto Mono, monospace;
  
  /* Border radius */
  --radius: 1.25rem;
  
  /* Shadows */
  --shadow-x: 2px;
  --shadow-y: 2px;
  --shadow-blur: 10px;
  --shadow-spread: 4px;
  --shadow-opacity: 0.18;
  --shadow-color: hsl(240 4% 60%);
  --shadow-2xs: 2px 2px 10px 4px hsl(240 4% 60% / 0.09);
  --shadow-xs: 2px 2px 10px 4px hsl(240 4% 60% / 0.09);
  --shadow-sm: 2px 2px 10px 4px hsl(240 4% 60% / 0.18), 2px 1px 2px 3px hsl(240 4% 60% / 0.18);
  --shadow: 2px 2px 10px 4px hsl(240 4% 60% / 0.18), 2px 1px 2px 3px hsl(240 4% 60% / 0.18);
  --shadow-md: 2px 2px 10px 4px hsl(240 4% 60% / 0.18), 2px 2px 4px 3px hsl(240 4% 60% / 0.18);
  --shadow-lg: 2px 2px 10px 4px hsl(240 4% 60% / 0.18), 2px 4px 6px 3px hsl(240 4% 60% / 0.18);
  --shadow-xl: 2px 2px 10px 4px hsl(240 4% 60% / 0.18), 2px 8px 10px 3px hsl(240 4% 60% / 0.18);
  --shadow-2xl: 2px 2px 10px 4px hsl(240 4% 60% / 0.45);
  
  /* Spacing & tracking */
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.dark {
  --background: rgb(30, 27, 24);
  --foreground: rgb(226, 232, 240);
  --card: rgb(44, 40, 37);
  --card-foreground: rgb(226, 232, 240);
  --popover: rgb(44, 40, 37);
  --popover-foreground: rgb(226, 232, 240);
  --primary: rgb(136, 128, 255);
  --primary-foreground: rgb(30, 27, 24);
  --secondary: rgb(58, 54, 51);
  --secondary-foreground: rgb(209, 213, 219);
  --muted: rgb(31, 28, 25);
  --muted-foreground: rgb(156, 163, 175);
  --accent: rgb(72, 68, 65);
  --accent-foreground: rgb(209, 213, 219);
  --destructive: rgb(239, 68, 68);
  --destructive-foreground: rgb(30, 27, 24);
  --border: rgb(58, 54, 51);
  --input: rgb(58, 54, 51);
  --ring: rgb(33, 48, 181);
  --chart-1: rgb(129, 140, 248);
  --chart-2: rgb(99, 102, 241);
  --chart-3: rgb(79, 70, 229);
  --chart-4: rgb(67, 56, 202);
  --chart-5: rgb(55, 48, 163);
  --sidebar: rgb(58, 54, 51);
  --sidebar-foreground: rgb(226, 232, 240);
  --sidebar-primary: rgb(129, 140, 248);
  --sidebar-primary-foreground: rgb(30, 27, 24);
  --sidebar-accent: rgb(72, 68, 65);
  --sidebar-accent-foreground: rgb(209, 213, 219);
  --sidebar-border: rgb(58, 54, 51);
  --sidebar-ring: rgb(129, 140, 248);
  --font-sans: Plus Jakarta Sans, sans-serif;
  --font-serif: Lora, serif;
  --font-mono: Roboto Mono, monospace;
  --radius: 1.25rem;
  --shadow-x: 2px;
  --shadow-y: 2px;
  --shadow-blur: 10px;
  --shadow-spread: 4px;
  --shadow-opacity: 0.18;
  --shadow-color: hsl(0 0% 0%);
  --shadow-2xs: 2px 2px 10px 4px hsl(0 0% 0% / 0.09);
  --shadow-xs: 2px 2px 10px 4px hsl(0 0% 0% / 0.09);
  --shadow-sm: 2px 2px 10px 4px hsl(0 0% 0% / 0.18), 2px 1px 2px 3px hsl(0 0% 0% / 0.18);
  --shadow: 2px 2px 10px 4px hsl(0 0% 0% / 0.18), 2px 1px 2px 3px hsl(0 0% 0% / 0.18);
  --shadow-md: 2px 2px 10px 4px hsl(0 0% 0% / 0.18), 2px 2px 4px 3px hsl(0 0% 0% / 0.18);
  --shadow-lg: 2px 2px 10px 4px hsl(0 0% 0% / 0.18), 2px 4px 6px 3px hsl(0 0% 0% / 0.18);
  --shadow-xl: 2px 2px 10px 4px hsl(0 0% 0% / 0.18), 2px 8px 10px 3px hsl(0 0% 0% / 0.18);
  --shadow-2xl: 2px 2px 10px 4px hsl(0 0% 0% / 0.45);
}

/* Tailwind theme integration */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}
```

**Theme editing:** Simply modify CSS variables in `theme.css` or use tools like [TweakCNS Theme Editor](https://tweakcns.com) to generate new themes.

### Extension Structure

```
frontend/
├── public/
│   ├── manifest.json          # Chrome extension manifest (V3)
│   ├── icons/                 # Extension icons (16, 48, 128px)
│   └── sidepanel.html         # Side panel HTML entry
├── src/
│   ├── sidepanel/             # Side panel app entry
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── background/            # Service worker
│   │   └── service-worker.ts
│   ├── content/               # Content scripts (if needed)
│   │   └── content.ts
│   ├── components/            # (see component structure above)
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # State management
│   ├── services/              # API & WebSocket clients
│   ├── utils/                 # Utilities
│   ├── types/                 # TypeScript types
│   └── styles/
│       ├── theme.css          # Theme variables
│       └── globals.css        # Global styles
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Data Model

### users

```typescript
{
  _id: ObjectId,
  username: string,
  display_name?: string,
  avatar_url?: string,
  created_at: ISOString,
  
  // Auth & identity
  wallet_address?: string,        // Polymarket wallet
  twitter_id?: string,            // Twitter OAuth ID
  twitter_username?: string,
  verified_wallet: boolean,
  verified_twitter: boolean,
  
  // Rankings & achievements
  reputation_score: number,       // 0-10000 points
  rank: number,                   // Global rank position
  level: number,                  // User level (1-100)
  roles: [                        // Achievement-based roles
    {
      role_id: string,            // e.g., "whale", "prophet", "degen"
      title: string,              // Display name
      icon_url: string,           // Badge icon
      earned_at: ISOString
    }
  ],
  achievements: [
    {
      achievement_id: string,
      title: string,
      description: string,
      icon_url: string,
      earned_at: ISOString,
      progress?: number           // For progressive achievements
    }
  ],
  
  // Stats for rankings
  stats: {
    total_messages: number,
    markets_joined: number,
    correct_predictions: number,
    total_predictions: number,
    likes_received: number,
    streak_days: number
  },
  
  // Social
  following_users: [user_id],
  followers: [user_id],
  blocked_users: [user_id],
  followed_markets: [market_id],
  followed_categories: [category_id],  // e.g., ["crypto", "politics"]
  
  // Preferences
  notification_preferences: {
    mentions: boolean,
    follows: boolean,
    achievements: boolean,
    market_updates: boolean,
    ai_insights: boolean,           // Receive AI notifications
    ai_insight_severity: 'all' | 'medium' | 'high' | 'critical'
  },
  theme: 'light' | 'dark' | 'auto',
  
  last_seen_at: ISOString
}
```

**Indexes:** `_id`, `username`, `wallet_address`, `twitter_id`, `rank`, `reputation_score`

### roles (achievement-based roles)

```typescript
{
  _id: ObjectId,
  role_id: string,                // e.g., "whale", "prophet"
  title: string,                  // Display name
  description: string,
  icon_url: string,
  badge_color: string,            // Hex color for badge
  
  // Unlock criteria
  criteria: {
    type: 'reputation' | 'achievement' | 'manual',
    threshold?: number,           // For reputation-based
    required_achievements?: [achievement_id],
    required_stats?: {
      min_messages?: number,
      min_correct_predictions?: number,
      min_streak_days?: number
    }
  },
  
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  display_order: number,
  active: boolean
}
```

### achievements

```typescript
{
  _id: ObjectId,
  achievement_id: string,
  title: string,
  description: string,
  icon_url: string,
  category: 'social' | 'prediction' | 'engagement' | 'special',
  
  // Unlock criteria
  criteria: {
    type: 'message_count' | 'prediction_accuracy' | 'streak' | 'special',
    threshold?: number,
    progressive: boolean          // Can be earned multiple times
  },
  
  points_reward: number,          // Reputation points awarded
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  active: boolean
}
```

### chat_categories (theme/topic categories)

```typescript
{
  _id: ObjectId,
  category_id: string,            // e.g., "crypto", "politics", "sports"
  name: string,                   // Display name: "Crypto", "Politics"
  description: string,
  icon_url: string,
  color: string,                  // Hex color for category badge
  
  // Associated rooms
  chat_room_id: ObjectId,         // Main category chat room
  ai_room_id: ObjectId,           // AI insights room for this category
  
  // Stats
  follower_count: number,
  message_count_24h: number,
  active_users_count: number,
  
  display_order: number,
  active: boolean,
  created_at: ISOString
}
```

**Indexes:** `category_id`, `display_order`, `active`

**Default Categories:**
- Global (always visible, cannot unfollow)
- Politics
- Crypto
- Sports
- Entertainment
- Business
- Science & Tech
- Pop Culture

### chat_rooms

```typescript
{
  _id: ObjectId,
  type: 'global' | 'category' | 'market' | 'group' | 'dm' | 'ai',
  
  // Type-specific references
  category_id?: string,           // For category chats
  market_id?: string,             // For market-specific chats
  title?: string,                 // For group chats and DMs
  
  // Participants (not applicable for global/category/ai rooms)
  participants: [
    {
      user_id: ObjectId,
      role: 'member' | 'moderator' | 'owner',
      joined_at: ISOString,
      muted: boolean
    }
  ],
  
  settings: {
    public: boolean,              // Public rooms are discoverable
    allow_reactions: boolean,
    allow_user_messages: boolean, // False for AI rooms
    slow_mode_seconds?: number,
    require_verification: boolean // Require wallet/twitter verification
  },
  
  // Metadata
  description?: string,
  avatar_url?: string,            // For group chats
  
  created_at: ISOString,
  last_message_at: ISOString,
  message_count: number
}
```

**Indexes:** `_id`, `type`, `category_id`, `market_id`, `last_message_at`, `participants.user_id`

**Room Type Characteristics:**
- **global:** Single room, all users auto-joined, public
- **category:** One per category, users join by following category, public
- **market:** One per Polymarket market, auto-created, public
- **group:** Private, invite-only or link-based joining
- **dm:** Private, two participants only
- **ai:** Read-only, AI posts only, users auto-joined based on follows

### chat_messages

```typescript
{
  _id: ObjectId,
  room_id: ObjectId,
  sender_id: ObjectId,            // Can be user_id or 'ai' for AI messages
  sender_type: 'user' | 'ai',
  
  text: string,
  mentions: [user_id],
  
  // AI-specific fields
  ai_metadata?: {
    insight_type: 'price_movement' | 'volume_spike' | 'news_event' | 'sentiment_shift',
    severity: 'low' | 'medium' | 'high' | 'critical',
    related_markets: [market_id],
    data_points: {                // Raw data that triggered the insight
      price_change?: number,
      volume_change?: number,
      time_window?: string
    },
    model_used: string,
    confidence_score: number      // 0-1
  },
  
  reactions: [
    {
      emoji: string,
      user_ids: [user_id],
      count: number
    }
  ],
  
  metadata: {
    side?: 'long' | 'short',      // Market position (user messages)
    sentiment?: 'bullish' | 'bearish' | 'neutral'
  },
  
  // Threading (for AI insights that reference specific events)
  reply_to_message_id?: ObjectId,
  
  created_at: ISOString,
  edited_at?: ISOString,
  deleted: boolean,
  pinned: boolean                 // Mods can pin important messages
}
```

**Indexes:** `room_id`, `sender_id`, `sender_type`, `created_at`, `mentions`, `ai_metadata.insight_type`

### markets_cache

```typescript
{
  market_id: string,              // Polymarket market ID
  slug: string,
  title: string,
  description: string,
  category_id: string,            // Links to chat_categories
  
  // Price data
  current_price: number,
  previous_price: number,         // For calculating changes
  price_change_1h: number,
  price_change_24h: number,
  volume_24h: number,
  liquidity: number,
  
  // Chat stats
  chat_room_id: ObjectId,
  ai_room_id: ObjectId,           // AI insights for this market
  active_users_count: number,
  message_count_24h: number,
  follower_count: number,
  
  // AI monitoring thresholds
  ai_monitoring: {
    last_ai_post_at?: ISOString,
    price_alert_threshold: number,    // % change to trigger AI
    volume_alert_threshold: number,   // % change to trigger AI
    cooldown_minutes: number          // Min time between AI posts
  },
  
  // Metadata
  end_date: ISOString,
  resolved: boolean,
  resolution?: 'yes' | 'no',
  image_url?: string,
  
  created_at: ISOString,
  updated_at: ISOString
}
```

**Indexes:** `market_id`, `slug`, `category_id`, `updated_at`, `resolved`

### leaderboard_snapshots (for efficient ranking queries)

```typescript
{
  _id: ObjectId,
  period: 'daily' | 'weekly' | 'monthly' | 'all_time',
  rankings: [
    {
      rank: number,
      user_id: ObjectId,
      username: string,
      avatar_url: string,
      reputation_score: number,
      roles: [role_id],
      change: number              // Rank change from previous period
    }
  ],
  generated_at: ISOString
}
```

### ai_insights_log (audit trail for AI posts)

```typescript
{
  _id: ObjectId,
  message_id: ObjectId,           // Reference to chat_messages
  room_id: ObjectId,
  
  trigger: {
    type: 'price_movement' | 'volume_spike' | 'news_event' | 'sentiment_shift' | 'manual',
    market_ids: [market_id],
    category_id?: string,
    data_snapshot: {              // Data at time of trigger
      price_before: number,
      price_after: number,
      volume_before: number,
      volume_after: number,
      time_window: string
    }
  },
  
  generation: {
    model: string,                // e.g., "gpt-4", "claude-3"
    prompt_tokens: number,
    completion_tokens: number,
    cost_usd: number,
    latency_ms: number,
    confidence_score: number
  },
  
  delivery: {
    posted_at: ISOString,
    notification_sent_to: [user_id],  // Users who received notification
    notification_count: number,
    view_count: number,
    reaction_count: number
  },
  
  created_at: ISOString
}
```

**Indexes:** `message_id`, `trigger.type`, `trigger.market_ids`, `created_at`

---

## AI System Architecture

### Overview

The AI system monitors market activity and generates contextual insights when significant events occur. It operates as a separate service that:
1. Continuously monitors market data (prices, volume, chat activity)
2. Detects significant events based on configurable thresholds
3. Generates human-readable insights using LLMs
4. Posts insights to appropriate AI channels
5. Notifies users who follow affected markets/categories

### AI Service Components

#### 1. Market Monitor Service
**Purpose:** Continuously poll Polymarket API and internal metrics

**Monitoring Frequency:**
- High-volume markets: Every 30 seconds
- Medium-volume markets: Every 2 minutes
- Low-volume markets: Every 5 minutes

**Metrics Tracked:**
- Price changes (1min, 5min, 15min, 1hr, 24hr)
- Volume changes (1hr, 24hr)
- Liquidity changes
- Chat message velocity
- Chat sentiment (aggregated from user messages)

#### 2. Event Detection Service
**Purpose:** Identify significant events that warrant AI insights

**Detection Rules:**

| Event Type | Threshold | Cooldown |
|------------|-----------|----------|
| Major price movement | ≥10% in 15min | 30min |
| Significant price movement | ≥5% in 1hr | 1hr |
| Volume spike | ≥200% vs 24hr avg | 2hr |
| Liquidity drain | ≥30% decrease | 4hr |
| Chat activity surge | ≥300% vs 1hr avg | 1hr |
| Sentiment flip | Bullish→Bearish or vice versa | 2hr |

**Cooldown Logic:** Prevents AI spam by enforcing minimum time between posts for the same market/category.

#### 3. Insight Generation Service
**Purpose:** Generate contextual, human-readable insights using LLMs

**Input Context:**
- Event data (price changes, volume, etc.)
- Market metadata (title, description, category)
- Recent chat messages (last 20 messages for sentiment context)
- Historical context (previous AI insights, market trends)

**Prompt Template Example:**
```
You are an AI analyst for Grex, a Polymarket social platform.

Market: "{market_title}"
Category: {category}
Event: {event_type}

Data:
- Current price: {current_price} ({price_change}% change in {time_window})
- Volume: {volume_24h} ({volume_change}% vs average)
- Chat activity: {message_count} messages in last hour ({activity_change}%)

Recent chat sentiment: {sentiment_summary}

Generate a concise, informative insight (2-3 sentences) explaining what happened and why it might be significant. Be factual, avoid speculation, and highlight key numbers. Use an emoji at the start.
```

**Output Format:**
```
🚨 Crypto Alert: 'Will Bitcoin hit $100k by EOY?' surged 12% to 68¢ in 15 minutes following spot ETF approval news. Trading volume spiked 250% with strong bullish sentiment in chat. This is the largest single-hour move in the past week.
```

**Model Selection:**
- **High-priority events:** GPT-4 or Claude 3 Opus (higher quality, higher cost)
- **Medium-priority events:** GPT-3.5-turbo or Claude 3 Sonnet
- **Low-priority events:** Heuristic-based templates (no LLM, zero cost)

#### 4. Insight Distribution Service
**Purpose:** Post insights and notify relevant users

**Distribution Flow:**
1. **Post to AI channel:** Create message in appropriate AI room (category or market)
2. **Identify audience:** Query users who follow the category/market AND have AI notifications enabled
3. **Filter by severity:** Respect user's `ai_insight_severity` preference
4. **Send notifications:** Create notification records and push via WebSocket
5. **Log delivery:** Record in `ai_insights_log` for analytics

**Notification Format:**
```typescript
{
  type: 'ai_insight',
  title: 'AI Alert: Crypto',
  body: '🚨 Major movement in Bitcoin market',
  metadata: {
    room_id: ObjectId,
    message_id: ObjectId,
    market_id: string,
    category_id: string,
    severity: 'high'
  },
  action: 'open_ai_channel'
}
```

### AI System Configuration

```typescript
// backend/src/config/ai.config.ts
export const AI_CONFIG = {
  monitoring: {
    highVolumeInterval: 30000,      // 30s
    mediumVolumeInterval: 120000,   // 2min
    lowVolumeInterval: 300000,      // 5min
  },
  
  thresholds: {
    priceMovement: {
      critical: { percent: 15, window: '15min', cooldown: '30min' },
      high: { percent: 10, window: '15min', cooldown: '30min' },
      medium: { percent: 5, window: '1hr', cooldown: '1hr' },
    },
    volumeSpike: {
      high: { multiplier: 3, cooldown: '2hr' },
      medium: { multiplier: 2, cooldown: '2hr' },
    },
    chatActivity: {
      high: { multiplier: 3, cooldown: '1hr' },
    },
  },
  
  generation: {
    maxPromptTokens: 1000,
    maxCompletionTokens: 200,
    temperature: 0.7,
    models: {
      critical: 'gpt-4-turbo-preview',
      high: 'gpt-3.5-turbo',
      medium: 'gpt-3.5-turbo',
      low: 'template',              // No LLM
    },
  },
  
  rateLimit: {
    maxInsightsPerHour: 100,        // Global limit
    maxInsightsPerMarket: 5,        // Per market per hour
    maxInsightsPerCategory: 10,     // Per category per hour
  },
  
  costs: {
    budgetPerDay: 50,               // USD
    alertThreshold: 40,             // Alert at 80% of budget
  },
};
```

### AI Message UI Treatment

**Visual Distinction:**
- AI messages have distinct styling (different background, border, icon)
- AI avatar/icon displayed instead of user avatar
- "AI" badge or label
- Cannot be replied to directly (no reply button)
- Can be reacted to with emojis
- Can be shared/linked

**Example UI:**
```
┌─────────────────────────────────────────┐
│ 🤖 AI                            [⚡ High] │
│ ─────────────────────────────────────── │
│ 🚨 Crypto Alert: 'Will Bitcoin hit     │
│ $100k by EOY?' surged 12% to 68¢ in    │
│ 15 minutes following spot ETF approval │
│ news. Trading volume spiked 250% with  │
│ strong bullish sentiment in chat.      │
│                                         │
│ 👍 24  🔥 18  💎 12        2 minutes ago │
└─────────────────────────────────────────┘
```

### AI System Scaling Considerations

- **Horizontal scaling:** Multiple monitor instances with distributed lock (Redis)
- **Queue-based:** Use BullMQ for event processing and insight generation
- **Caching:** Cache market data in Redis to reduce API calls
- **Cost monitoring:** Track LLM costs in real-time, pause if budget exceeded
- **Fallback:** If LLM unavailable, use template-based insights
- **Rate limiting:** Prevent AI spam with per-market and per-category limits

---

## API Endpoints

### Auth

- `POST /auth/wallet` — Wallet signature authentication (Polymarket)
- `POST /auth/twitter` — Twitter OAuth callback
- `POST /auth/refresh` — Refresh JWT token
- `POST /auth/logout` — Logout and invalidate token

### Users

- `GET /users/me` — Current user profile with stats, roles, achievements
- `GET /users/:id` — User profile by ID
- `PATCH /users/me` — Update profile (display_name, avatar, preferences)
- `GET /users/search?q=` — Search users by username
- `POST /users/:id/follow` — Follow/unfollow user
- `GET /users/:id/followers` — List followers
- `GET /users/:id/following` — List following

### Rankings & Achievements

- `GET /rankings/leaderboard?period=all_time&limit=100` — Get leaderboard
- `GET /rankings/user/:id` — User's rank and nearby users
- `GET /achievements` — List all available achievements
- `GET /achievements/user/:id` — User's earned achievements
- `GET /roles` — List all available roles
- `POST /achievements/:id/claim` — Claim earned achievement (if auto-claim disabled)

### Categories

- `GET /categories` — List all chat categories
- `GET /categories/:id` — Category details with stats
- `POST /categories/:id/follow` — Follow/unfollow category
- `GET /categories/:id/markets` — List markets in category
- `GET /categories/:id/trending` — Trending topics in category

### Markets

- `GET /markets` — List markets with filters (category, trending, etc.)
- `GET /markets/:id` — Market details with chat room info
- `POST /markets/:id/follow` — Follow/unfollow market
- `GET /markets/:id/stats` — Market chat statistics
- `GET /markets/trending` — Trending markets (by chat activity, price movement)
- `GET /markets/followed` — User's followed markets

### Chat

- `GET /chat/rooms` — List user's accessible chat rooms (by type)
- `GET /chat/rooms/:id` — Room details
- `GET /chat/rooms/:id/messages?before=&limit=50` — Paginated messages
- `POST /chat/rooms/:id/messages` — Send message (not allowed in AI rooms)
- `PATCH /chat/messages/:id` — Edit message
- `DELETE /chat/messages/:id` — Delete message
- `POST /chat/messages/:id/react` — Add/remove reaction
- `POST /chat/messages/:id/pin` — Pin message (moderators only)
- `GET /chat/global` — Get global chat room
- `GET /chat/ai/:category_id` — Get AI insights room for category
- `POST /chat/groups/create` — Create private group chat
- `POST /chat/groups/:id/invite` — Generate invite link or invite users

### AI Insights

- `GET /ai/insights/recent?category=&limit=20` — Recent AI insights
- `GET /ai/insights/:id` — Specific AI insight with full context
- `GET /ai/insights/stats` — AI system statistics (posts per day, accuracy, etc.)
- `POST /ai/insights/:id/feedback` — User feedback on AI insight (helpful/not helpful)

### WebSocket Events (Socket.IO)

**Client → Server:**
- `join_room` — Join chat room
- `leave_room` — Leave chat room
- `send_message` — Send chat message
- `typing_start` — User started typing
- `typing_stop` — User stopped typing
- `react_message` — React to message
- `mark_read` — Mark room as read

**Server → Client:**
- `message_new` — New message in room (user or AI)
- `message_edited` — Message edited
- `message_deleted` — Message deleted
- `message_pinned` — Message pinned by moderator
- `reaction_added` — Reaction added to message
- `user_joined` — User joined room
- `user_left` — User left room
- `typing_users` — List of users currently typing
- `achievement_earned` — User earned achievement
- `rank_changed` — User's rank changed
- `ai_insight_posted` — AI posted new insight (with room_id, category_id, severity)
- `room_stats_updated` — Room statistics updated (active users, message count)

**Room Namespaces:**
- `room:global` — Global chat
- `room:category:{category_id}` — Category chat
- `room:market:{market_id}` — Market chat
- `room:group:{group_id}` — Group chat
- `room:dm:{room_id}` — Direct message
- `room:ai:{category_id}` — AI insights room
- `user:{user_id}` — Personal notifications and events

---

## Backend Architecture

### Technology Stack

- **Runtime:** Node.js 20+
- **Framework:** NestJS (TypeScript)
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.IO
- **Cache:** Redis (sessions, presence, rate limiting)
- **Queue:** BullMQ (background jobs)
- **Auth:** JWT with refresh tokens

### Services Structure

```
backend/src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── wallet.strategy.ts
│   │   │   └── twitter.strategy.ts
│   │   └── guards/
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── schemas/
│   ├── categories/
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── schemas/
│   ├── chat/
│   │   ├── chat.controller.ts
│   │   ├── chat.service.ts
│   │   ├── chat.gateway.ts      # WebSocket
│   │   └── schemas/
│   ├── markets/
│   │   ├── markets.controller.ts
│   │   ├── markets.service.ts
│   │   └── markets.sync.service.ts  # Sync with Polymarket API
│   ├── rankings/
│   │   ├── rankings.controller.ts
│   │   ├── rankings.service.ts
│   │   └── rankings.calculator.service.ts
│   ├── achievements/
│   │   ├── achievements.controller.ts
│   │   ├── achievements.service.ts
│   │   └── achievements.checker.service.ts
│   └── ai/
│       ├── ai.controller.ts
│       ├── ai.service.ts
│       ├── monitor.service.ts        # Market monitoring
│       ├── detector.service.ts       # Event detection
│       ├── generator.service.ts      # Insight generation (LLM)
│       ├── distributor.service.ts    # Notification distribution
│       └── schemas/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── ai.config.ts
│   └── websocket.config.ts
└── main.ts
```

### Background Jobs (BullMQ)

**High Frequency (< 1 minute):**
- **Market Monitor** — Poll Polymarket API (30s-5min intervals based on market volume)
- **AI Event Detection** — Analyze market data for significant events (every 30s)

**Medium Frequency (1-5 minutes):**
- **Achievement Checker** — Check for newly earned achievements (every 1 minute)
- **Ranking Calculator** — Recalculate rankings (every 5 minutes)
- **Room Stats Aggregator** — Update chat room statistics (every 2 minutes)

**Low Frequency (> 5 minutes):**
- **Leaderboard Snapshots** — Generate daily/weekly/monthly snapshots (hourly)
- **User Stats Aggregation** — Aggregate user stats from activity (every 10 minutes)
- **AI Cost Monitor** — Track and alert on LLM costs (every 15 minutes)
- **Inactive Room Cleanup** — Archive or clean up inactive rooms (daily)

**Event-Driven:**
- **AI Insight Generation** — Triggered by event detection
- **AI Insight Distribution** — Triggered after insight generation
- **Notification Delivery** — Triggered by various events (messages, follows, achievements)

---

## Reputation & Ranking System

### Reputation Points Sources

| Action | Points |
|--------|--------|
| Send message | +1 |
| Receive reaction | +2 |
| Get mentioned | +3 |
| Correct prediction (verified) | +50 |
| Daily login streak (per day) | +5 |
| Market followed | +1 |
| User follows you | +10 |
| Achievement earned | Variable (10-500) |

### Ranking Calculation

Rankings are recalculated every 5 minutes based on:
1. **Reputation score** (primary)
2. **Recent activity** (7-day weighted multiplier)
3. **Prediction accuracy** (bonus multiplier)

### Roles System

Roles are automatically granted when criteria are met:

**Example Roles:**
- **Whale** — 5000+ reputation
- **Prophet** — 80%+ prediction accuracy with 20+ predictions
- **Degen** — 1000+ messages sent
- **OG** — Account created in first month
- **Streak Master** — 30+ day login streak
- **Social Butterfly** — 100+ followers

Users can display one "primary role" as their badge, but earn multiple roles.

---

## User Interface & Navigation

### Side Panel Layout

The Chrome extension side panel uses a vertical layout optimized for the narrow side panel width (typically 400-500px):

```
┌─────────────────────────────────┐
│  Grex          [👤] [⚙️]  │ ← Header (user avatar, settings)
├─────────────────────────────────┤
│  🌍 Global                  [12]│ ← Navigation tabs (unread counts)
│  💼 Politics               [3] │
│  💰 Crypto                 [8] │
│  ⚽ Sports                  [1] │
│  🤖 AI Insights            [2] │
│  💬 My Chats               [5] │
│  📊 Rankings                   │
├─────────────────────────────────┤
│                                 │
│  [Active Chat/View Area]        │ ← Main content area
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│  Type a message...         [📎] │ ← Message input (if applicable)
└─────────────────────────────────┘
```

### Navigation Structure

**Primary Tabs:**
1. **Global** — Global chat (always visible)
2. **Categories** — User's followed categories (Politics, Crypto, etc.)
3. **AI Insights** — Aggregated AI insights from followed categories
4. **My Chats** — DMs, group chats, and followed markets
5. **Rankings** — Leaderboards and achievements
6. **Profile** — User profile and settings

### Chat View Types

**1. Category View (e.g., "Crypto"):**
- Shows category chat + AI insights in split view or tabs
- List of trending markets in this category (sidebar or collapsible)
- Quick follow/unfollow category button

**2. Market View:**
- Market header (title, current price, chart thumbnail)
- Market chat messages
- AI insights related to this market (inline or sidebar)
- Quick actions: Follow, Share, View on Polymarket

**3. AI Insights View:**
- Feed of recent AI insights from all followed categories
- Filterable by category, severity, time
- Each insight is clickable → jumps to relevant market/category chat

**4. DM/Group View:**
- Standard chat interface
- Participant list (for groups)
- Group settings (for group owners)

### Notification System

**Notification Types:**
1. **Message notifications** — New DM or mention
2. **AI insight notifications** — AI posted in followed category/market
3. **Achievement notifications** — Earned new achievement or role
4. **Social notifications** — New follower, friend request
5. **Market notifications** — Followed market resolved or hit price target

**Notification UI:**
- Badge count on extension icon (total unread)
- Badge counts on navigation tabs (per section)
- In-app notification center (bell icon in header)
- Chrome notifications for high-priority events (optional, user preference)

### Responsive Behavior

- Adapts to side panel width (Chrome allows resizing)
- Minimum width: 350px
- Optimal width: 400-450px
- Maximum width: 600px
- Mobile-first design principles (since side panel is narrow)

---

## Chrome Extension Integration

### Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "Grex",
  "version": "1.0.0",
  "description": "Social chat for Polymarket",
  
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  
  "permissions": [
    "sidePanel",
    "storage",
    "notifications"
  ],
  
  "host_permissions": [
    "https://polymarket.com/*",
    "https://api.polybanter.com/*"
  ],
  
  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },
  
  "action": {
    "default_title": "Open Grex"
  },
  
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

### Side Panel Activation

- User clicks extension icon → side panel opens
- Side panel persists across tabs
- Can be pinned/unpinned by user
- Maintains state and WebSocket connection

---

## Development Workflow

### Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (Extension)
cd frontend
npm install
npm run dev          # Development build with HMR
npm run build        # Production build
```

### Loading Extension in Chrome

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `frontend/dist` folder
5. Extension appears in toolbar
6. Click icon to open side panel

### Hot Reload

- Frontend: Vite HMR works in development mode
- Backend: NestJS watch mode with nodemon
- WebSocket: Auto-reconnect on connection loss

---

## Security & Moderation

### Security Measures

- **JWT tokens** stored in Chrome extension storage (encrypted)
- **Wallet signatures** verified on backend (nonce-based, single-use)
- **Rate limiting** on all API endpoints (Redis-backed, per-user and per-IP)
- **Input sanitization** for all chat messages (XSS prevention, HTML escaping)
- **CORS** configured for extension origin only
- **WebSocket authentication** required for all connections (JWT in handshake)
- **Message encryption** for DMs (end-to-end encryption optional, future feature)
- **API key rotation** for external services (Polymarket, LLM providers)
- **Audit logging** for sensitive operations (admin actions, moderation)

### Content Moderation

**Automated Moderation:**
- **Spam detection** — Rate limiting, duplicate message detection
- **Profanity filter** — Configurable word blacklist
- **Link validation** — Prevent phishing links, malware
- **Image moderation** — AI-based NSFW detection (future feature)

**User Reporting:**
- Users can report messages, users, or rooms
- Report types: Spam, Harassment, Scam, Inappropriate Content, Other
- Reports feed into moderation queue

**Moderation Queue:**
- Dashboard for moderators to review reports
- Actions: Warn, Mute (temporary), Ban (permanent), Delete Message, Delete Room
- Moderator activity logged for accountability

**User Trust System:**
- New accounts have restricted permissions (lower message rate, cannot create groups)
- Trust score increases with verified wallet/Twitter, account age, positive community signals
- High trust users have higher rate limits and can apply for moderator role

**Moderator Roles:**
- **Category Moderators** — Moderate specific category chats
- **Market Moderators** — Moderate specific market chats (auto-assigned to high-rep users)
- **Global Moderators** — Moderate all public chats
- **Admins** — Full system access

### Privacy Considerations

- **Data minimization** — Only collect necessary user data
- **Anonymization** — User IDs hashed in analytics
- **Data retention** — Messages deleted after 90 days (configurable)
- **User data export** — Users can download their data (GDPR compliance)
- **Account deletion** — Users can delete account and all associated data
- **AI privacy** — No PII sent to LLM providers (sanitize inputs)

---

## Analytics & Metrics

### User Metrics
- **DAU/MAU** — Daily/monthly active users
- **Retention** — 1-day, 7-day, 30-day retention rates
- **Session duration** — Average time spent in side panel per session
- **Messages per user** — Average messages sent per active user per day
- **Category follows** — Distribution of category follows
- **Market follows** — Distribution of market follows

### Engagement Metrics
- **Chat participation rate** — % of users who send messages vs. read-only
- **AI insight engagement** — Click-through rate, reaction rate on AI messages
- **Achievement completion rate** — % of users earning achievements
- **Leaderboard engagement** — % of users viewing rankings
- **Notification response rate** — % of notifications clicked

### System Metrics
- **WebSocket stability** — Connection uptime, disconnects, reconnects
- **API response times** — P50, P95, P99 for all endpoints
- **Message delivery latency** — Time from send to delivery
- **AI insight latency** — Time from event detection to insight posted
- **Database performance** — Query times, connection pool usage
- **Redis performance** — Cache hit rate, memory usage

### AI Metrics
- **Insights generated** — Count per day, per category, per market
- **AI accuracy** — User feedback (helpful/not helpful ratio)
- **LLM costs** — Daily spend, cost per insight
- **Event detection accuracy** — False positive rate, missed events
- **Notification engagement** — % of AI notifications clicked

### Business Metrics
- **User acquisition** — New signups per day, source attribution
- **User growth rate** — Week-over-week, month-over-month
- **Viral coefficient** — Invites sent, invite acceptance rate
- **Market coverage** — % of Polymarket markets with active chat
- **Category popularity** — Messages and users per category

---

## Future Enhancements

### Phase 2 (3-6 months)
- **Voice channels** for market discussions (WebRTC)
- **Prediction tournaments** with leaderboards and prizes
- **Market alerts** via Chrome notifications (custom price/volume triggers)
- **Integration with Polymarket positions** (show user's positions in chat, auto-badge for position holders)
- **Custom emojis** and stickers (user-uploaded, moderated)
- **Tip system** (send crypto tips in chat via smart contract)
- **Thread replies** (reply to specific messages, create threads)
- **Message search** (full-text search across all chats)

### Phase 3 (6-12 months)
- **NFT badges** for special achievements (on-chain, tradeable)
- **AI chat assistant** (users can ask AI questions about markets)
- **Portfolio integration** (track P&L, share trades)
- **Social trading** (copy trades from top users)
- **Market creation** (users can suggest new markets to Polymarket)
- **Video/audio messages** (short clips in chat)
- **Screen sharing** (for market analysis sessions)
- **Mobile app** (React Native, if demand is high)

### Phase 4 (12+ months)
- **DAO governance** (community votes on features, moderation policies)
- **Token rewards** (earn tokens for quality contributions)
- **Prediction pools** (group predictions with shared winnings)
- **AI market maker** (AI suggests markets based on news/trends)
- **Cross-platform** (Firefox, Edge, Safari extensions)
- **API for developers** (build bots, integrations)
- **White-label** (license platform for other prediction markets)

---

## Deployment Strategy

### Infrastructure

**Backend:**
- **Hosting:** AWS ECS (Fargate) or Google Cloud Run
- **Database:** MongoDB Atlas (managed, auto-scaling)
- **Cache:** Redis Cloud or AWS ElastiCache
- **Queue:** BullMQ with Redis
- **Storage:** AWS S3 for user uploads (avatars, future media)
- **CDN:** CloudFront for static assets

**Environment Setup:**
- **Development:** Local Docker Compose setup
- **Staging:** Separate cluster with production-like config
- **Production:** Multi-region deployment (US-East, US-West, EU)

### CI/CD Pipeline

```
GitHub → GitHub Actions → Build → Test → Deploy
```

**Pipeline Steps:**
1. **Lint & Format** — ESLint, Prettier
2. **Type Check** — TypeScript compilation
3. **Unit Tests** — Jest
4. **Integration Tests** — Supertest for API, Playwright for extension
5. **Build** — Docker images for backend, Vite build for extension
6. **Deploy to Staging** — Auto-deploy on merge to `develop`
7. **E2E Tests** — Full flow tests on staging
8. **Deploy to Production** — Manual approval for `main` branch
9. **Smoke Tests** — Post-deployment health checks

### Extension Publishing

**Chrome Web Store:**
1. Build production extension (`npm run build`)
2. Create ZIP of `dist` folder
3. Upload to Chrome Web Store Developer Dashboard
4. Submit for review (typically 1-3 days)
5. Publish to users (can do gradual rollout)

**Version Management:**
- Semantic versioning (e.g., 1.2.3)
- Changelog maintained in `CHANGELOG.md`
- Release notes in Web Store listing

### Monitoring & Alerting

**Tools:**
- **Application Monitoring:** Sentry (error tracking)
- **Infrastructure Monitoring:** Datadog or New Relic
- **Logs:** CloudWatch Logs or Datadog Logs
- **Uptime:** Pingdom or UptimeRobot
- **Alerts:** PagerDuty for critical issues

**Key Alerts:**
- API error rate > 5%
- WebSocket disconnection rate > 10%
- Database connection pool exhausted
- Redis memory > 80%
- AI daily budget > 80%
- Queue depth > 1000 jobs

### Scaling Strategy

**Horizontal Scaling:**
- Backend API: Auto-scale based on CPU/memory (2-10 instances)
- WebSocket servers: Separate from API, scale independently
- AI workers: Scale based on queue depth (1-5 instances)

**Database Scaling:**
- MongoDB sharding by user_id for users collection
- Read replicas for heavy read operations
- Indexes optimized for common queries

**Caching Strategy:**
- Redis for session storage, rate limiting, presence
- Application-level caching for market data (30s TTL)
- CDN caching for static assets (1 year TTL)

### Disaster Recovery

- **Database backups:** Daily automated backups, 30-day retention
- **Point-in-time recovery:** MongoDB Atlas supports PITR
- **Failover:** Multi-AZ deployment for high availability
- **Incident response plan:** Documented runbook for common issues

---

## Testing Strategy

### Frontend Testing

**Unit Tests (Jest + React Testing Library):**
- All UI components (buttons, cards, inputs)
- Custom hooks
- Utility functions
- State management (Zustand stores)

**Integration Tests:**
- Component interactions
- WebSocket connection handling
- API client methods
- Auth flows

**E2E Tests (Playwright):**
- Complete user flows (signup → chat → earn achievement)
- Extension installation and activation
- Side panel interactions
- Real-time message delivery
- AI insight notifications

**Visual Regression Tests (Chromatic or Percy):**
- Component visual consistency
- Theme switching (light/dark)
- Responsive layouts

### Backend Testing

**Unit Tests (Jest):**
- Service methods
- Utility functions
- Data transformations
- Business logic

**Integration Tests (Supertest):**
- API endpoints
- Database operations
- Redis caching
- Queue job processing

**E2E Tests:**
- Complete API flows
- WebSocket events
- AI insight generation pipeline
- Notification delivery

**Load Tests (k6 or Artillery):**
- API endpoint performance under load
- WebSocket connection scaling
- Database query performance
- AI worker throughput

### AI System Testing

**Unit Tests:**
- Event detection logic
- Threshold calculations
- Prompt generation

**Integration Tests:**
- LLM API mocking
- Insight distribution
- Cost tracking

**Quality Tests:**
- LLM output validation (format, length, relevance)
- A/B testing different prompts
- User feedback analysis

### Testing Coverage Goals

- **Unit tests:** 80%+ coverage
- **Integration tests:** Critical paths covered
- **E2E tests:** All major user flows
- **Load tests:** Run before each major release

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | UI framework with type safety |
| | TailwindCSS | Utility-first styling with theme system |
| | Vite | Fast build tool optimized for extensions |
| | Zustand or Jotai | Lightweight state management |
| | Socket.IO Client | Real-time WebSocket communication |
| **Backend** | NestJS + Node.js 20+ | Scalable, modular backend framework |
| | TypeScript | Type safety across the stack |
| **Database** | MongoDB + Mongoose | Flexible document storage for chat, users |
| | Redis | Caching, sessions, rate limiting, queues |
| **Real-time** | Socket.IO | WebSocket server with room support |
| **Queue** | BullMQ | Job queue for background tasks |
| **AI** | OpenAI GPT-4 / Anthropic Claude | LLM for insight generation |
| **Auth** | JWT | Stateless authentication tokens |
| | ethers.js | Wallet signature verification |
| | Passport.js | Twitter OAuth integration |
| **Deployment** | Docker | Containerization |
| | AWS ECS / Cloud Run | Container orchestration |
| | MongoDB Atlas | Managed database |
| | Redis Cloud | Managed cache |
| **Monitoring** | Sentry | Error tracking |
| | Datadog / New Relic | APM and infrastructure monitoring |
| **Extension** | Chrome Manifest V3 | Extension platform |
| | Chrome Side Panel API | Side panel integration |

---

## Development Roadmap

### Phase 1: Foundation (Weeks 1-3)

**Week 1: Project Setup & Core Infrastructure**
- [ ] Initialize monorepo structure (frontend, backend, shared types)
- [ ] Set up development environment (Docker Compose for local dev)
- [ ] Configure MongoDB, Redis, and basic NestJS backend
- [ ] Set up Vite + React + TypeScript for Chrome extension
- [ ] Implement theme system with CSS variables
- [ ] Create base UI components (buttons, inputs, cards, layouts)
- [ ] Set up CI/CD pipeline (GitHub Actions)

**Week 2: Authentication & User Management**
- [ ] Implement JWT authentication system
- [ ] Build wallet signature verification (Polymarket)
- [ ] Integrate Twitter OAuth
- [ ] Create user registration and profile management
- [ ] Build login UI (wallet + Twitter options)
- [ ] Implement user profile page
- [ ] Set up session management with Redis

**Week 3: Chat Infrastructure**
- [ ] Set up Socket.IO server and client
- [ ] Implement chat room data models
- [ ] Build WebSocket authentication and room management
- [ ] Create global chat room
- [ ] Build chat UI components (message list, input, typing indicators)
- [ ] Implement real-time message delivery
- [ ] Add message reactions

### Phase 2: Categories & Markets (Weeks 4-5)

**Week 4: Category System**
- [ ] Create category data models and seed default categories
- [ ] Build category chat rooms
- [ ] Implement category follow/unfollow
- [ ] Create category navigation UI
- [ ] Build market sync service (Polymarket API integration)
- [ ] Create market chat rooms
- [ ] Build market list and detail views

**Week 5: Private Messaging**
- [ ] Implement DM functionality
- [ ] Build group chat creation and management
- [ ] Create chat list UI (DMs, groups, markets)
- [ ] Add participant management for groups
- [ ] Implement message search (basic)
- [ ] Add unread counts and notifications

### Phase 3: Rankings & Achievements (Weeks 6-7)

**Week 6: Reputation System**
- [ ] Design and implement reputation point system
- [ ] Build ranking calculation service
- [ ] Create leaderboard data models and snapshots
- [ ] Implement leaderboard UI (daily, weekly, monthly, all-time)
- [ ] Build user stats tracking
- [ ] Add reputation points for various actions

**Week 7: Achievements & Roles**
- [ ] Define initial achievements and roles
- [ ] Build achievement checking service
- [ ] Implement role unlock logic
- [ ] Create achievement and role UI components
- [ ] Build achievement notification system
- [ ] Add role badges to user profiles and messages

### Phase 4: AI System (Weeks 8-10)

**Week 8: AI Infrastructure**
- [ ] Set up AI service architecture
- [ ] Implement market monitoring service
- [ ] Build event detection logic with thresholds
- [ ] Create AI room data models
- [ ] Integrate OpenAI/Anthropic API
- [ ] Build insight generation service

**Week 9: AI Insights & Distribution**
- [ ] Implement AI message posting
- [ ] Build AI notification distribution
- [ ] Create AI insights UI components
- [ ] Add AI rooms to navigation
- [ ] Implement user preferences for AI notifications
- [ ] Build AI insights feed view

**Week 10: AI Optimization**
- [ ] Implement AI cost tracking and budgeting
- [ ] Add AI insight quality feedback system
- [ ] Optimize event detection thresholds
- [ ] Build AI analytics dashboard (internal)
- [ ] Add AI insight caching
- [ ] Implement cooldown and rate limiting

### Phase 5: Polish & Launch (Weeks 11-12)

**Week 11: Testing & Bug Fixes**
- [ ] Write comprehensive unit tests (80%+ coverage)
- [ ] Implement E2E tests for critical flows
- [ ] Perform load testing on backend
- [ ] Fix bugs and edge cases
- [ ] Optimize performance (API, WebSocket, database queries)
- [ ] Security audit and penetration testing

**Week 12: Launch Preparation**
- [ ] Create onboarding flow for new users
- [ ] Build help/documentation section
- [ ] Set up production infrastructure
- [ ] Configure monitoring and alerting
- [ ] Create marketing materials (screenshots, video)
- [ ] Submit extension to Chrome Web Store
- [ ] Soft launch to beta users
- [ ] Monitor metrics and gather feedback

### Post-Launch: Iteration (Week 13+)

- [ ] Gather user feedback and analytics
- [ ] Fix critical bugs and issues
- [ ] Optimize based on real-world usage patterns
- [ ] Implement quick wins from user feedback
- [ ] Plan Phase 2 features (voice channels, tournaments, etc.)

---

## Estimated Timeline

- **MVP (Phase 1-3):** 7 weeks
- **Full Launch (Phase 1-5):** 12 weeks
- **Post-Launch Stabilization:** 2-4 weeks

**Total: ~14-16 weeks (3.5-4 months) from start to stable v1.0**

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Polymarket API rate limits** | High | Medium | Cache aggressively, implement backoff, contact Polymarket for partnership |
| **LLM API costs exceed budget** | Medium | Medium | Implement strict budgets, use cheaper models, fallback to templates |
| **WebSocket scaling issues** | High | Low | Separate WS servers, use Redis pub/sub, load test early |
| **Database performance** | High | Low | Proper indexing, read replicas, query optimization |
| **Chrome extension rejection** | High | Low | Follow guidelines strictly, prepare for review feedback |
| **Security vulnerability** | High | Low | Security audit, penetration testing, bug bounty program |

### Product Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Low user adoption** | High | Medium | Marketing, partnerships with Polymarket influencers, viral features |
| **Spam and abuse** | Medium | High | Robust moderation tools, rate limiting, trust system |
| **AI insights not valuable** | Medium | Medium | User feedback loop, A/B testing, improve prompts |
| **Competition** | Medium | Medium | Move fast, build community, unique features (rankings, achievements) |
| **Polymarket changes API** | High | Low | Stay in contact, build abstraction layer, monitor API changes |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Monetization challenges** | Medium | Medium | Freemium model, premium features, partnerships |
| **Legal/regulatory issues** | High | Low | Legal review, terms of service, comply with regulations |
| **Polymarket partnership rejection** | Medium | Low | Operate independently, add value to their ecosystem |
| **Funding runway** | High | Low | Bootstrap, minimize costs, seek funding if needed |

---

## Success Metrics (First 3 Months Post-Launch)

**User Acquisition:**
- 1,000+ total users
- 100+ daily active users
- 30%+ 7-day retention

**Engagement:**
- 10,000+ messages sent
- 50+ active markets with chat
- 5+ messages per active user per day

**AI Performance:**
- 100+ AI insights generated
- 70%+ "helpful" rating on AI insights
- <$5/day LLM costs

**Technical:**
- 99.5%+ API uptime
- <500ms P95 API response time
- <5% WebSocket disconnect rate

---

## Conclusion

Grex represents a comprehensive social layer for Polymarket that transforms prediction markets from isolated trading experiences into vibrant community hubs. By combining real-time chat, AI-powered insights, gamified rankings, and seamless Chrome integration, we're creating a platform that makes market participation more engaging, informed, and social.

### Key Differentiators

1. **Chrome Side Panel Integration** — Always accessible, never intrusive
2. **AI-Powered Insights** — Smart notifications that cut through the noise
3. **Gamification** — Rankings and achievements that reward quality participation
4. **Multi-Category Organization** — Structured conversations from global to market-specific
5. **Component-Based Architecture** — Easy to maintain, extend, and theme

### Why This Will Succeed

- **Timing:** Prediction markets are growing rapidly, but lack social infrastructure
- **User Need:** Traders want to discuss markets in real-time with like-minded people
- **Network Effects:** More users → more chat activity → more value for everyone
- **AI Value:** Automated insights save users time and improve decision-making
- **Viral Potential:** Rankings and achievements encourage sharing and competition

### Next Steps

This overview provides a complete blueprint for building Grex. With a clear 12-16 week roadmap, well-defined technical architecture, and comprehensive feature set, we're ready to begin development.

**Let's build the future of social prediction markets.** 🚀

---

*Document Version: 1.0*  
*Last Updated: December 10, 2025*  
*Status: Ready for Development*
