# Testing Checklist - Frontend Features

## ✅ READY TO TEST NOW

### 1. **Chat Filtering System**
**How to test**:
- Click the 4 category buttons (Global, Market, Private, Favorites)
- Page title should change dynamically with appropriate icon
- Chat list should filter to show only chats of that type
- Try each category:
  - **Global**: Politics, Crypto, Sports
  - **Market**: BTC Price, ETH Trading, NFT Market
  - **Private**: My Group Chat, Friends, Work Team
  - **Favorites**: Sports, NFT Market (marked as favorites)

### 2. **Search Functionality**
**How to test**:
- Type in the search box above AI Feed
- Chat list filters in real-time
- Try: "pol" → should show Politics
- Try: "btc" → should show BTC Price
- Try: "xyz" → should show "No chats found"
- Search works within the active category filter

### 3. **Message Reactions System**
**How to test**:
- Open any chat (e.g., Politics)
- Click the smile icon on either message
- Reaction picker appears with 8 emojis: ❤️ 👍 😂 👎 🔥 😱 🤬 🔫
- Click an emoji to add reaction
- Reaction appears below message with count
- Click same emoji again to remove your reaction
- Click existing reaction (with count) to add your reaction to it
- Your reactions show with green highlight
- Others' reactions show in gray
- Mock data shows:
  - Message 1 (other user): 3 hearts, 5 thumbs up (you reacted with thumbs up)
  - Message 2 (your message): 2 laughs, 1 fire

