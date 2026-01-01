import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { websocketService } from '../../services/websocket';
import { messageService, mediaService } from '../../services/api';
import { GroupMembersModal } from './GroupMembersModal';
import { GifPicker } from './GifPicker';
import { RankedPFP } from '../common/RankedPFP';
import { getRankColors } from '../../utils/ranks';
import type { ChatRoom as ChatRoomType, Message } from '../../types';
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
  const { 
    messages: storeMessages, 
    addMessage, 
    setMessages: setStoreMessages,
    updateMessage,
    deleteMessage: deleteStoreMessage,
    updateMessageReactions 
  } = useChatStore();
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
  
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ messageId: string; username: string; preview: string } | null>(null);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [participants, setParticipants] = useState<any[]>([]);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const mentionPickerRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaMenuRef = useRef<HTMLDivElement>(null);
  
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
    // Clear messages immediately when conversation changes to prevent showing old chat
    setStoreMessages([]);
    setIsLoadingMessages(true);
    
    const loadMessages = async () => {
      try {
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
      // Check if this is replacing an optimistic message
      // Remove any temp messages from the same sender with similar timestamp (within 2 seconds)
      const currentMessages = storeMessages;
      if (!Array.isArray(currentMessages)) {
        setStoreMessages([message]);
        return;
      }
      
      // Remove temp messages that match
      const filtered = currentMessages.filter(m => {
        if (!m._id.startsWith('temp-')) return true; // Keep real messages
        
        // Remove if same sender and text
        const isSameSender = (m.sender_id?._id === message.sender_id?._id || m.sender_id?.id === message.sender_id?.id);
        const isSameText = m.text === message.text;
        const timeDiff = Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime());
        
        return !(isSameSender && isSameText && timeDiff < 5000); // Remove if match
      });
      
      // Add the new real message
      setStoreMessages([...filtered, message]);
    });

    // Listen for message updates
    const unsubscribeUpdated = websocketService.onMessageUpdated((message) => {
      updateMessage(message._id, message);
    });

    // Listen for reaction updates
    const unsubscribeReaction = websocketService.onMessageReaction((data) => {
      updateMessageReactions(data.messageId, data.reactions);
    });

    // Listen for deleted messages
    const unsubscribeDeleted = websocketService.onMessageDeleted((data) => {
      deleteStoreMessage(data.messageId);
      setShowMessageMenu(null); // Close menu if open
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdated();
      unsubscribeReaction();
      unsubscribeDeleted();
      websocketService.leaveRoom(conversation._id);
    };
  }, [conversation._id, token, addMessage, setStoreMessages]);

  // Load participants when messages change
  useEffect(() => {
    const uniqueUsers = new Map();
    storeMessages.forEach(msg => {
      if (msg.sender_id && typeof msg.sender_id === 'object') {
        const userId = msg.sender_id._id || msg.sender_id.id;
        if (userId && !uniqueUsers.has(userId)) {
          uniqueUsers.set(userId, {
            _id: userId,
            id: userId,
            username: msg.sender_id.username,
            display_name: msg.sender_id.display_name,
            avatar_url: msg.sender_id.avatar_url,
            rank: msg.sender_id.rank || 'RECRUIT',
          });
        }
      }
    });
    setParticipants(Array.from(uniqueUsers.values()));
  }, [storeMessages]);
  
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
      if (showMessageMenu && messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(null);
      }
      if (showMediaMenu && mediaMenuRef.current && !mediaMenuRef.current.contains(event.target as Node)) {
        setShowMediaMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showReactionPicker, showMessageMenu, showMediaMenu]);
  
  // Reaction emojis
  const reactionEmojis = ['❤️', '👍', '😂', '👎', '🔥', '😮', '🤬', '🔫'];
  
  // Mock users for mentions - will be replaced with API
  
  // Use participants as mentionable users
  
  // Filter users for mention autocomplete
  const filteredMentionUsers = participants.filter(u => 
    u.username?.toLowerCase().includes(mentionSearch.toLowerCase())
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
  
  // Handle sending messages
  const handleSendMessage = () => {
    const isConnected = websocketService.isConnected();
    
    if (!message.trim()) {
      return;
    }
    
    // Use websocketService.isConnected() instead of connectionStatus
    if (!isConnected) {
      console.error('WebSocket not connected!');
      alert('Not connected to chat server. Please refresh the page.');
      return;
    }
    
    try {
      // Extract mentions
      const mentions = message.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];
      
      // Create optimistic message
      const optimisticMessage = {
        _id: `temp-${Date.now()}`, // Temporary ID
        conversation_id: conversation._id,
        sender_id: {
          _id: user?._id || user?.id || '',
          id: user?.id || '',
          username: user?.username || 'You',
          display_name: user?.display_name || user?.username || 'You',
          avatar_url: user?.avatar_url,
          rank: user?.rank || 'RECRUIT',
          wallet_address: user?.wallet_address || '',
        },
        text: message.trim(),
        reactions: {},
        created_at: new Date().toISOString(),
        deleted: false,
        reply_to: replyingTo ? {
          _id: replyingTo.messageId,
          sender_id: { username: replyingTo.username } as any,
          preview: replyingTo.preview,
        } : undefined,
        mentions,
        status: 'pending' as const, // Mark as pending
      };
      
      // Add optimistically to UI
      addMessage(optimisticMessage);
      
      // Send via WebSocket
      websocketService.sendMessage(
        conversation._id,
        message.trim(),
        replyingTo?.messageId,
        mentions
      );
      
      // Clear input and reset state
      setMessage('');
      setReplyingTo(null);
      setShowMentionPicker(false);
      setMentionSearch('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };
  
  // Handle sending GIF
  const handleSendGif = (gifUrl: string) => {
    if (!websocketService.isConnected()) {
      alert('Not connected to chat server. Please refresh the page.');
      return;
    }
    
    try {
      websocketService.sendMessage(
        conversation._id,
        gifUrl,
        replyingTo?.messageId,
        []
      );
      
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send GIF:', error);
      alert('Failed to send GIF. Please try again.');
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    if (file.size > maxSize) {
      alert('Image must be less than 10MB');
      return;
    }
    
    setIsUploadingImage(true);
    try {
      const imageUrl = await mediaService.uploadImage(file);
      
      // Send image URL as message
      websocketService.sendMessage(
        conversation._id,
        imageUrl,
        replyingTo?.messageId,
        []
      );
      
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      // Reset input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
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
              const mentionedUser = participants.find(u => u.username === username);
              if (mentionedUser) {
                onUserClick?.(mentionedUser._id || mentionedUser.id);
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
  
  
  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    const currentUserId = user._id || user.id || '';
    const message = storeMessages.find(m => m._id === messageId);
    
    if (!message) return;
    
    // Optimistic update
    const currentReactions = message.reactions || {};
    const userIds = currentReactions[emoji] || [];
    const hasReacted = userIds.includes(currentUserId);
    
    const newReactions = {
      ...currentReactions,
      [emoji]: hasReacted 
        ? userIds.filter(id => id !== currentUserId) // Remove reaction
        : [...userIds, currentUserId] // Add reaction
    };
    
    // Update locally immediately (optimistic)
    updateMessageReactions(messageId, newReactions);
    setShowReactionPicker(null);
    
    // Send to server
    try {
      await websocketService.reactToMessage(messageId, emoji);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
      // Revert on error
      updateMessageReactions(messageId, currentReactions);
    }
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
                {Array.isArray(storeMessages) && storeMessages.map((msg) => {
                  const isOwnMessage = msg.sender_id?._id === (user?._id || user?.id) || msg.sender_id?.id === (user?._id || user?.id);
                  const senderName = msg.sender_id?.display_name || msg.sender_id?.username || 'Unknown';
                  const isAI = msg.is_ai === true;
                  const senderRank = msg.sender_id?.rank || 'RECRUIT';
                  
                  // Get rank colors for border - only use custom colors for + ranks and staff
                  const rankColors = getRankColors(senderRank);
                  const hasSpecialRank = senderRank.includes('+') || ['MOD', 'ADMIN', 'CREATOR'].includes(senderRank);
                  const borderGradient = hasSpecialRank
                    ? `linear-gradient(135deg, ${rankColors.rankBorder.topLeft}, ${rankColors.rankBorder.bottomRight})`
                    : 'linear-gradient(135deg, #707070, #333333)';
                  
                  return (
            <div 
                      key={msg._id}
                      ref={el => { messageRefs.current[msg._id] = el; }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                width: '100%',
                gap: '4px',
              }}>
              {/* Time - positioned above the straight part of bubble */}
              <span style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '10px',
                color: '#707070',
                alignSelf: isOwnMessage ? 'flex-end' : (isAI ? 'center' : 'flex-start'),
                marginLeft: isOwnMessage ? '0' : (isAI ? '0' : '93px'),
                marginRight: isOwnMessage ? '93px' : '0',
              }}>
                {/* Delivery status ticks for own messages - before time */}
                {isOwnMessage && (
                  <span style={{ marginRight: '4px', fontSize: '10px' }}>
                    {msg.status === 'pending' && '○'} {/* Single circle - sending */}
                    {msg.status === 'sent' && '✓'} {/* Single tick - sent */}
                    {(msg.status === 'delivered' || !msg.status) && '✓✓'} {/* Double tick - delivered */}
                    {msg.status === 'read' && <span style={{ color: '#5BC854' }}>✓✓</span>} {/* Green double tick - read */}
                    {msg.status === 'failed' && '✗'} {/* X - failed */}
                  </span>
                )}
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>

                      {/* Message Container */}
                      <div style={{
                        display: 'flex',
                        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        gap: '10px',
                        width: '100%',
                      }}>
                        {/* PFP */}
                        {!isAI && (
                          <div
                            onClick={() => !isOwnMessage && onUserClick?.(msg.sender_id?._id || msg.sender_id?.id || '')}
                            style={{ cursor: !isOwnMessage ? 'pointer' : 'default', flexShrink: 0 }}
                          >
                            <RankedPFP 
                              rank={senderRank} 
                              size="medium" 
                              showRankLabel={true}
                              avatarUrl={msg.sender_id?.avatar_url}
                            />
                          </div>
                        )}

                          {/* Check if message is an image/GIF */}
                          {(() => {
                            const isImageMessage = msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com');
                            
                            return (
                          <div
                            style={{
                              backgroundColor: isAI ? '#065C60' : (isOwnMessage ? '#5A5A5A' : '#242424'),
                              border: '1px solid transparent',
                              backgroundImage: isAI 
                                ? 'linear-gradient(#065C60, #065C60), linear-gradient(135deg, #00E4B6, #34DF87)'
                                : `linear-gradient(${isOwnMessage ? '#5A5A5A' : '#242424'}, ${isOwnMessage ? '#5A5A5A' : '#242424'}), ${borderGradient}`,
                              backgroundOrigin: 'border-box',
                              backgroundClip: 'padding-box, border-box',
                              borderRadius: isOwnMessage ? '32.5px 32.5px 0 32.5px' : (isAI ? '20px' : '32.5px 32.5px 32.5px 0'),
                              padding: isImageMessage ? '0' : '8px 12px', // No padding for images
                              minWidth: isImageMessage ? 'auto' : '90px',
                              maxWidth: 'calc(100% - 65px)',
                              overflow: 'hidden', // Ensure image doesn't overflow
                              wordWrap: 'break-word',
                              whiteSpace: 'pre-wrap',
                              boxShadow: highlightedMessageId === msg._id 
                                ? '0 0 0 3px rgba(91, 200, 84, 0.4), -2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)'
                                : '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
                              transition: 'box-shadow 0.3s ease',
                            }}
                          >
                          {!isImageMessage && (
                            <>
                          {/* Username - positioned at start of straight edge */}
                          <span style={{
                            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: '10px',
                            color: isAI ? '#60F6AB' : '#909090',
                            display: 'block',
                            marginBottom: '4px',
                            marginLeft: isOwnMessage ? '0' : (isAI ? '0' : '20px'),
                            marginRight: isOwnMessage ? '20px' : '0',
                            textAlign: isAI ? 'center' : (isOwnMessage ? 'right' : 'left'),
                          }}>
                            {isOwnMessage ? 'You' : senderName}
                          </span>

                          {/* Reply Preview - clickable to scroll to original message */}
                          {msg.reply_to && (
                            <div
                              onClick={() => {
                                if (msg.reply_to?._id) {
                                  scrollToMessage(msg.reply_to._id);
                                }
                              }}
                              style={{
                                backgroundColor: '#2A2A2A',
                                borderLeft: '3px solid #5BC854',
                                padding: '6px 10px',
                                marginBottom: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333333'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
                            >
                              <div style={{ 
                                fontSize: '10px', 
                                color: '#5BC854',
                                marginBottom: '2px',
                                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                              }}>
                                {msg.reply_to.sender_id?.display_name || msg.reply_to.sender_id?.username || 'User'}
                              </div>
                              <div style={{ 
                                fontSize: '11px', 
                                color: '#909090',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                              }}>
                                {msg.reply_to.preview || msg.reply_to.text || 'Message'}
                              </div>
                            </div>
                          )}
                          </>
                          )}

                          {/* Message Content - Image, GIF, or Text */}
                          {(() => {
                            const isImageMessage = msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com');
                            
                            return isImageMessage ? (
                              // Image/GIF - flush with bubble edges, sharp top corners
                              <img
                                src={msg.text}
                                alt="Shared media"
                                style={{
                                  width: '100%',
                                  maxHeight: '300px',
                                  objectFit: 'cover',
                                  borderRadius: isOwnMessage ? '10px 10px 0 10px' : (isAI ? '10px' : '10px 10px 10px 0'), // Sharp top corners
                                  display: 'block',
                                  margin: '0',
                                  padding: '0',
                                }}
                                onError={(e) => {
                                  // If image fails to load, show as text instead
                                  e.currentTarget.style.display = 'none';
                                  const textNode = document.createElement('p');
                                  textNode.textContent = msg.text;
                                  textNode.style.cssText = `
                                    font-family: Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif;
                                    font-size: 12px;
                                    color: ${isAI ? '#60F6AB' : '#D3D3D3'};
                                    margin: 0 0 4px 0;
                                    padding: 8px 12px;
                                  `;
                                  e.currentTarget.parentElement?.appendChild(textNode);
                                }}
                              />
                            ) : (
                              <p style={{
                                fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '12px',
                                color: isAI ? '#60F6AB' : '#D3D3D3',
                                margin: '0 0 4px 0',
                              }}>
                                {renderMessageWithMentions(msg.text)}
                              </p>
                            );
                          })()}

                  {/* Reply, Reaction, Menu */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: (msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com')) ? '8px' : '0', // Add spacing for images
                    marginBottom: (msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com')) ? '8px' : '0', // Add spacing for images
                    paddingLeft: (msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com')) ? '8px' : '0', // Add padding for images
                    paddingRight: (msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com')) ? '8px' : '0', // Add padding for images
                  }}>
                    {/* For self messages: 3 dots on left, reply+react on right */}
                    {/* For other messages: reply+react on left, 3 dots on right */}
                    
                    {isOwnMessage ? (
                      <>
                        {/* Left: 3 dots menu */}
                        {!isAI && (
                          <button 
                            onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              padding: 0, 
                              display: 'flex', 
                              alignItems: 'center', 
                              height: '16px', 
                              position: 'relative',
                              marginRight: '20px',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#A8A8A8">
                              <circle cx="5" cy="12" r="2"/>
                              <circle cx="12" cy="12" r="2"/>
                              <circle cx="19" cy="12" r="2"/>
                            </svg>
                            {showMessageMenu === msg._id && (
                              <div 
                                ref={messageMenuRef}
                                style={{
                                  position: 'absolute',
                                  bottom: '20px',
                                  left: '0',
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
                                <div
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      console.log('Deleting message:', msg._id);
                                      await websocketService.deleteMessage(msg._id);
                                      setShowMessageMenu(null);
                                    } catch (error) {
                                      console.error('Failed to delete message:', error);
                                    }
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
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  Delete
                                </div>
                              </div>
                            )}
                          </button>
                        )}
                        
                        {/* Right: Reply + Reaction */}
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
                                      right: '0',
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
                      </>
                    ) : (
                      <>
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

                        {/* Right: 3 dots menu - positioned after curved corner */}
                        {!isAI && (
                          <button 
                            onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              padding: 0, 
                              display: 'flex', 
                              alignItems: 'center', 
                              height: '16px', 
                              position: 'relative',
                              marginLeft: '33px',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#A8A8A8">
                              <circle cx="5" cy="12" r="2"/>
                              <circle cx="12" cy="12" r="2"/>
                              <circle cx="19" cy="12" r="2"/>
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
                                    // TODO: Implement report functionality
                                    console.log('Report message:', msg._id);
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
                                  Report
                                </button>
                              </div>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Reactions Display - with full-width background and proper gap */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div style={{ 
                      backgroundColor: '#19191A',
                      marginLeft: '-12px',
                      marginRight: '-12px',
                      marginTop: '4px',
                      marginBottom: '-8px',
                      padding: '8px 12px',
                      borderBottomLeftRadius: isOwnMessage ? '0' : (isAI ? '20px' : '32.5px'),
                      borderBottomRightRadius: isOwnMessage ? '32.5px' : (isAI ? '20px' : '32.5px'),
                      display: 'flex', 
                      gap: '4px', 
                      flexWrap: 'wrap',
                    }}>
                      {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                        const currentUserId = user?._id || user?.id || '';
                        const userHasReacted = Array.isArray(userIds) && userIds.includes(currentUserId);
                        const reactionCount = Array.isArray(userIds) ? userIds.length : 0;
                        
                        // Don't show reactions with 0 count
                        if (reactionCount === 0) return null;
                        
                        return (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg._id, emoji)}
                            style={{
                              backgroundColor: userHasReacted ? '#3A3A3A' : '#242424',
                              border: `1px solid ${userHasReacted ? '#555' : '#333'}`,
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
                            <span style={{ fontSize: '10px', color: '#909090' }}>{reactionCount}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                            );
                          })()}
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
              {filteredMentionUsers.length === 0 ? (
                <div style={{ 
                  padding: '10px', 
                  color: '#707070', 
                  textAlign: 'center',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '13px',
                }}>
                  No users found
                </div>
              ) : (
                filteredMentionUsers.map((u) => (
                <button
                  key={u._id || u.id}
                  onClick={() => {
                    insertMention(u.username);
                    setShowMentionPicker(false);
                    setMentionSearch('');
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
                  <RankedPFP
                    rank={u.rank || 'RECRUIT'}
                    size="tiny"
                    showRankLabel={false}
                    avatarUrl={u.avatar_url}
                  />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div>{u.display_name || u.username}</div>
                    <div style={{
                      fontSize: '10px',
                      color: '#707070',
                      background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {u.rank || 'RECRUIT'}
                    </div>
                  </div>
                </button>
                ))
              )}
            </div>
          )}

        {/* Reply Preview */}
        {replyingTo && (
          <div style={{
            width: '90%',
            backgroundColor: '#242424',
            border: '1px solid #333',
            borderRadius: '10px',
            padding: '8px 12px',
            marginTop: '10px',
            marginBottom: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#5BC854',
                marginBottom: '2px',
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              }}>
                Replying to @{replyingTo.username}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#909090',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              }}>
                {replyingTo.preview}
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        <div
          className="message-input-container"
          style={{
            width: '90%',
            marginTop: '10px',
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
            {/* Media Button (GIF + Image) */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMediaMenu(!showMediaMenu)}
                disabled={isUploadingImage}
                style={{
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                  opacity: isUploadingImage ? 0.5 : 1,
                }}
              >
                {isUploadingImage ? (
                  <span style={{ fontSize: '12px', color: '#5BC854' }}>...</span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#909090" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                )}
              </button>

              {/* Media Menu Popup */}
              {showMediaMenu && (
                <div
                  ref={mediaMenuRef}
                  style={{
                    position: 'absolute',
                    bottom: '50px',
                    left: '0',
                    backgroundColor: '#19191A',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    zIndex: 100,
                  }}
                >
                  <button
                    onClick={() => {
                      setShowMediaMenu(false);
                      setShowGifPicker(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#D3D3D3',
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#242424'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '16px' }}>GIF</span>
                  </button>
                  <div style={{ height: '1px', backgroundColor: '#333' }} />
                  <button
                    onClick={() => {
                      setShowMediaMenu(false);
                      imageInputRef.current?.click();
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#D3D3D3',
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#242424'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#909090" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {/* Send Button */}
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={!message.trim()}
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
                // If mention picker is open and Enter is pressed, close it and let message send
                if (e.key === 'Enter' && !e.shiftKey) {
                  if (showMentionPicker) {
                    setShowMentionPicker(false);
                    setMentionSearch('');
                  }
                  e.preventDefault();
                  handleSendMessage();
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

      {/* GIF Picker Modal */}
      <GifPicker
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelectGif={handleSendGif}
      />
    </div>
  );
};
