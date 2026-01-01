import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { websocketService } from '../../services/websocket';
import { messageService } from '../../services/api';
import { GroupMembersModal } from './GroupMembersModal';
import { RankedPFP } from '../common/RankedPFP';
import type { ChatRoom as ChatRoomType } from '../../types';
import './ChatRoom.css';

interface ChatRoomProps {
  conversation: ChatRoomType;
  onBack?: () => void;
  onUserClick?: (userId: string) => void;
}

export const ChatRoom = ({ 
  conversation,
  onBack,
  onUserClick,
}: ChatRoomProps) => {
  const { user, token } = useAuthStore();
  const { messages: storeMessages, addMessage, setMessages: setStoreMessages, connectionStatus } = useChatStore();
  const [message, setMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(conversation.is_favorite || false);
  const [hasNotifications, setHasNotifications] = useState(conversation.has_notifications || false);
  const [hasAINotifications, setHasAINotifications] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const chatName = conversation.title || conversation.name || 'Chat';
  const chatType = conversation.type;
  const onlineCount = conversation.participant_count || 0;
  
  // Use actual message count instead of isEmpty prop
  const isEmpty = !isLoadingMessages && storeMessages.length === 0;
  
  console.log('ChatRoom DEBUG:', { 
    conversationId: conversation._id, 
    messageCount: storeMessages.length,
    isEmpty, 
    isLoadingMessages 
  });
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ messageId: string; username: string; preview: string } | null>(null);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const mentionPickerRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [messageStatus, setMessageStatus] = useState<'pending' | 'sent' | 'delivered' | 'failed'>('delivered');
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  
  // Get search results with context
  const searchResults = searchQuery.trim() 
    ? storeMessages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  
  // Scroll to a specific message
  const scrollToMessage = (messageId: string) => {
    const messageEl = messageRefs.current[messageId];
    if (messageEl) {
      messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };
  
  // Load messages and connect to WebSocket
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const response = await messageService.getMessages(conversation._id, 50);
        setStoreMessages(response.data || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    // Connect to WebSocket
    if (token && !websocketService.isConnected()) {
      websocketService.connect(token);
    }

    // Join the conversation room
    websocketService.joinRoom(conversation._id);

    // Load initial messages
    loadMessages();

    // Listen for new messages
    const unsubscribeNew = websocketService.onMessageNew((message) => {
      addMessage(message);
    });

    // Listen for message updates
    const unsubscribeUpdated = websocketService.onMessageUpdated((message) => {
      const updatedMessages = storeMessages.map(m => m._id === message._id ? message : m);
      setStoreMessages(updatedMessages);
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdated();
      websocketService.leaveRoom(conversation._id);
    };
  }, [conversation._id, token, addMessage, setStoreMessages]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [storeMessages]);
  
  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showReactionPicker && reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
        setShowReactionPicker(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showReactionPicker]);
  
  // Reaction emojis
  const reactionEmojis = ['❤️', '👍', '😂', '👎', '🔥', '😱', '🤬', '🔫'];
  
  // Mock users for mentions - will be replaced with API
  const mockChatUsers = [
    { id: '1', username: 'demo_user', rank: 'LEGEND+' },
    { id: '2', username: 'alice_crypto', rank: 'CAPTAIN' },
    { id: '3', username: 'bob_trader', rank: 'HERO' },
    { id: '4', username: 'charlie_nft', rank: 'VETERAN+' },
    { id: '5', username: 'diana_eth', rank: 'CHAMPION' },
  ];
  
  const mentionableUsers = mockChatUsers;
  
  // Filter users for mention autocomplete
  const filteredMentionUsers = mockChatUsers.filter(u => 
    u.username.toLowerCase().includes(mentionSearch.toLowerCase())
  );
  
  // Handle message input change with @mention detection
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursor = e.target.selectionStart || 0;
    
    setMessage(newValue);
    setCursorPosition(newCursor);
    
    // Check if we're typing an @mention
    const textBeforeCursor = newValue.substring(0, newCursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Only show picker if @ is at start or after space, and no space after @
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if ((charBeforeAt === ' ' || lastAtIndex === 0) && !textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setShowMentionPicker(true);
        return;
      }
    }
    
    setShowMentionPicker(false);
  };
  
  // Insert mention into message
  const insertMention = (username: string) => {
    const textBeforeCursor = message.substring(0, cursorPosition);
    const textAfterCursor = message.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const newMessage = 
      textBeforeCursor.substring(0, lastAtIndex) + 
      `@${username} ` + 
      textAfterCursor;
    
    setMessage(newMessage);
    setShowMentionPicker(false);
    setMentionSearch('');
    
    // Focus back on input
    setTimeout(() => {
      if (messageInputRef.current) {
        const newCursorPos = lastAtIndex + username.length + 2;
        messageInputRef.current.focus();
        messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };
  
  // Parse message text to highlight @mentions
  const renderMessageWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            style={{
              color: '#5BC854',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              const username = part.substring(1);
              const mentionedUser = mockChatUsers.find(u => u.username === username);
              if (mentionedUser) {
                onUserClick?.(mentionedUser.id);
              }
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  // Mock reactions state - will be replaced with API
  const [reactions, setReactions] = useState<{
    [messageId: string]: {
      [emoji: string]: { count: number; userReacted: boolean }
    }
  }>({
    'msg1': {
      '❤️': { count: 3, userReacted: false },
      '👍': { count: 5, userReacted: true },
    },
    'msg2': {
      '😂': { count: 2, userReacted: false },
      '🔥': { count: 1, userReacted: false },
    }
  });

  const toggleReaction = (messageId: string, emoji: string) => {
    setReactions(prev => {
      const messageReactions = prev[messageId] || {};
      const currentReaction = messageReactions[emoji];
      
      if (currentReaction) {
        // Reaction exists
        if (currentReaction.userReacted) {
          // Remove user's reaction
          const newCount = currentReaction.count - 1;
          if (newCount === 0) {
            // Remove emoji entirely
            const { [emoji]: removed, ...rest } = messageReactions;
            return { ...prev, [messageId]: rest };
          } else {
            return {
              ...prev,
              [messageId]: {
                ...messageReactions,
                [emoji]: { count: newCount, userReacted: false }
              }
            };
          }
        } else {
          // Add user's reaction
          return {
            ...prev,
            [messageId]: {
              ...messageReactions,
              [emoji]: { count: currentReaction.count + 1, userReacted: true }
            }
          };
        }
      } else {
        // New reaction
        return {
          ...prev,
          [messageId]: {
            ...messageReactions,
            [emoji]: { count: 1, userReacted: true }
          }
        };
      }
    });
    setShowReactionPicker(null);
  };

  // Mock members data - will be replaced with actual API call
  const mockMembers = [
    { id: '1', username: 'user_one', pfp: '👤', rank: 'Gold', isOnline: true },
    { id: '2', username: 'user_two', pfp: '👤', rank: 'Silver', isOnline: true },
    { id: '3', username: 'user_three', pfp: '👤', rank: 'Bronze', isOnline: false },
    { id: '4', username: 'user_four', pfp: '👤', rank: 'Gold', isOnline: true },
    { id: '5', username: 'user_five', pfp: '👤', rank: 'Silver', isOnline: false },
  ];

  const getChatTypeIcon = () => {
    switch (chatType) {
      case 'global':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        );
      case 'market':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        );
      case 'dm':
      case 'group':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        );
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#19191A' 
    }}>
      {/* TOP BAR / NAV */}
      <div 
        className="chatroom-topbar"
        style={{
          height: '75px',
          backgroundColor: '#19191A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0 20px',
        }}
      >
        {/* Left: Back + Search Buttons */}
        <div 
          style={{
            position: 'absolute',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* Back Button */}
          <button
            onClick={onBack}
            className="nav-icon-button"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>

          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="nav-icon-button"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: isSearchOpen 
                ? 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #5BC854, #082724)'
                : 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isSearchOpen ? "#5BC854" : "#BAB9B9"} strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        {/* Search Input - Slides in when search is active */}
        {isSearchOpen && (
          <div style={{
            position: 'absolute',
            top: '75px',
            left: 0,
            right: 0,
            backgroundColor: '#19191A',
            padding: '10px 20px',
            borderBottom: '1px solid #333333',
            zIndex: 10,
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#242424',
              borderRadius: '20px',
              padding: '8px 15px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                autoFocus
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#CBCBCB',
                  fontSize: '13px',
                  fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              />
              {/* Close button - always visible */}
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            {/* Search Results */}
            {searchQuery && (
              <div style={{ marginTop: '10px' }}>
                <div style={{
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '11px',
                  color: '#707070',
                  marginBottom: '8px',
                }}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </div>
                
                {searchResults.map((result: any) => {
                  const queryLower = searchQuery.toLowerCase();
                  const textLower = result.text.toLowerCase();
                  const matchIndex = textLower.indexOf(queryLower);
                  const contextStart = Math.max(0, matchIndex - 20);
                  const contextEnd = Math.min(result.text.length, matchIndex + searchQuery.length + 30);
                  const contextText = (contextStart > 0 ? '...' : '') + 
                    result.text.slice(contextStart, contextEnd) + 
                    (contextEnd < result.text.length ? '...' : '');
                  
                  return (
                    <button
                      key={result.id}
                      onClick={() => scrollToMessage(result.id)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: '#242424',
                        border: '1px solid #333333',
                        borderRadius: '10px',
                        marginBottom: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'block',
                      }}
                    >
                      <div style={{
                        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '11px',
                        color: result.sender === 'ai' ? '#60F6AB' : '#909090',
                        marginBottom: '4px',
                      }}>
                        {result.username} • {result.time}
                      </div>
                      <div style={{
                        fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '12px',
                        color: '#CBCBCB',
                      }}>
                        {contextText.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) => 
                          part.toLowerCase() === queryLower 
                            ? <span key={i} style={{ backgroundColor: '#5BC854', color: '#19191A', borderRadius: '2px', padding: '0 2px' }}>{part}</span>
                            : part
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Center: Chat Name */}
        <h1 
          style={{
            fontSize: '15px',
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '400',
          }}
        >
          {chatName}
        </h1>

        {/* Right: Bell + Star Buttons */}
        <div 
          style={{
            position: 'absolute',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* Push Notifications Bell Button - Blue when active */}
          <button
            onClick={() => setHasNotifications(!hasNotifications)}
            className="nav-icon-button"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {hasNotifications ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="url(#bellGradientBlue)">
                <defs>
                  <linearGradient id="bellGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="url(#bellGradientBlue)" fill="none" strokeWidth="2"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#bellGradientOff)" strokeWidth="2">
                <defs>
                  <linearGradient id="bellGradientOff" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#B3B3B3" />
                    <stop offset="100%" stopColor="#888888" />
                  </linearGradient>
                </defs>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            )}
          </button>

          {/* AI Feed Button - Only for global/market chats - Green when active */}
          {(chatType === 'global' || chatType === 'market') && (
            <button
              onClick={() => setHasAINotifications(!hasAINotifications)}
              className="nav-icon-button"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {hasAINotifications ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="url(#aiGradientOn)" stroke="none">
                  <defs>
                    <linearGradient id="aiGradientOn" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60F6AB" />
                      <stop offset="100%" stopColor="#0D7A3F" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#aiGradientOff)" strokeWidth="2">
                  <defs>
                    <linearGradient id="aiGradientOff" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#B3B3B3" />
                      <stop offset="100%" stopColor="#888888" />
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2v10l4 2"/>
                  <path d="M4.93 4.93l4.24 4.24"/>
                  <path d="M14.83 9.17l4.24-4.24"/>
                </svg>
              )}
            </button>
          )}

          {/* Star Button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="nav-icon-button"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "url(#starGradientOn)" : "url(#starGradientOff)"}>
              <defs>
                <radialGradient id="starGradientOn" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#AE8B2A" />
                  <stop offset="100%" stopColor="#8F6B17" />
                </radialGradient>
                <radialGradient id="starGradientOff" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#B3B3B3" />
                  <stop offset="100%" stopColor="#888888" />
                </radialGradient>
              </defs>
              <polygon points="12,2 15,8.5 22,9.5 17,14.5 18,21.5 12,18 6,21.5 7,14.5 2,9.5 9,8.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* CHAT CONTENT */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0',
          gap: '0',
          overflow: 'hidden',
        }}
      >
        {/* Chat Window Heading */}
        <div
          className="chat-window-heading"
          style={{
            width: '90%',
            height: '60px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            position: 'relative',
          }}
        >
          {/* Left: Chat Type Icon */}
          <div>{getChatTypeIcon()}</div>

          {/* Center: Groups Icon + Online Count (Clickable) */}
          <button
            onClick={() => setIsMembersModalOpen(true)}
            style={{ 
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{
              fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#B9B7B7',
            }}>
              {onlineCount}
            </span>
          </button>

          {/* Right: Online Indicator */}
          <div
            className="online-indicator"
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #4DEB97 0%, #2B9522 100%)',
            }}
          />
        </div>

        {/* Chat Window */}
        <div
          ref={chatWindowRef}
          className="chat-window"
          style={{
            width: '90%',
            flex: 1,
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderTopLeftRadius: '0',
            borderTopRightRadius: '0',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            padding: '20px 0',
            overflowY: 'auto',
          }}
        >
          {/* Messages */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            padding: '0 20px',
            minHeight: '100%',
            justifyContent: 'flex-end',
          }}>
            {isEmpty ? (
              /* Empty State */
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                padding: '40px 20px',
              }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <line x1="9" y1="10" x2="15" y2="10"/>
                  <line x1="9" y1="14" x2="13" y2="14"/>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '18px',
                    color: '#B9B7B7',
                    marginBottom: '8px',
                  }}>
                    No messages yet
                  </div>
                  <div style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '13px',
                    color: '#707070',
                    maxWidth: '250px',
                  }}>
                    Be the first to send a message in this chat
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Render actual messages from database */}
                {storeMessages.map((msg) => {
                  const isOwnMessage = msg.sender_id?.id === user?.id || (msg.sender_id as any)?._id === user?.id;
                  const senderName = msg.sender_id?.display_name || msg.sender_id?.username || 'Unknown';
                  const isAI = msg.is_ai === true;
                  
                  return (
            <div 
                      key={msg._id}
                      ref={el => { messageRefs.current[msg._id] = el; }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                width: '100%',
                gap: '4px',
                        backgroundColor: highlightedMessageId === msg._id ? 'rgba(96, 246, 171, 0.1)' : 'transparent',
                borderRadius: '20px',
                transition: 'background-color 0.3s ease',
              }}>
              {/* Time - centered above bubble */}
              <span style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '10px',
                color: '#707070',
                        alignSelf: isOwnMessage ? 'flex-end' : (isAI ? 'center' : 'flex-start'),
                        marginLeft: isOwnMessage ? '0' : (isAI ? '0' : '50px'),
                        marginRight: isOwnMessage ? '50px' : '0',
              }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

                      {/* Message Container */}
                      <div style={{
                        display: 'flex',
                        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: '10px',
                  width: '100%',
                      }}>
                        {/* PFP */}
                        {!isAI && (
                          <div
                            onClick={() => !isOwnMessage && onUserClick?.(msg.sender_id?.id || (msg.sender_id as any)?._id)}
                            style={{
                              width: '35px',
                              height: '35px',
                              minWidth: '35px',
                              borderRadius: '50%',
                              border: '1px solid #888888',
                  display: 'flex', 
                  alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#2A2A2A',
                              overflow: 'hidden',
                              filter: 'grayscale(100%)',
                              cursor: !isOwnMessage ? 'pointer' : 'default',
                            }}
                    >
                            {msg.sender_id?.avatar_url ? (
                              <img src={msg.sender_id.avatar_url} alt={senderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '16px' }}>👤</span>
                            )}
                  </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          style={{
                            backgroundColor: isAI ? '#065C60' : (isOwnMessage ? '#5A5A5A' : '#242424'),
                            border: '1px solid transparent',
                            backgroundImage: isAI 
                              ? 'linear-gradient(#065C60, #065C60), linear-gradient(135deg, #00E4B6, #34DF87)'
                              : (isOwnMessage 
                                ? 'linear-gradient(#5A5A5A, #5A5A5A), linear-gradient(135deg, #707070, #333333)'
                                : 'linear-gradient(#242424, #242424), linear-gradient(135deg, #918E8E, #484646)'),
                            backgroundOrigin: 'border-box',
                            backgroundClip: 'padding-box, border-box',
                            borderRadius: isOwnMessage ? '32.5px 32.5px 0 32.5px' : (isAI ? '20px' : '32.5px 32.5px 32.5px 0'),
                            padding: '8px 12px',
                            maxWidth: 'calc(100% - 65px)',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            boxShadow: '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
                          }}
                        >
                  {/* Username */}
                  <span style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '10px',
                            color: '#909090',
                    display: 'block',
                    marginBottom: '4px',
                            textAlign: isAI ? 'center' : 'left',
                  }}>
                            {isOwnMessage ? 'You' : senderName}
                  </span>

                  {/* Message Text */}
                  <p style={{
                    fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '12px',
                    color: '#D3D3D3',
                    margin: '0 0 4px 0',
                  }}>
                            {renderMessageWithMentions(msg.text)}
                  </p>

                  {/* Reply, Reaction, Menu */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    {/* Left: Reply + Reaction */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '16px' }}>
                              {!isAI && (
                                <>
                      <button 
                                    onClick={() => setReplyingTo({ messageId: msg._id, username: senderName, preview: msg.text })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', height: '16px' }}
                      >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="2">
                          <polyline points="9 17 4 12 9 7"/>
                          <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                        </svg>
                      </button>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '16px' }}>
                        <button 
                                      onClick={() => setShowReactionPicker(showReactionPicker === msg._id ? null : msg._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', height: '16px' }}
                        >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            <line x1="9" y1="9" x2="9.01" y2="9"/>
                            <line x1="15" y1="9" x2="15.01" y2="9"/>
                          </svg>
                        </button>
                                    {showReactionPicker === msg._id && (
                          <div 
                            ref={reactionPickerRef}
                            style={{
                              position: 'absolute',
                              bottom: '25px',
                              left: '0',
                              backgroundColor: '#19191A',
                              border: '1px solid transparent',
                              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                              backgroundOrigin: 'border-box',
                              backgroundClip: 'padding-box, border-box',
                              borderRadius: '20px',
                              padding: '8px',
                              display: 'flex',
                              gap: '8px',
                              zIndex: 100,
                              boxShadow: '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
                            }}>
                            {reactionEmojis.map(emoji => (
                              <button
                                key={emoji}
                                            onClick={() => toggleReaction(msg._id, emoji)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '18px',
                                  padding: '4px',
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                                </>
                  )}
                </div>

                            {/* Right: Menu */}
                            {!isAI && isOwnMessage && (
                      <button 
                                onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', height: '16px', position: 'relative' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="2">
                                  <circle cx="12" cy="12" r="1"/>
                                  <circle cx="12" cy="5" r="1"/>
                                  <circle cx="12" cy="19" r="1"/>
                        </svg>
                                {showMessageMenu === msg._id && (
                          <div 
                                    ref={messageMenuRef}
                            style={{
                              position: 'absolute',
                                      bottom: '20px',
                                      right: '0',
                              backgroundColor: '#19191A',
                              border: '1px solid transparent',
                              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                              backgroundOrigin: 'border-box',
                              backgroundClip: 'padding-box, border-box',
                                      borderRadius: '15px',
                              padding: '8px',
                              display: 'flex',
                                      flexDirection: 'column',
                                      gap: '4px',
                                      minWidth: '120px',
                              zIndex: 100,
                              boxShadow: '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
                                    }}
                                  >
                        <button
                          onClick={() => {
                                        messageService.deleteMessage(msg._id);
                                        setShowMessageMenu(null);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                                        color: '#FF4444',
                            cursor: 'pointer',
                                        padding: '6px 10px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        borderRadius: '8px',
                            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                                      }}
                                    >
                                      Delete
                        </button>
                      </div>
                                )}
                    </button>
                            )}
                  </div>

                  {/* Reactions Display */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                              {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                        <button
                          key={emoji}
                                  onClick={() => toggleReaction(msg._id, emoji)}
                          style={{
                                    backgroundColor: '#242424',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                            padding: '2px 6px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                                  <span>{emoji}</span>
                                  <span style={{ fontSize: '10px', color: '#909090' }}>{userIds.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Mention Picker Dropdown */}
        {showMentionPicker && (
      <div 
              ref={mentionPickerRef}
        style={{
              position: 'absolute',
                bottom: '80px',
                left: '20px',
                right: '20px',
              maxHeight: '200px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
                borderRadius: '20px',
                padding: '10px',
                overflowY: 'auto',
              zIndex: 100,
                boxShadow: '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
              }}
            >
              {mentionableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setMessage(prev => prev + u.username + ' ');
                    setShowMentionPicker(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    color: '#D3D3D3',
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '13px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#242424'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#2A2A2A',
                    border: '1px solid #888',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    }}>
                    👤
                    </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div>{u.username}</div>
                    <div style={{
                      fontSize: '10px',
                      color: '#707070',
                      background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {u.rank}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

        <div
          className="message-input-container"
          style={{
            width: '100%',
            minHeight: '60px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            gap: '10px',
          }}
        >
            {/* Send Button */}
            <button
              className="send-button"
              onClick={() => {
                if (message.trim() && websocketService.isConnected()) {
                  // Send via WebSocket
                  websocketService.sendMessage(
                    conversation._id,
                    message,
                    replyingTo?.messageId,
                    // Extract mentions from message
                    message.match(/@(\w+)/g)?.map(m => m.substring(1))
                  );
                  setMessage('');
                  setReplyingTo(null);
                  setMessageStatus('pending');
                  // Simulate message delivery
                  setTimeout(() => setMessageStatus('sent'), 500);
                  setTimeout(() => setMessageStatus('delivered'), 1000);
                }
              }}
              disabled={!message.trim() || connectionStatus !== 'connected'}
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: message.trim() 
                  ? 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #5BC854, #082724)'
                  : 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: message.trim() ? 'pointer' : 'not-allowed',
                opacity: message.trim() ? 1 : 0.5,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={message.trim() ? "#5BC854" : "#707070"} strokeWidth="2">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>

            {/* Message Input */}
            <textarea
              ref={messageInputRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (message.trim() && websocketService.isConnected()) {
                    // Send via WebSocket
                    websocketService.sendMessage(
                      conversation._id,
                      message,
                      replyingTo?.messageId,
                      // Extract mentions from message
                      message.match(/@(\w+)/g)?.map(m => m.substring(1))
                    );
                    setMessage('');
                    setReplyingTo(null);
                    setShowMentionPicker(false);
                    setMessageStatus('pending');
                    setTimeout(() => setMessageStatus('sent'), 500);
                    setTimeout(() => setMessageStatus('delivered'), 1000);
                  }
                }
              }}
              placeholder="Type your message here… (use @ to mention)"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#CBCBCB',
                fontSize: '12px',
                fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '300',
                resize: 'none',
                minHeight: '40px',
                maxHeight: '120px',
                overflowY: 'auto',
                paddingTop: '10px',
              }}
              className="message-input-field"
              rows={1}
            />
        </div>
      </div>
      </div>

      {/* Group Members Modal */}
      <GroupMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        chatName={chatName}
        members={mockMembers}
        onMemberClick={(userId) => {
          onUserClick?.(userId);
        }}
      />
    </div>
  );
};
