# Modular Context Detection & Auto-Join System

## Overview
This document describes the modular, clean architecture implemented for detecting Polymarket contexts (markets and categories) and automatically joining relevant chats.

## Architecture

### 1. **Content Script (`content-script.js`)**
**Purpose**: Detect current Polymarket page context and send to extension

**Features**:
- Detects market pages (e.g., `/event/trump-wins-2024`)
- Detects category pages (e.g., `/geopolitics`, `/sports`)
- Sends structured context to service worker
- Watches for SPA navigation changes

**Context Types**:
```javascript
// Market Context
{
  type: 'market',
  marketId: 'trump-wins-2024',
  marketTitle: 'Will Trump win 2024?',
  url: 'https://polymarket.com/event/...'
}

// Category Context
{
  type: 'category',
  category: 'geopolitics',
  chatName: 'Geopolitics',
  url: 'https://polymarket.com/geopolitics'
}
```

### 2. **Category Mapping Utility (`utils/categoryMapping.ts`)**
**Purpose**: Map Polymarket category URLs to global chat names

**Supported Categories**:
- Politics
- Sports
- Crypto
- Finance
- Geopolitics
- Earnings
- Tech
- Culture
- World
- Economy
- Climate & Science
- Elections

**Key Functions**:
- `extractCategoryFromUrl(url)` - Parse category from URL
- `isCategoryPage(url)` - Check if URL is a category page
- `getAvailableCategories()` - Get list of all categories

### 3. **Service Worker (`service-worker.js`)**
**Purpose**: Relay context between content script and side panel

**Features**:
- Stores current context in memory and `chrome.storage`
- Relays context to side panel via `chrome.runtime.onConnect`
- Handles both market and category contexts
- Persists context across page navigations

### 4. **Market Detection Service (`services/marketDetection.ts`)**
**Purpose**: Bridge between service worker and React app

**Features**:
- Connects to service worker via `chrome.runtime.connect`
- Listens for context updates
- Updates Zustand store
- Watches `chrome.storage` for persistence

### 5. **Chat Store (`stores/chatStore.ts`)**
**Purpose**: Central state management for contexts

**Enhanced MarketContext**:
```typescript
interface MarketContext {
  contextType: 'market' | 'category';
  // Market fields
  marketId?: string;
  marketTitle?: string;
  // Category fields
  category?: string;
  chatName?: string;
  // Common
  url?: string;
  timestamp?: number;
}
```

### 6. **Auto-Join Hook (`hooks/useAutoJoinChat.ts`)**
**Purpose**: Encapsulate auto-join logic (modular, reusable)

**Features**:
- Watches for context changes
- Respects user's auto-join setting
- Handles both market and category chats
- Returns CTA state for manual join
- Callback when chat is joined

**Usage**:
```typescript
const { shouldShowCTA, joinChat, currentContext } = useAutoJoinChat((chat) => {
  // Handle chat joined
  setSelectedChat(chat);
});
```

### 7. **Join Chat Banner (`components/chat/JoinChatBanner.tsx`)**
**Purpose**: Clean, reusable UI component for manual join prompts

**Features**:
- Shows when auto-join is OFF and context detected
- Different icons for markets vs categories
- Loading state support
- Hover effects
- Fully styled, self-contained

**Usage**:
```tsx
<JoinChatBanner
  contextType="market"
  title="Will Trump win 2024?"
  onJoin={handleJoin}
  loading={isJoining}
/>
```

### 8. **ChatsList Integration**
**Clean Integration**:
- Removed old monolithic auto-join `useEffect`
- Uses `useAutoJoinChat` hook
- Renders `JoinChatBanner` when needed
- All logic modular and testable

## User Flow

### Auto-Join Enabled (Default)
1. User browses to `/geopolitics` on Polymarket
2. Content script detects category context
3. Service worker relays to side panel
4. `useAutoJoinChat` hook detects context
5. Hook automatically calls `joinChat()`
6. User is switched to "Geopolitics" global chat
7. Side panel shows chat room

### Auto-Join Disabled
1. User browses to `/event/trump-wins-2024`
2. Content script detects market context
3. Service worker relays to side panel
4. `useAutoJoinChat` hook detects context
5. Hook sets `shouldShowCTA = true`
6. `JoinChatBanner` appears in chat list
7. User clicks "Join: Will Trump win 2024?"
8. User is switched to market-specific chat

## Benefits

### Modularity
- Each component has single responsibility
- Easy to test individual pieces
- Logic separated from UI

### Maintainability
- Clear file structure
- Well-documented interfaces
- Type-safe with TypeScript

### Extensibility
- Easy to add new categories (just update `CATEGORY_MAP`)
- Easy to add new context types (e.g., users, events)
- Hook can be reused in other components

### User Experience
- Seamless auto-join for engaged users
- Clean manual prompt for those who prefer control
- Context-aware routing (no more generic "Chat" rooms)
- Fast context detection with SPA support

## Files Created/Modified

### Created
- `frontend/src/utils/categoryMapping.ts`
- `frontend/src/hooks/useAutoJoinChat.ts`
- `frontend/src/components/chat/JoinChatBanner.tsx`

### Modified
- `frontend/public/content-script.js` - Enhanced detection
- `frontend/public/service-worker.js` - Context relaying
- `frontend/src/services/marketDetection.ts` - Category support
- `frontend/src/stores/chatStore.ts` - Enhanced interface
- `frontend/src/components/chat/ChatsList.tsx` - Modular integration
- `frontend/src/components/profile/Settings.tsx` - Fixed toggle bug
- `backend/src/modules/users/users.controller.ts` - Added settings to updateMe

## Testing Checklist

- [ ] Visit `/geopolitics` -> Should join Geopolitics global chat
- [ ] Visit `/sports` -> Should join Sports global chat
- [ ] Visit `/event/some-market` -> Should join market-specific chat
- [ ] Toggle auto-join OFF -> Should show banner instead of auto-joining
- [ ] Click banner -> Should join chat manually
- [ ] Toggle auto-join back ON -> Should preserve Polymarket connection & avatar
- [ ] Navigate between pages -> Context should update correctly
- [ ] Refresh extension -> Context should persist via `chrome.storage`

## Future Enhancements

- Add "recently visited" context memory
- Support for user profile pages (e.g., `/profile/username`)
- Support for search results pages
- Analytics on most popular contexts
- A/B test auto-join vs manual join conversion rates