### 4. **Reply to Message**
**How to test**:
- Click the reply arrow on any message
- Reply banner appears above message input
- Shows "Replying to @username" and message preview
- Click X to cancel reply
- Reply indicator shown in first message (replying to AI's welcome)
- When backend is connected, send message will include `replyToMessageId`

### 5. **Profile Features**
**How to test**:
- Click user PFP in chat → opens their profile
- Your profile: TITAN rank (cyan border)
- Other user profile: LEGEND+ rank (purple border with accent)
- Click "Add Friend" → button dims, "Friend Request Sent!" appears at bottom
- Click "Block" → confirmation modal appears
- Confirm or cancel block action

### 6. **Create Chat/Group Chat**
**How to test**:
- Click "New Chat" button on chats list
- Modal opens with friend list
- Click friends to select (card highlights green)
- Select 1 friend: Button says "Create Chat", no group name needed
- Select 2+ friends: "Group Name" input appears, button says "Create Group"
- Click "Clear" to deselect all
- Horizontal separators between unselected friends
- Search friends in real-time

### 7. **Rank System**
**How to test**:
- Navigate to Leaderboard (trophy icon)
- Switch between Leaderboard and Ranks tabs
- Page title changes dynamically
- Ranks tab shows all user ranks (Recruit → Legend+)
- Each rank has proper colored border and accent (for + ranks)
- Staff ranks removed from Ranks tab
- Leaderboard shows mixed ranks with accents

### 8. **Settings Page**
**How to test**:
- Open profile dropdown → Settings
- Toggle switches work
- All sections have neumorphic shadows
- Background matches page background
- Gradient borders on all cards

---

## 🚀 ADDITIONAL FEATURES TO COMPLETE BEFORE BACKEND

### High Priority (Recommended)

#### 1. **Message Status Indicators**
- Pending (sending...)
- Sent (single checkmark)
- Delivered (double checkmark)
- Failed (red X with retry button)

#### 2. **Empty States**
- No chats in category
- No friends
- No search results
- No messages in new chat

#### 3. **Loading States**
- Chat list loading skeleton
- Message history loading
- Profile loading
- Leaderboard loading

#### 4. **Error Handling**
- Network error messages
- Failed to load chats
- Failed to send message
- Failed to load profile

#### 5. **Message Input Enhancements**
- Send on Enter (Shift+Enter for new line)
- Character limit indicator
- Disable send when empty
- Clear input after send
- Show "typing..." when replying

#### 6. **Favorite Toggle**
- Star button on chat cards should toggle favorite
- Update filteredChats when favorite changes
- Visual feedback on toggle

#### 7. **Notification Toggle**
- Bell button on chat cards should toggle notifications
- Visual state change (filled vs outline)
- Persist preference

#### 8. **Group Members Modal Enhancement**
- Show member ranks
- Online status indicators
- Click member to view profile
- Admin actions (if you're admin)

#### 9. **Chat Card Last Message**
- Show actual last message preview
- Timestamp of last message
- "You: " prefix for your messages
- Truncate long messages

#### 10. **Unread Message Counts**
- Badge on chat cards
- Badge on category buttons
- Clear on open chat
- Persist across sessions

---

### Medium Priority

#### 11. **Profile Enhancements**
- Edit bio functionality
- Edit username functionality
- Change PFP functionality
- View full friend list (pagination)

#### 12. **Message Actions Menu**
- Copy message
- Edit message (own messages only)
- Delete message (own messages only)
- Report message

#### 13. **Keyboard Navigation**
- Tab through buttons
- Enter to send message
- Escape to close modals
- Arrow keys in chat history

#### 14. **Accessibility**
- ARIA labels
- Screen reader support
- Focus indicators
- Semantic HTML

#### 15. **Animations**
- Message send animation
- Reaction pop animation
- Modal fade in/out
- Smooth scrolling

---

### Low Priority (Nice to Have)

#### 16. **Image/File Upload**
- Image preview before send
- File attachments
- Drag and drop
- Upload progress bar

#### 17. **Emoji Picker for Input**
- Full emoji selector
- Recent emojis
- Search emojis
- Emoji shortcodes (:smile:)

#### 18. **@Mentions**
- Autocomplete on @
- Highlight mentions
- Click to view profile

#### 19. **Link Previews**
- Detect URLs
- Show preview card
- Open in new tab

#### 20. **Message Timestamps**
- Relative time (2m ago, 1h ago)
- Full timestamp on hover
- Date separators

---

## 🎯 RECOMMENDED COMPLETION ORDER

### Phase 1 (This Session - If Time):
1. ✅ Chat filtering
2. ✅ Search
3. ✅ Reactions
4. ✅ Reply UI
5. ⏳ Message status indicators
6. ⏳ Empty states
7. ⏳ Favorite toggle
8. ⏳ Notification toggle

### Phase 2 (Before Backend):
1. Loading states
2. Error handling
3. Message input enhancements
4. Chat card last message
5. Unread counts

### Phase 3 (Nice to Have):
1. Profile edit functionality
2. Message actions menu
3. Animations
4. Accessibility

### Phase 4 (Post-Backend):
1. Image/file upload
2. Full emoji picker
3. @Mentions
4. Link previews
5. Real-time typing indicators

---

## 🔌 BACKEND INTEGRATION POINTS

When connecting to backend, you'll need to:

### API Endpoints
```typescript
// Chats
GET /api/chats?category=global&search=politics
GET /api/chats/:chatId/messages?limit=50&before=messageId

// Messages
POST /api/messages { chatId, text, replyToId }
POST /api/messages/:messageId/reactions { emoji }
DELETE /api/messages/:messageId/reactions/:emoji

// Friends
POST /api/friends/requests { userId }
POST /api/friends/requests/:requestId/accept
POST /api/friends/requests/:requestId/decline
GET /api/friends
GET /api/friends/requests

// User
GET /api/users/:userId
PATCH /api/users/me { username, bio, avatarUrl }
POST /api/users/:userId/block
```

### WebSocket Events
```typescript
// Subscribe to
'message.new' - New message in chat
'message.reaction' - Reaction added/removed
'user.typing' - User is typing
'user.online' - User online status
'friend.request' - New friend request
'chat.update' - Chat metadata changed
```

### State Management
Replace mock data with:
```typescript
// Instead of mockChats
const { data: chats } = useQuery(['chats', activeChatCategory], 
  () => api.getChats(activeChatCategory)
);

// Instead of mock reactions
const { mutate: addReaction } = useMutation(
  ({ messageId, emoji }) => api.addReaction(messageId, emoji),
  {
    onSuccess: () => queryClient.invalidateQueries(['messages'])
  }
);
```

---

## 📝 NOTES

- All UI is complete and styled
- All interactions work with local state
- Mock data is clearly marked with comments
- Easy to find and replace when connecting backend
- All features follow neumorphic design system
- Responsive and works on mobile sizes

