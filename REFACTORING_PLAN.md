# ChatRoom.tsx Refactoring Plan

## Current State
`ChatRoom.tsx` is **2314 lines** - far too large. It contains multiple concerns mixed together.

## Completed Extractions ✓
1. ✅ **PositionPicker** - Market position selection (standalone component)
2. ✅ **ChatRoomHeader** - Top navigation bar with search/bell/star
3. ✅ **ChatBoxHeader** - Chat window header with user count

## Recommended Next Steps

### Phase 1: Extract Remaining UI Components
Create these new components:

#### 1. **MessageInput.tsx** (~300 lines)
- Message input textarea
- Media/GIF buttons and menus
- @mention picker
- Reply preview
- Send button
- Image upload logic

**Props:**
```typescript
{
  conversationId: string;
  replyingTo: { messageId: string; username: string; preview: string } | null;
  onReplyCancel: () => void;
  onSendMessage: (text: string, replyTo?: string, gifUrl?: string, imageUrl?: string) => void;
  participants: any[];
}
```

#### 2. **MessageItem.tsx** (~400 lines)
- Individual message bubble
- Username, timestamp, PFP
- Reply preview rendering
- Image/GIF display
- Reactions display
- Message menu (reply/react/delete)
- Whale + position emojis for market chats

**Props:**
```typescript
{
  message: Message;
  isOwnMessage: boolean;
  conversation: ChatRoomType;
  marketPositions?: Record<string, 'yes' | 'no'>;
  whales?: Record<string, boolean>;
  highlightedMessageId?: string;
  showMessageMenu?: boolean;
  onUserClick?: (userId: string) => void;
  onReply: (messageId: string, username: string, preview: string) => void;
  onReact: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onMessageMenuToggle: (messageId: string | null) => void;
  onScrollToMessage: (messageId: string) => void;
}
```

#### 3. **MessageList.tsx** (~200 lines)
- Messages container
- Loading state
- Empty state
- Scrolling logic
- Message refs management

**Props:**
```typescript
{
  messages: Message[];
  conversation: ChatRoomType;
  isLoading: boolean;
  marketPositions?: Record<string, 'yes' | 'no'>;
  whales?: Record<string, boolean>;
  chatWindowRef: React.RefObject<HTMLDivElement>;
  messageRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  highlightedMessageId?: string;
  onUserClick?: (userId: string) => void;
  onReply: (messageId: string, username: string, preview: string) => void;
  ... (all MessageItem handlers)
}
```

#### 4. **ReactionPicker.tsx** (~100 lines)
- Emoji reaction picker UI
- Position and visibility logic
- Click outside handling

**Props:**
```typescript
{
  messageId: string;
  onSelect: (messageId: string, emoji: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}
```

#### 5. **MentionPicker.tsx** (~100 lines)
- @mention autocomplete dropdown
- Participant filtering
- Keyboard navigation

**Props:**
```typescript
{
  participants: any[];
  searchQuery: string;
  onSelect: (username: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}
```

### Phase 2: Extract Business Logic (Custom Hooks)

Create **`hooks/useChatRoom.ts`** to contain:
- Message loading (`loadMessages`)
- Message sending (`handleSendMessage`)
- Reactions (`handleAddReaction`)
- Favorites/notifications toggles
- WebSocket message handling
- Participant loading

Create **`hooks/useMarketData.ts`** for:
- Loading market positions
- Loading whale data
- Position updates

### Phase 3: Refactored ChatRoom.tsx Structure

After extraction, `ChatRoom.tsx` should be **~300-400 lines**:

```typescript
export const ChatRoom = ({ conversation, onBack, onUserClick }: ChatRoomProps) => {
  // Custom hooks for business logic
  const {
    messages,
    isLoading,
    participants,
    handleSendMessage,
    handleReaction,
    // ... other handlers
  } = useChatRoom(conversation._id);
  
  const {
    myPosition,
    marketPositions,
    whales,
    handlePositionChange,
  } = useMarketData(conversation);

  // UI state (search, modals, etc.)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  // ...

  return (
    <div className="chat-room">
      <ChatRoomHeader
        conversation={conversation}
        onBack={onBack}
        isSearchOpen={isSearchOpen}
        onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
        // ... other props
      />

      <ChatBoxHeader
        conversation={conversation}
        onlineCount={conversation.participant_count || 0}
        myPosition={myPosition}
        onPositionChange={handlePositionChange}
        onMembersClick={() => setIsMembersModalOpen(true)}
      />

      <MessageList
        messages={messages}
        conversation={conversation}
        isLoading={isLoading}
        marketPositions={marketPositions}
        whales={whales}
        // ... handlers
      />

      <MessageInput
        conversationId={conversation._id}
        participants={participants}
        onSendMessage={handleSendMessage}
        // ... other props
      />

      {/* Modals */}
      <GroupMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        // ...
      />
    </div>
  );
};
```

## Benefits
1. **Maintainability**: Each component has a single responsibility
2. **Testability**: Components can be tested in isolation
3. **Reusability**: Components like MessageItem can be reused
4. **Performance**: Can memoize components independently
5. **Readability**: Much easier to understand and modify

## Implementation Order
1. ✅ PositionPicker (done)
2. ✅ ChatRoomHeader (done)
3. ✅ ChatBoxHeader (done)
4. → MessageInput (next)
5. → ReactionPicker
6. → MentionPicker
7. → MessageItem
8. → MessageList
9. → Extract business logic to custom hooks
10. → Refactor main ChatRoom.tsx to compose components

## Next Immediate Step
Create **MessageInput.tsx** to extract the ~300 lines of input-related code from ChatRoom.
