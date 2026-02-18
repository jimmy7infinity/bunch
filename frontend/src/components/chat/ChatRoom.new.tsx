import React, { useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { websocketService } from '../../services/websocket';
import { mediaService, roomService } from '../../services/api';
import { GroupMembersModal } from './GroupMembersModal';
import { GifPicker } from './GifPicker';
import type { ChatRoom as ChatRoomType } from '../../types';
import { messageSendLimiter, formatTimeRemaining } from '../../utils/rateLimiting';
import { getDisplayRank } from '../../utils/ranks';
import './ChatRoom.css';

// Hooks
import { useChatMessages } from './hooks/useChatMessages';
import { useChatState } from './hooks/useChatState';
import { useMarketStatus } from './hooks/useMarketStatus';
import { useMentions } from './hooks/useMentions';

// Components  
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { DateSeparator } from './components/DateSeparator';
import { SearchPanel } from './components/SearchPanel';
import { PositionModal } from './components/PositionModal';
import { MessageBubble } from './components/MessageBubble';
import { MentionPicker } from './components/MentionPicker';
import { ReplyPreview } from './components/ReplyPreview';
import { ChatInputArea } from './components/ChatInputArea';

// Utils
import { shouldShowDateSeparator } from './utils/messageRendering';

interface ChatRoomProps {
  conversation: ChatRoomType;
  onBack?: () => void;
  onUserClick?: (userId: string) => void;
  ctaChatRoom?: ChatRoomType | null;
  onJoinCTA?: () => void;
}

export const ChatRoom = ({ 
  conversation,
  onBack,
  onUserClick,
  ctaChatRoom,
  onJoinCTA,
}: ChatRoomProps) => {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { 
    addMessage, 
    updateMessageReactions 
  } = useChatStore();
  
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  // Use custom hooks
  const {
    conversationMessages,
    isLoadingMessages,
    isLoadingMoreMessages,
    hasMoreMessages,
    currentConversationIdRef,
    participants,
    marketPositions,
    whales,
    setMarketPositions,
    setWhales,
  } = useChatMessages({ conversation, chatWindowRef });
  
  const chatState = useChatState();
  
  const {
    myMarketStatus,
    myPositionSizeUSD,
    isLoadingStatus,
    showPositionModal,
    setShowPositionModal,
    handleShowMyPosition,
  } = useMarketStatus({
    conversationType: conversation.type,
    marketId: conversation.market_id,
    onMarketPositionsUpdate: setMarketPositions,
    onWhalesUpdate: setWhales,
  });
  
  const {
    filteredMentionUsers,
    handleMessageChange,
    insertMention,
  } = useMentions({
    participants,
    mentionSearch: chatState.mentionSearch,
    showMentionPicker: chatState.showMentionPicker,
    message: chatState.message,
    cursorPosition: chatState.cursorPosition,
    setMessage: chatState.setMessage,
    setCursorPosition: chatState.setCursorPosition,
    setShowMentionPicker: chatState.setShowMentionPicker,
    setMentionSearch: chatState.setMentionSearch,
    messageInputRef: chatState.messageInputRef,
  });
  
  // Initialize favorite state from conversation
  useEffect(() => {
    chatState.setIsFavorite(conversation.is_favorite || false);
    chatState.setHasNotifications(conversation.has_notifications || false);
  }, [conversation._id]);
  
  const chatType = conversation.type;
  const onlineCount = conversation.participant_count || 0;
  const isEmpty = !isLoadingMessages && conversationMessages.length === 0;
  
  // For DMs, show the other person's name
  const chatName = (() => {
    if (conversation.type === 'dm' && participants.length > 0) {
      const otherParticipant = participants.find(p => p._id !== user?._id && p._id !== user?.id);
      if (otherParticipant) {
        return otherParticipant.display_name || otherParticipant.username || 'User';
      }
    }
    return conversation.title || conversation.name || 'Chat';
  })();
  
  // Get search results
  const searchResults = chatState.searchQuery.trim() 
    ? conversationMessages.filter(m => m.text.toLowerCase().includes(chatState.searchQuery.toLowerCase()))
    : [];
  
  // Scroll to a specific message
  const scrollToMessage = (messageId: string) => {
    const messageEl = chatState.messageRefs.current[messageId];
    if (messageEl) {
      messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      chatState.setHighlightedMessageId(messageId);
      setTimeout(() => chatState.setHighlightedMessageId(null), 2000);
      chatState.setIsSearchOpen(false);
      chatState.setSearchQuery('');
    }
  };
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatState.showReactionPicker && chatState.reactionPickerRef.current && !chatState.reactionPickerRef.current.contains(event.target as Node)) {
        chatState.setShowReactionPicker(null);
      }
      if (chatState.showMessageMenu && chatState.messageMenuRef.current && !chatState.messageMenuRef.current.contains(event.target as Node)) {
        chatState.setShowMessageMenu(null);
      }
      if (chatState.showMediaMenu && chatState.mediaMenuRef.current && !chatState.mediaMenuRef.current.contains(event.target as Node)) {
        chatState.setShowMediaMenu(false);
      }
      if (chatState.isSearchOpen && chatState.searchPanelRef.current && !chatState.searchPanelRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.nav-icon-button')) {
          chatState.setIsSearchOpen(false);
          chatState.setSearchQuery('');
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [chatState.showReactionPicker, chatState.showMessageMenu, chatState.showMediaMenu, chatState.isSearchOpen]);
  
  // Reaction emojis
  const reactionEmojis = ['❤️', '👍', '😂', '👎', '🔥', '😮', '🤬', '🔫'];
  
  // Handle sending messages
  const handleSendMessage = () => {
    const isConnected = websocketService.isConnected();
    
    if (!chatState.message.trim()) {
      return;
    }
    
    // Rate limiting check
    if (!messageSendLimiter.canProceed()) {
      const timeUntil = messageSendLimiter.getTimeUntilReset();
      addNotification({
        type: 'system',
        title: 'Rate Limit',
        message: `Slow down! You can send another message in ${formatTimeRemaining(timeUntil)}.`,
      });
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
      const mentionsArray = chatState.message.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];
      
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
          rank: getDisplayRank(user),
          wallet_address: user?.wallet_address || '',
        },
        text: chatState.message.trim(),
        reactions: {},
        created_at: new Date().toISOString(),
        deleted: false,
        reply_to: chatState.replyingTo ? {
          _id: chatState.replyingTo.messageId,
          sender_id: { username: chatState.replyingTo.username } as any,
          preview: chatState.replyingTo.preview,
        } : undefined,
        mentions: mentionsArray,
        status: 'pending' as const, // Mark as pending
      };
      
      // Add optimistically to UI
      addMessage(optimisticMessage);
      
      // Send via WebSocket
      websocketService.sendMessage(
        conversation._id,
        chatState.message.trim(),
        chatState.replyingTo?.messageId,
        mentionsArray
      );
      
      // Clear input and reset state
      chatState.setMessage('');
      chatState.setReplyingTo(null);
      chatState.setShowMentionPicker(false);
      chatState.setMentionSearch('');
      
      // Scroll to bottom after sending
      setTimeout(() => {
        if (chatWindowRef.current) {
          chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
      }, 50);
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
    
    // Use ref to get the conversation ID at the time of sending
    const conversationIdAtSendTime = currentConversationIdRef.current;
    
    // Close the GIF picker BEFORE doing anything else
    chatState.setShowGifPicker(false);
    
    // Use setTimeout to ensure the picker closes and state updates before sending
    setTimeout(() => {
      try {
        // Double-check we're still in the same conversation
        if (conversationIdAtSendTime !== currentConversationIdRef.current) {
          console.warn('Conversation changed while sending GIF, aborting');
          return;
        }
        
        // Create optimistic message for GIF
        const optimisticMessage = {
          _id: `temp-${Date.now()}`,
          conversation_id: conversationIdAtSendTime,
          sender_id: {
            _id: user?._id || user?.id || '',
            id: user?.id || '',
            username: user?.username || 'You',
            display_name: user?.display_name || user?.username || 'You',
            avatar_url: user?.avatar_url,
            rank: getDisplayRank(user),
            wallet_address: user?.wallet_address || '',
          },
          text: gifUrl,
          reactions: {},
          created_at: new Date().toISOString(),
          deleted: false,
          reply_to: chatState.replyingTo ? {
            _id: chatState.replyingTo.messageId,
            sender_id: { username: chatState.replyingTo.username } as any,
            preview: chatState.replyingTo.preview,
          } : undefined,
          mentions: [],
          status: 'pending' as const,
        };
        
        // Add optimistically to UI
        addMessage(optimisticMessage);
        
        // Send via WebSocket
        websocketService.sendMessage(
          conversationIdAtSendTime,
          gifUrl,
          chatState.replyingTo?.messageId,
          []
        );
        
        chatState.setReplyingTo(null);
        
        // Scroll to bottom after sending GIF
        setTimeout(() => {
          if (chatWindowRef.current && currentConversationIdRef.current === conversationIdAtSendTime) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
          }
        }, 100);
      } catch (error) {
        console.error('Failed to send GIF:', error);
        alert('Failed to send GIF. Please try again.');
      }
    }, 10);
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
    
    chatState.setIsUploadingImage(true);
    try {
      const imageUrl = await mediaService.uploadImage(file);
      
      // Create optimistic message for image
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        conversation_id: conversation._id,
        sender_id: {
          _id: user?._id || user?.id || '',
          id: user?.id || '',
          username: user?.username || 'You',
          display_name: user?.display_name || user?.username || 'You',
          avatar_url: user?.avatar_url,
          rank: getDisplayRank(user),
          wallet_address: user?.wallet_address || '',
        },
        text: imageUrl,
        reactions: {},
        created_at: new Date().toISOString(),
        deleted: false,
        reply_to: chatState.replyingTo ? {
          _id: chatState.replyingTo.messageId,
          sender_id: { username: chatState.replyingTo.username } as any,
          preview: chatState.replyingTo.preview,
        } : undefined,
        mentions: [],
        status: 'pending' as const,
      };
      
      // Add optimistically to UI
      addMessage(optimisticMessage);
      
      // Send image URL as message
      websocketService.sendMessage(
        conversation._id,
        imageUrl,
        chatState.replyingTo?.messageId,
        []
      );
      
      chatState.setReplyingTo(null);
      
      // Scroll to bottom after sending image
      setTimeout(() => {
        if (chatWindowRef.current) {
          chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
      }, 50);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      chatState.setIsUploadingImage(false);
      // Reset input
      if (chatState.imageInputRef.current) {
        chatState.imageInputRef.current.value = '';
      }
    }
  };
  
  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    const currentUserId = user._id || user.id || '';
    const message = conversationMessages.find(m => m._id === messageId);
    
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
    chatState.setShowReactionPicker(null);
    
    // Send to server
    try {
      await websocketService.reactToMessage(messageId, emoji);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
      // Revert on error
      updateMessageReactions(messageId, currentReactions);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await websocketService.deleteMessage(messageId);
      // The websocket event will handle updating the store via onMessageDeleted
    } catch (error) {
      console.error('Failed to delete message:', error);
      addNotification({
        type: 'system',
        title: 'Error',
        message: 'Failed to delete message. Please try again.',
      });
    }
  };

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
      width: '100%',
      backgroundColor: '#19191A',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* TOP BAR / NAV */}
      <div 
        className="chatroom-topbar"
        style={{
          width: '100%',
          height: '75px',
          backgroundColor: '#19191A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0',
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
            onClick={() => chatState.setIsSearchOpen(!chatState.isSearchOpen)}
            className="nav-icon-button"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: chatState.isSearchOpen 
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={chatState.isSearchOpen ? "#5BC854" : "#BAB9B9"} strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        {/* Search Panel - Modularized */}
        {chatState.isSearchOpen && (
          <SearchPanel
            isOpen={chatState.isSearchOpen}
            searchPanelRef={chatState.searchPanelRef}
            searchQuery={chatState.searchQuery}
            onSearchChange={(value) => chatState.setSearchQuery(value)}
            onClose={() => {
              chatState.setIsSearchOpen(false);
              chatState.setSearchQuery('');
            }}
            searchResults={searchResults}
            onResultClick={scrollToMessage}
          />
        )}

        {/* Center: Chat Name */}
        <h1 
          style={{
            fontSize: chatName.length > 40 ? '11px' : (chatName.length > 20 ? '13px' : '15px'),
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '400',
            maxWidth: 'calc(100% - 300px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            textAlign: 'center',
            lineHeight: '1.3',
            maxHeight: '2.6em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            margin: 0,
          }}
        >
          {chatName}
        </h1>

        {/* Right: Star Button */}
        <div 
          style={{
            position: 'absolute',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <button
            onClick={async () => {
              try {
                const result = await roomService.toggleFavorite(conversation._id);
                chatState.setIsFavorite(result.is_favorite);
              } catch (error) {
                console.error('Failed to toggle favorite:', error);
              }
            }}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill={chatState.isFavorite ? "#FFD700" : "url(#starGradientOff)"}>
              <defs>
                <radialGradient id="starGradientOff" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#AE8B2A" />
                  <stop offset="100%" stopColor="#8F6B17" />
                </radialGradient>
              </defs>
              <polygon points="12,2 15,8.5 22,9.5 17,14.5 18,21.5 12,18 6,21.5 7,14.5 2,9.5 9,8.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Thin CTA Banner (when viewing different chat but CTA available) */}
      {ctaChatRoom && onJoinCTA && (
        <div
          style={{
            width: '100%',
            backgroundColor: '#19191A',
            padding: '6px 16px 0 16px',
          }}
        >
          <button
            onClick={onJoinCTA}
            style={{
              width: '100%',
              height: '32px',
              backgroundColor: '#3D3A60',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#3D3A60, #3D3A60), linear-gradient(135deg, #7A9BCC, #5C6B8A)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A9BCC" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span style={{
              fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#7A9BCC',
              fontWeight: '400',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              Join: {ctaChatRoom.name || ctaChatRoom.title}
            </span>
          </button>
        </div>
      )}

      {/* CHAT CONTENT */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '6px 0 20px 0',
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
            onClick={() => chatState.setIsMembersModalOpen(true)}
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

          {/* Right: Market Status Button/Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {conversation.type === 'market' && conversation.market_id && (
              <>
                {myMarketStatus ? (
                  <>
                    <button
                      onClick={() => setShowPositionModal(true)}
                      title="View position"
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: '#19191A',
                        border: '1px solid transparent',
                        backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #7A9BCC, #5C6B8A)',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {myMarketStatus === 'whale' ? '🐳' : '⚡'}
                    </button>
                    <button
                      onClick={handleShowMyPosition}
                      disabled={isLoadingStatus}
                      title="Refresh status"
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: '#19191A',
                        border: '1px solid transparent',
                        backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isLoadingStatus ? 'not-allowed' : 'pointer',
                        opacity: isLoadingStatus ? 0.5 : 1,
                        padding: 0,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleShowMyPosition}
                    disabled={isLoadingStatus}
                    style={{
                      height: '28px',
                      padding: '0 12px',
                      backgroundColor: '#19191A',
                      border: '1px solid transparent',
                      backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isLoadingStatus ? 'not-allowed' : 'pointer',
                      opacity: isLoadingStatus ? 0.5 : 1,
                    }}
                  >
                    <span style={{
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '11px',
                      color: '#B9B7B7',
                      fontWeight: '400',
                    }}>
                      {isLoadingStatus ? 'Loading...' : 'Get Status'}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
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
            {/* Loading More Indicator (at top when scrolling up) */}
            {isLoadingMoreMessages && (
              <div style={{
                width: '100%',
                padding: '10px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '12px',
                  color: '#606060',
                }}>
                  Loading older messages...
                </div>
              </div>
            )}

            {isEmpty ? (
              <EmptyState chatName={chatName} />
            ) : isLoadingMessages ? (
              <LoadingState />
            ) : (
              <>
                {conversationMessages.map((msg, index) => {
                  const currentMsgDate = new Date(msg.created_at);
                  const previousMsg = index > 0 ? conversationMessages[index - 1] : null;
                  const previousMsgDate = previousMsg ? new Date(previousMsg.created_at) : null;
                  
                  return (
                    <React.Fragment key={msg._id}>
                      {shouldShowDateSeparator(currentMsgDate, previousMsgDate) && (
                        <DateSeparator date={currentMsgDate} />
                      )}
                      <MessageBubble
                        message={msg}
                        user={user}
                        participants={participants}
                        marketPositions={marketPositions}
                        whales={whales}
                        isOwnMessage={(user?._id || user?.id) === (msg.sender_id?._id || msg.sender_id?.id)}
                        conversationType={conversation.type}
                        highlightedMessageId={chatState.highlightedMessageId}
                        messageRef={(el) => {
                          if (el) chatState.messageRefs.current[msg._id] = el;
                        }}
                        onReply={() => {
                          chatState.setReplyingTo({
                            messageId: msg._id,
                            username: msg.sender_id.username,
                            preview: msg.text.substring(0, 50) + (msg.text.length > 50 ? '...' : ''),
                          });
                          chatState.messageInputRef.current?.focus();
                        }}
                        onReact={toggleReaction}
                        onScrollToMessage={scrollToMessage}
                        onDeleteMessage={handleDeleteMessage}
                        onUserClick={onUserClick}
                        showMessageMenu={chatState.showMessageMenu}
                        setShowMessageMenu={chatState.setShowMessageMenu}
                        showReactionPicker={chatState.showReactionPicker}
                        setShowReactionPicker={chatState.setShowReactionPicker}
                        messageMenuRef={chatState.messageMenuRef}
                        reactionPickerRef={chatState.reactionPickerRef}
                        reactionEmojis={reactionEmojis}
                      />
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </div>
        </div>

      {/* Reply Preview */}
      {chatState.replyingTo && (
        <ReplyPreview
          replyingTo={chatState.replyingTo}
          onClose={() => chatState.setReplyingTo(null)}
        />
      )}

      {/* Mention Picker */}
      {chatState.showMentionPicker && filteredMentionUsers.length > 0 && (
        <MentionPicker
          isOpen={chatState.showMentionPicker}
          mentionPickerRef={chatState.mentionPickerRef}
          filteredUsers={filteredMentionUsers}
          onSelectUser={(selectedUser: any) => {
            insertMention(selectedUser.username);
            chatState.setShowMentionPicker(false);
            chatState.setMentionSearch('');
          }}
        />
      )}

      {/* Chat Input Area */}
      <ChatInputArea
        message={chatState.message}
        onMessageChange={handleMessageChange}
        onSendMessage={handleSendMessage}
        onImageUpload={handleImageUpload}
        showMentionPicker={chatState.showMentionPicker}
        showMediaMenu={chatState.showMediaMenu}
        setShowMediaMenu={chatState.setShowMediaMenu}
        setShowGifPicker={chatState.setShowGifPicker}
        isUploadingImage={chatState.isUploadingImage}
        messageInputRef={chatState.messageInputRef}
        imageInputRef={chatState.imageInputRef}
        mediaMenuRef={chatState.mediaMenuRef}
      />
    </div>
    {/* END CHAT CONTENT */}

      {/* Group Members Modal */}
      {chatState.isMembersModalOpen && (
        <GroupMembersModal
          isOpen={chatState.isMembersModalOpen}
          conversationId={conversation._id}
          chatName={chatName}
          onClose={() => chatState.setIsMembersModalOpen(false)}
          onMemberClick={onUserClick}
        />
      )}

      {/* Position Modal */}
      {showPositionModal && (
        <PositionModal
          isOpen={showPositionModal}
          myMarketStatus={myMarketStatus}
          myPositionSizeUSD={myPositionSizeUSD}
          conversationId={conversation._id}
          onClose={() => setShowPositionModal(false)}
        />
      )}

      {/* GIF Picker Modal */}
      <GifPicker
        isOpen={chatState.showGifPicker}
        onClose={() => chatState.setShowGifPicker(false)}
        onSelectGif={handleSendGif}
      />
    </div>
  );
};
