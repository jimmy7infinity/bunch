# Pagination Strategy & Implementation

Comprehensive documentation of pagination across the Bunch application ecosystem.

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Admin Dashboard](#admin-dashboard)
3. [Main Application (Extension)](#main-application)
4. [Backend API Support](#backend-api-support)
5. [Implementation Patterns](#implementation-patterns)
6. [Future Considerations](#future-considerations)

---

## Overview

**Why Pagination?**
- Performance: Loading thousands of records at once causes lag and crashes
- User Experience: Smooth, progressive loading feels more responsive
- Scalability: Future-proofs for growth (thousands of users, messages, media)
- Bandwidth: Reduces initial load time and data transfer

**Our Approach:**
- **Infinite Scroll**: Used for most lists (messages, media, users)
- **Load More Button**: Used where explicit user action is preferred
- **Page Size**: Typically 50 items per page for optimal balance
- **Loading States**: Clear indicators during fetch operations

---

## Admin Dashboard

### ✅ **Implemented**

#### 1. Messages Page (`admin/app/(dashboard)/messages/page.tsx`)
- **Type**: Infinite scroll
- **Page Size**: 50 messages
- **Features**:
  - IntersectionObserver for automatic loading
  - Loading spinner during fetch
  - "No more messages" indicator
  - Filters don't break pagination
  - Context view (5 before + current + 5 after)
  
```tsx
// Key Implementation
const PAGE_SIZE = 50;
const [hasMore, setHasMore] = useState(true);
const [loadingMore, setLoadingMore] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMessages(false);
      }
    },
    { threshold: 0.1 }
  );
  // ...
}, [hasMore, loadingMore]);
```

#### 2. Media Page (`admin/app/(dashboard)/media/page.tsx`)
- **Type**: Infinite scroll
- **Page Size**: 50 media items
- **Features**:
  - Thumbnail preview grid
  - Context view with surrounding messages
  - Scroll-based loading
  - Loading indicators

#### 3. Chatrooms Page (`admin/app/(dashboard)/chatrooms/page.tsx`)
- **Type**: Infinite scroll (from top)
- **Page Size**: 50 messages
- **Features**:
  - Load older messages by scrolling up
  - New messages load at bottom (instant scroll)
  - Admin action buttons (ban, mute, delete)
  - Clickable usernames → User Details
  - Emoji reactions
  - Message deletion

**Special Implementation:**
- Loads from **top** (older messages) instead of bottom
- Prepends messages to array to maintain scroll position
- No visible scroll animation on initial load

```tsx
// Prepend older messages
if (reset) {
  setMessages(newMessages);
  // Scroll to bottom instantly
  setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, 0);
} else {
  // Prepend older messages at top
  setMessages(prev => [...newMessages, ...prev]);
}
```

#### 4. Users Page (`admin/app/(dashboard)/users/page.tsx`)
- **Current**: Limited to 100 results per search
- **Status**: ⚠️ **Needs Improvement**
- **Recommendation**: Add infinite scroll or pagination buttons

---

### 🚧 **Needs Implementation**

#### Admin Users Page
**Priority**: Medium
**Reasoning**: As user base grows, searching/viewing all users will be slow

**Recommended Implementation**:
```tsx
// Option 1: Infinite Scroll
- Load 50 users at a time
- IntersectionObserver at list bottom
- Append new users on scroll

// Option 2: Traditional Pagination
- Buttons: Previous / Next
- Page selector: 1, 2, 3...
- Better for admin workflows where users jump between pages
```

---

## Main Application (Extension)

### 🚧 **Needs Implementation**

#### 1. Group Members Modal (`frontend/src/components/chat/GroupMembersModal.tsx`)
**Priority**: High
**Current**: Loads ALL members at once
**Issue**: Will crash with 1,000+ member rooms

**Recommended Implementation**:
```tsx
// Infinite scroll within modal
const [members, setMembers] = useState<any[]>([]);
const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMembers = async (reset = false) => {
  const newMembers = await roomService.getRoomMembers(
    conversationId, 
    { offset: reset ? 0 : page * 50, limit: 50 }
  );
  
  if (reset) {
    setMembers(newMembers);
    setPage(0);
  } else {
    setMembers(prev => [...prev, ...newMembers]);
  }
  
  setHasMore(newMembers.length === 50);
  if (!reset) setPage(p => p + 1);
};

// IntersectionObserver in modal scroll container
```

**Alternative**: Load More Button
```tsx
<button onClick={() => loadMembers(false)} disabled={loading}>
  {loading ? 'Loading...' : `Load More (${members.length} / ${totalCount})`}
</button>
```

#### 2. Friends List (`frontend/src/components/profile/UserProfile.tsx`)
**Priority**: Medium
**Current**: Loads ALL friends at once
**Issue**: Users with 500+ friends will see lag

**Location**: Line ~120-140 in `UserProfile.tsx`

**Recommended Implementation**:
```tsx
// Friends section with pagination
const [friendsPage, setFriendsPage] = useState(0);
const [hasMoreFriends, setHasMoreFriends] = useState(true);

const loadMoreFriends = async () => {
  const newFriends = await friendService.getFriends(userId, {
    offset: friendsPage * 30,
    limit: 30
  });
  
  setFriends(prev => [...prev, ...newFriends]);
  setHasMoreFriends(newFriends.length === 30);
  setFriendsPage(p => p + 1);
};

// UI: Show first 30, "Show More" button
```

#### 3. Friend Requests List
**Priority**: Low (most users have < 50 pending)
**Current**: Loads all requests
**Future**: Add pagination if request spam becomes an issue

---

## Backend API Support

### ✅ **Implemented**

#### Messages Endpoint
```typescript
GET /admin/messages?limit=50&before=2024-01-01T00:00:00Z
```
- Supports `before` cursor for pagination
- Returns messages older than cursor
- Used by Messages Page

#### Media Endpoint
```typescript
GET /admin/media?limit=50
```
- Basic limit support
- Could add `before` cursor for true pagination

#### Conversations Messages Endpoint
```typescript
GET /conversations/:id/messages?limit=50&before=2024-01-01T00:00:00Z
```
- Supports pagination with cursor
- Used by Chatrooms Page

### 🚧 **Needs Implementation**

#### Room Members Endpoint
```typescript
// Current
GET /conversations/:id/members
// Returns ALL members (no pagination)

// Recommended
GET /conversations/:id/members?offset=0&limit=50
// Returns paginated members
```

**Backend Implementation**:
```typescript
async getRoomMembers(conversationId: string, offset = 0, limit = 50) {
  const members = await this.participantModel
    .find({ conversation_id: conversationId })
    .sort({ joined_at: -1 })
    .skip(offset)
    .limit(limit)
    .populate('user_id')
    .exec();

  const totalCount = await this.participantModel
    .countDocuments({ conversation_id: conversationId });

  return {
    members,
    hasMore: offset + members.length < totalCount,
    totalCount
  };
}
```

#### Friends Endpoint
```typescript
// Current
GET /friends/:userId
// Returns ALL friends

// Recommended
GET /friends/:userId?offset=0&limit=30
// Returns paginated friends
```

---

## Implementation Patterns

### Pattern 1: Infinite Scroll (Recommended for Most Cases)

**When to Use:**
- Long lists (messages, media, users)
- Mobile/extension interfaces
- Continuous browsing experiences

**Implementation**:
```tsx
const [items, setItems] = useState([]);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
const observerTarget = useRef(null);

useEffect(() => {
  if (!observerTarget.current || !hasMore) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(observerTarget.current);
  return () => observer.disconnect();
}, [hasMore, loading, items.length]);

const loadMore = async () => {
  setLoading(true);
  const oldestItem = items[items.length - 1];
  const newItems = await api.getItems({
    limit: 50,
    before: oldestItem?.created_at
  });
  
  setItems(prev => [...prev, ...newItems]);
  setHasMore(newItems.length === 50);
  setLoading(false);
};

// Render
<div className="list">
  {items.map(item => <Item key={item.id} {...item} />)}
  
  {hasMore && (
    <div ref={observerTarget}>
      {loading && <Spinner />}
    </div>
  )}
  
  {!hasMore && <div>No more items</div>}
</div>
```

### Pattern 2: Load More Button

**When to Use:**
- Admin interfaces where explicit control is preferred
- Short lists that rarely exceed 1 page
- Data that updates frequently

**Implementation**:
```tsx
const [items, setItems] = useState([]);
const [page, setPage] = useState(0);
const [loading, setLoading] = useState(false);

const loadMore = async () => {
  setLoading(true);
  const newItems = await api.getItems({
    offset: page * 50,
    limit: 50
  });
  
  setItems(prev => [...prev, ...newItems]);
  setPage(p => p + 1);
  setLoading(false);
};

// Render
<button onClick={loadMore} disabled={loading}>
  {loading ? 'Loading...' : 'Load More'}
</button>
```

### Pattern 3: Traditional Pagination

**When to Use:**
- Admin dashboards
- Search results
- Tables with many columns

**Implementation**:
```tsx
const [items, setItems] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(0);

const loadPage = async (page: number) => {
  const data = await api.getItems({
    page,
    limit: 50
  });
  
  setItems(data.items);
  setTotalPages(data.totalPages);
  setCurrentPage(page);
};

// Render
<div>
  <button onClick={() => loadPage(currentPage - 1)} disabled={currentPage === 1}>
    Previous
  </button>
  <span>Page {currentPage} of {totalPages}</span>
  <button onClick={() => loadPage(currentPage + 1)} disabled={currentPage === totalPages}>
    Next
  </button>
</div>
```

---

## Future Considerations

### Performance Optimization

**Virtual Scrolling**
- For lists with thousands of items visible at once
- Only render items in viewport
- Libraries: `react-window`, `react-virtualized`

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={10000}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>Item {index}</div>
  )}
</FixedSizeList>
```

**Database Indexing**
- Ensure `created_at` is indexed for cursor pagination
- Index `conversation_id` for message queries
- Composite indexes for complex filters

```javascript
// MongoDB indexes
db.messages.createIndex({ created_at: -1 });
db.messages.createIndex({ conversation_id: 1, created_at: -1 });
db.participants.createIndex({ conversation_id: 1, joined_at: -1 });
```

**Caching Strategy**
- Cache first page of results
- Invalidate on mutations
- Use React Query or SWR for automatic cache management

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['messages', conversationId],
  queryFn: ({ pageParam = 0 }) => api.getMessages(conversationId, pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  staleTime: 30000, // Cache for 30 seconds
});
```

### User Experience

**Skeleton Loading**
- Show placeholder content while loading
- Better than spinners for perceived performance

**Optimistic Updates**
- Add new items immediately
- Rollback on error
- Smooth UX for actions like sending messages

**Scroll Position Restoration**
- Remember scroll position when navigating back
- Restore on return to list

---

## Summary

### ✅ **Pagination Complete**
1. Admin Messages Page - Infinite scroll, 50/page
2. Admin Media Page - Infinite scroll, 50/page
3. Admin Chatrooms Page - Infinite scroll from top, 50/page

### 🚧 **Pagination Needed**
1. **High Priority**:
   - Group Members Modal (extension) - Infinite scroll or Load More
   
2. **Medium Priority**:
   - Friends List (extension) - Load More button
   - Admin Users Page - Infinite scroll or traditional pagination

3. **Low Priority**:
   - Friend Requests - Only if spam becomes an issue

### 📋 **Backend API Updates Needed**
1. Room Members endpoint - Add offset/limit parameters
2. Friends endpoint - Add offset/limit parameters
3. Friend Requests endpoint - Add offset/limit parameters

### 🎯 **Recommendations**
- **Start with Group Members Modal** - Highest impact, most likely to cause issues
- **Implement backend pagination** for members and friends first
- **Use infinite scroll** for main app (mobile-friendly)
- **Use traditional pagination** for admin tables/search results
- **Monitor performance** and add indexes as needed

---

**Last Updated**: 2026-02-03  
**Version**: 1.0
