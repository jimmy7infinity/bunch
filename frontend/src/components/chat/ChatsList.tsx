import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { ChatRoom } from './ChatRoom';
import { UserProfile } from '../profile/UserProfile';
import { Settings } from '../profile/Settings';
import { ProfileDropdown } from '../profile/ProfileDropdown';
import { CreateGroupModal } from './CreateGroupModal';
import { Leaderboard } from '../leaderboard/Leaderboard';
import { RankedPFP } from '../common/RankedPFP';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { roomService, userService } from '../../services/api';
import type { ChatRoom as ChatRoomType } from '../../types';
import './ChatsList.css';

type ViewMode = 'chats' | 'chat' | 'profile' | 'settings' | 'other-profile' | 'leaderboard';

export const ChatsList = () => {
  const { user, logout, setAuth, token } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [selectedChat, setSelectedChat] = useState<ChatRoomType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('chats');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [activeChatCategory, setActiveChatCategory] = useState<'global' | 'market' | 'private' | 'favorites'>('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<ChatRoomType[]>([]);
  const pfpRef = useRef<HTMLDivElement>(null);

  // Refresh user data on mount
  useEffect(() => {
    const refreshUserData = async () => {
      if (user && token) {
        try {
          const freshUser = await userService.getUser(user._id || user.id);
          setAuth(freshUser, token);
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }
    };
    refreshUserData();
  }, []); // Only run once on mount

  // Load chats from API
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const rooms = await roomService.getRooms(activeChatCategory);
        setChats(rooms);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [activeChatCategory]); // Don't include viewMode - it causes issues
  
  const toggleFavorite = async (chatId: string) => {
    try {
      const result = await roomService.toggleFavorite(chatId);
    setChats(prev => prev.map(chat => 
        chat._id === chatId ? { ...chat, is_favorite: result.is_favorite } : chat
    ));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };
  
  const toggleAiFeed = async (chatId: string) => {
    try {
      const result = await roomService.toggleNotifications(chatId);
    setChats(prev => prev.map(chat => 
        chat._id === chatId ? { ...chat, has_ai_feed: result.has_notifications } : chat
    ));
    } catch (error) {
      console.error('Failed to toggle AI feed:', error);
    }
  };

  // Filter chats based on category and search
  const filteredChats = chats.filter(chat => {
    // Filter by search query
    const chatName = chat.title || chat.name || '';
    const matchesSearch = chatName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleCreateGroup = async (groupName: string, selectedFriends: string[]) => {
    console.log('Creating group:', groupName, 'with friends:', selectedFriends);
    
    try {
      if (selectedFriends.length === 1) {
        // Create DM with single friend
        const conversation = await roomService.getOrCreateDM(selectedFriends[0]);
        setSelectedChat(conversation);
        setIsCreateGroupOpen(false);
      } else if (selectedFriends.length > 1) {
        // Create group chat
        const conversation = await roomService.createPrivateRoom(groupName, selectedFriends);
        setSelectedChat(conversation);
        setIsCreateGroupOpen(false);
        await refreshChats(); // Refresh to show new group in list
      }
    } catch (error) {
      console.error('Failed to create chat/group:', error);
      // TODO: Show error message to user
    }
  };

  // Refresh chat list
  const refreshChats = async () => {
    try {
      const rooms = await roomService.getRooms(activeChatCategory);
      setChats(rooms);
    } catch (error) {
      console.error('Failed to refresh chats:', error);
    }
  };

  // Handle chat selection
  if (selectedChat && viewMode === 'chats') {
    console.log('[ChatsList] Rendering ChatRoom for:', selectedChat._id, selectedChat.title || selectedChat.name);
    return (
      <ChatRoom 
        key={selectedChat._id} // Add key to force re-mount on conversation change
        conversation={selectedChat}
        onBack={async () => {
          console.log('[ChatsList] Going back from chat');
          setSelectedChat(null);
          await refreshChats(); // Refresh chat list when returning
        }}
        onUserClick={(userId) => {
          setSelectedUserId(userId);
          setViewMode('other-profile');
        }}
      />
    );
  }

  // Handle profile view
  if (viewMode === 'profile') {
    return (
      <UserProfile
        userId={user?.id || ''}
        isOwnProfile={true}
        onBack={() => setViewMode('chats')}
      />
    );
  }

  // Handle other user's profile view
  if (viewMode === 'other-profile' && selectedUserId) {
    return (
      <UserProfile
        userId={selectedUserId}
        isOwnProfile={false}
        onBack={() => {
          setViewMode('chats');
          setSelectedUserId(null);
        }}
      />
    );
  }

  // Handle settings view
  if (viewMode === 'settings') {
    return (
      <Settings
        onBack={() => setViewMode('chats')}
      />
    );
  }

  // Handle leaderboard view
  if (viewMode === 'leaderboard') {
    return (
      <Leaderboard
        onBack={() => setViewMode('chats')}
        onUserClick={(userId) => {
          setSelectedUserId(userId);
          setViewMode('other-profile');
        }}
      />
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#19191A' 
    }}>
      {/* TOP BAR / NAV - Large Variant */}
      <div 
        className="chat-topbar"
        style={{
          height: '160px',
          backgroundColor: '#19191A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative',
          padding: '20px',
          gap: '20px',
        }}
      >
        {/* Top section with title and user info */}
        <div
          style={{
            width: '100%',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
        {/* Left: Burger Menu + Logo */}
        <div 
          style={{
            position: 'absolute',
            left: 'calc((100% - 95%) / 2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Logo */}
          <img 
            src="/logo.png" 
            alt="PolyBanter"
            style={{
              width: '30px',
              height: '30px',
              objectFit: 'contain',
            }}
          />

          {/* Leaderboard Button (Trophy Icon) */}
          <button
            onClick={() => setViewMode('leaderboard')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </button>
        </div>

        {/* PAGE NAME - Center with Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
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
            {activeChatCategory === 'global' && 'Global Chats'}
            {activeChatCategory === 'market' && 'Market Chats'}
            {activeChatCategory === 'private' && 'Private Chats'}
            {activeChatCategory === 'favorites' && 'Favorites'}
          </span>
          {/* Dynamic Icon based on active category */}
          {activeChatCategory === 'global' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          )}
          {activeChatCategory === 'market' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          )}
          {activeChatCategory === 'private' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          )}
          {activeChatCategory === 'favorites' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="url(#starGradientTitle)">
              <defs>
                <radialGradient id="starGradientTitle" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#AE8B2A" />
                  <stop offset="100%" stopColor="#8F6B17" />
                </radialGradient>
              </defs>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          )}
        </div>

        {/* USER INFO - Right Side */}
        <div 
          style={{
            position: 'absolute',
            right: 'calc((100% - 95%) / 2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* USERNAME */}
          <span 
            style={{
              fontSize: '10px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              color: '#A8A3A3',
              fontWeight: '300',
            }}
          >
            {user?.display_name || user?.username || 'User'}
          </span>

          {/* USER PFP */}
          <div
            ref={pfpRef}
            className="user-pfp"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <RankedPFP 
              rank={user?.rank || 'RECRUIT'} 
              size="tiny" 
              showRankLabel={false}
              borderOnly={true}
              avatarUrl={user?.avatar_url}
            />
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#FF4444',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  border: '2px solid #19191A',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </div>

        {/* Profile Dropdown */}
        <ProfileDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          onViewProfile={() => setViewMode('profile')}
          onSettings={() => setViewMode('settings')}
          onLogout={() => {
            logout();
            setViewMode('chats');
          }}
          anchorEl={pfpRef.current}
        />
        </div>

        {/* BUTTON SECTION */}
        <div 
          className="button-container"
          style={{
            width: '95%',
            height: '60px',
            backgroundColor: '#19191A',
            borderRadius: '30px',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 15px',
            gap: '10px',
          }}
        >
          {/* Left buttons group */}
          <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
            {/* Button 1: Global Chats */}
            <button
              onClick={() => setActiveChatCategory('global')}
              className="nav-button"
              style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: activeChatCategory === 'global' ? 0.5 : 1,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </button>

            {/* Button 2: Market Chats */}
            <button
              onClick={() => setActiveChatCategory('market')}
              className="nav-button"
              style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: activeChatCategory === 'market' ? 0.5 : 1,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </button>

            {/* Button 3: Private Chats */}
            <button
              onClick={() => setActiveChatCategory('private')}
              className="nav-button"
              style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: activeChatCategory === 'private' ? 0.5 : 1,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </button>
          </div>

          {/* Separator */}
          <div
            className="nav-separator"
            style={{
              width: '10px',
              height: '25px',
              borderRadius: '5px',
              backgroundColor: '#19191A',
            }}
          />

          {/* Favorites Button */}
          <button
            onClick={() => setActiveChatCategory('favorites')}
            className="nav-button-favorite"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: activeChatCategory === 'favorites' ? 0.5 : 1,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="url(#starGradient)">
              <defs>
                <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#AE8B2A" />
                  <stop offset="100%" stopColor="#8F6B17" />
                </radialGradient>
              </defs>
              <polygon points="12,2 15,8.5 22,9.5 17,14.5 18,21.5 12,18 6,21.5 7,14.5 2,9.5 9,8.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div 
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0',
          gap: '20px',
        }}
      >
        {/* Search Input + New Chat Button Container */}
        <div 
          style={{
            width: '95%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 15px',
          }}
        >
          {/* Search Input Container */}
          <div
            className="search-input-container"
            style={{
              flex: 1,
              height: '60px',
              backgroundColor: '#19191A',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #6D6D6D, #353535)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              gap: '10px',
            }}
          >
            {/* Search Button */}
            <button
              className="search-button"
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
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats…"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#CBCBCB',
                fontSize: '12px',
                fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '300',
              }}
              className="search-input-field"
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="new-chat-button"
            style={{
              width: '60px',
              height: '60px',
              minWidth: '60px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
          onCreateGroup={handleCreateGroup}
        />

        {/* Division Element */}
        <div
          className="division-element"
          style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#19191A',
          }}
        />
      </div>

      {/* CHAT SECTIONS */}
      <div 
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 0 20px 0',
        }}
      >
        <div style={{
          width: '95%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '0 15px',
        }}>
        {/* AI Feed Announcement */}
        <button
          className="ai-feed-announcement"
          style={{
            width: '100%',
            height: '40px',
            backgroundColor: '#065C60',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#065C60, #065C60), linear-gradient(135deg, #00E4B6, #34DF87)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <span style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '15px',
            color: '#60F6AB',
            fontWeight: '400',
          }}>
            AI Feed
          </span>
          {/* AI Brain/Sparkle Icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#60F6AB">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/>
          </svg>
        </button>

        {/* Dynamic Chat Cards */}
        {isLoading ? (
          <LoadingSkeleton type="chat-card" count={3} />
        ) : filteredChats.length === 0 ? (
          <div style={{
            width: '100%',
            padding: '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
          }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '16px',
                color: '#B9B7B7',
                marginBottom: '5px',
              }}>
                No chats found
              </div>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '12px',
                color: '#707070',
              }}>
                {searchQuery ? 'Try a different search term' : 'No chats in this category'}
              </div>
            </div>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className="chat-card"
          style={{
            width: '100%',
            height: '140px',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
          }}
        >
          {/* Top Half */}
          <div
            className="chat-card-top"
            style={{
              height: '70px',
              backgroundColor: '#19191A',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              border: '1px solid transparent',
              borderBottomLeftRadius: '0',
              borderBottomRightRadius: '0',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
            }}
          >
            {/* Left: Counter + Groups Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '12px',
                background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {chat.participant_count || 0}
              </span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#titleGradient)" strokeWidth="2">
                <defs>
                  <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C0C0C0" />
                    <stop offset="100%" stopColor="#CBCBCB" />
                  </linearGradient>
                </defs>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>

            {/* Center: Chat Name */}
            <span style={{
              fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: (chat.title || chat.name || 'Untitled').length > 20 ? '13px' : '15px',
              background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: '60%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {chat.title || chat.name || 'Untitled'}
            </span>

            {/* Right: AI Insights + Star Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* AI Insights Button - Only for global and market chats */}
              {(chat.type === 'global' || chat.type === 'market') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAiFeed(chat._id);
                  }}
                  className="chat-card-ai-button"
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
                  {chat.has_ai_feed ? (
                    // AI Active - Green gradient globe
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="url(#aiGradientOnCard)" stroke="none">
                      <defs>
                        <linearGradient id="aiGradientOnCard" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60F6AB" />
                          <stop offset="100%" stopColor="#0D7A3F" />
                        </linearGradient>
                      </defs>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/>
                    </svg>
                  ) : (
                    // AI Inactive - Grey globe outline
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#aiGradientOffCard2)" strokeWidth="2">
                      <defs>
                        <linearGradient id="aiGradientOffCard2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#B3B3B3" />
                          <stop offset="100%" stopColor="#888888" />
                        </linearGradient>
                      </defs>
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 2v10l4 2"/>
                      <path d="M4.93 4.93l4.24 4.24"/>
                    </svg>
                  )}
                </button>
              )}

              {/* Star Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(chat._id);
                }}
                className="chat-card-star-button"
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill={chat.is_favorite ? "url(#starGradientOn)" : "none"} stroke={chat.is_favorite ? "none" : "url(#starGradientOff)"} strokeWidth="2">
                  <defs>
                    <radialGradient id="starGradientOn" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FFA500" />
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

          {/* Bottom Half */}
          <div
            className="chat-card-bottom"
            style={{
              height: '70px',
              backgroundColor: '#19191A',
              borderBottomLeftRadius: '20px',
              borderBottomRightRadius: '20px',
              border: '1px solid transparent',
              borderTop: 'none',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0 20px',
            }}
          >
            {/* Last Message Sender PFP with Rank Border (borderOnly mode) */}
            {chat.last_message_id?.sender_id ? (
              <RankedPFP
                rank={chat.last_message_id.sender_id.rank || 'RECRUIT'}
                size="small"
                showRankLabel={false}
                borderOnly={true}
                avatarUrl={chat.last_message_id.sender_id.avatar_url}
              />
            ) : (
              <div
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
                }}
              >
                <span style={{ fontSize: '16px' }}>👤</span>
              </div>
            )}

            {/* Last Message Preview Bubble */}
            <div
              className="text-bubble"
              style={{
                flex: 1,
                minWidth: 0,
                height: '35px',
                backgroundColor: '#242424',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#242424, #242424), linear-gradient(135deg, #918E8E, #484646)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '17.5px 17.5px 17.5px 0',
                display: 'flex',
                alignItems: 'center',
                padding: '0 15px',
                overflow: 'hidden',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <p style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '12px',
                color: '#909090',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}>
                {chat.last_message_id?.text || chat.metadata?.description || 'No messages yet'}
              </p>
              {chat.last_message_id?.created_at && (
                <span style={{
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '10px',
                  color: '#606060',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {new Date(chat.last_message_id.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              )}
            </div>
          </div>
        </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
};

