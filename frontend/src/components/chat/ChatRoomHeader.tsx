import { useState } from 'react';
import type { ChatRoom as ChatRoomType } from '../../types';

interface ChatRoomHeaderProps {
  conversation: ChatRoomType;
  onBack?: () => void;
  isFavorite: boolean;
  hasNotifications: boolean;
  hasAINotifications: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: any[];
  onToggleFavorite: () => void;
  onToggleNotifications: () => void;
  onToggleAINotifications: () => void;
  onSearchToggle: () => void;
  onSearchChange: (query: string) => void;
  onSearchResultClick: (messageId: string) => void;
}

export const ChatRoomHeader = ({
  conversation,
  onBack,
  isFavorite,
  hasNotifications,
  hasAINotifications,
  isSearchOpen,
  searchQuery,
  searchResults,
  onToggleFavorite,
  onToggleNotifications,
  onToggleAINotifications,
  onSearchToggle,
  onSearchChange,
  onSearchResultClick,
}: ChatRoomHeaderProps) => {
  const chatName = conversation.title || conversation.name || 'Chat';
  const chatType = conversation.type;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div
      className="top-bar"
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
      {/* Left: Back + Search Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '80px' }}>
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#B9B7B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={onSearchToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isSearchOpen ? '#5BC854' : '#B9B7B7'} strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>

      {/* Search Input - Slides in when search is active */}
      {isSearchOpen && (
        <div style={{
          position: 'absolute',
          left: '90px',
          right: '150px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#242424',
          borderRadius: '12px',
          padding: '8px 12px',
          gap: '8px',
          zIndex: 10,
        }}>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#CBCBCB',
              fontSize: '13px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          />
          {/* Close button - always visible */}
          <button
            onClick={onSearchToggle}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              color: '#707070',
              fontSize: '16px',
            }}
          >
            ✕
          </button>

          {/* Search Results */}
          {searchQuery.trim() && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: '#242424',
              border: '1px solid #333333',
              borderRadius: '12px',
              padding: '8px',
              zIndex: 100,
            }}>
              {searchResults.map((result) => {
                const queryLower = searchQuery.toLowerCase();
                const textLower = result.text.toLowerCase();
                const index = textLower.indexOf(queryLower);
                const contextStart = Math.max(0, index - 30);
                const contextEnd = Math.min(result.text.length, index + queryLower.length + 30);
                const contextText = (contextStart > 0 ? '...' : '') + 
                                  result.text.substring(contextStart, contextEnd) + 
                                  (contextEnd < result.text.length ? '...' : '');
                
                return (
                  <button
                    key={result.id}
                    onClick={() => onSearchResultClick(result.id)}
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
                      {result.username} • {formatTime(result.timestamp)}
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
          fontSize: chatName.length > 20 ? '13px' : '15px',
          fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
          background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '400',
          maxWidth: 'calc(100% - 300px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          margin: 0,
        }}
      >
        {chatName}
      </h1>

      {/* RIGHT SECTION MOVED TO CHATBOX HEADER BELOW */}

      {/* Right: Bell + Star Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '80px', justifyContent: 'flex-end' }}>
        {/* Push Notifications Bell Button - Blue when active */}
        <button
          onClick={onToggleNotifications}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke={hasNotifications ? '#4D9FEB' : '#B9B7B7'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={hasNotifications ? '#4D9FEB' : 'none'}
            />
            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke={hasNotifications ? '#4D9FEB' : '#B9B7B7'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* AI Feed Button - Only for global/market chats - Green when active */}
        {(chatType === 'global' || chatType === 'market') && (
          <button
            onClick={onToggleAINotifications}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={hasAINotifications ? '#5BC854' : '#B9B7B7'} strokeWidth="2" fill={hasAINotifications ? '#5BC854' : 'none'} />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={hasAINotifications ? '#19191A' : '#B9B7B7'} strokeWidth="2" strokeLinecap="round" />
              <line x1="9" y1="9" x2="9" y2="9" stroke={hasAINotifications ? '#19191A' : '#B9B7B7'} strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="9" x2="15" y2="9" stroke={hasAINotifications ? '#19191A' : '#B9B7B7'} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Star Button */}
        <button
          onClick={onToggleFavorite}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? '#FFD700' : 'none'}>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              stroke={isFavorite ? '#FFD700' : '#B9B7B7'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
