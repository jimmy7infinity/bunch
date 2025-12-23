import { useState, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { ChatRoom } from './ChatRoom';
import { UserProfile } from '../profile/UserProfile';
import { Settings } from '../profile/Settings';
import { ProfileDropdown } from '../profile/ProfileDropdown';
import { CreateGroupModal } from './CreateGroupModal';
import './ChatsList.css';

type ViewMode = 'chats' | 'chat' | 'profile' | 'settings' | 'other-profile';

export const ChatsList = () => {
  const { user, logout } = useAuthStore();
  const [selectedChat, setSelectedChat] = useState<{ name: string; type: 'global' | 'market' | 'private'; count: number } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('chats');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const pfpRef = useRef<HTMLDivElement>(null);

  const handleCreateGroup = (groupName: string, selectedFriends: string[]) => {
    console.log('Creating group:', groupName, 'with friends:', selectedFriends);
    // TODO: Implement actual group creation API call
  };

  // Handle chat selection
  if (selectedChat && viewMode === 'chats') {
    return (
      <ChatRoom 
        chatName={selectedChat.name}
        chatType={selectedChat.type}
        onlineCount={selectedChat.count}
        onBack={() => setSelectedChat(null)}
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
          {/* Burger Menu */}
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

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
        </div>

        {/* PAGE NAME - Center */}
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
          Global Chats
        </h1>

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
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              border: '1px solid #888888',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#2A2A2A',
              overflow: 'hidden',
              filter: 'grayscale(100%)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '24px' }}>👤</span>
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#60F6AB">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#60F6AB" fill="none" strokeWidth="2"/>
          </svg>
        </button>

        {/* Chat Card Example - Politics */}
        <button
          onClick={() => setSelectedChat({ name: 'Politics', type: 'global', count: 332 })}
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
                332
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
              fontSize: '15px',
              background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}>
              Politics
            </span>

            {/* Right: Bell + Star Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Bell Button */}
              <button
                className="chat-card-bell-button"
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="url(#bellGradientOff)">
                  <defs>
                    <linearGradient id="bellGradientOff" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#B3B3B3" />
                      <stop offset="100%" stopColor="#888888" />
                    </linearGradient>
                  </defs>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="url(#bellGradientOff)" fill="none" strokeWidth="2"/>
                </svg>
              </button>

              {/* Star Button */}
              <button
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="url(#starGradientOff)">
                  <defs>
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
            {/* User PFP */}
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
                filter: 'grayscale(100%)',
              }}
            >
              <span style={{ fontSize: '16px' }}>👤</span>
            </div>

            {/* Text Bubble */}
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
                width: '100%',
              }}>
                It is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
              </p>
            </div>
          </div>
        </button>
        </div>
      </div>
    </div>
  );
};
