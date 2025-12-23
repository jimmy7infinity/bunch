import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import './ChatRoom.css';

interface ChatRoomProps {
  chatName?: string;
  chatType?: 'global' | 'market' | 'private';
  onlineCount?: number;
  onBack?: () => void;
}

export const ChatRoom = ({ 
  chatName = 'Politics', 
  chatType = 'global',
  onlineCount = 332,
  onBack 
}: ChatRoomProps) => {
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

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
      case 'private':
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

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
          {/* Bell Button */}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill={hasNotifications ? "url(#bellGradientOn)" : "url(#bellGradientOff)"}>
              <defs>
                <linearGradient id="bellGradientOn" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2FC47F" />
                  <stop offset="100%" stopColor="#27BA9F" />
                </linearGradient>
                <linearGradient id="bellGradientOff" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B3B3B3" />
                  <stop offset="100%" stopColor="#888888" />
                </linearGradient>
              </defs>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={hasNotifications ? "#2FC47F" : "#888888"} fill="none" strokeWidth="2"/>
            </svg>
          </button>

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

          {/* Center: Groups Icon + Online Count */}
          <div style={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}>
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
          </div>

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
          }}>
            {/* AI Message */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%',
              gap: '4px',
            }}>
              {/* Time - centered above bubble */}
              <span style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '10px',
                color: '#707070',
                textAlign: 'center',
              }}>
                14:30
              </span>

              <div
                style={{
                  backgroundColor: '#065C60',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#065C60, #065C60), linear-gradient(135deg, #00E4B6, #34DF87)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  padding: '8px 12px',
                  width: '100%',
                }}
              >
                {/* Username */}
                <span style={{
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '10px',
                  color: '#60F6AB',
                  display: 'block',
                  marginBottom: '4px',
                  textAlign: 'center',
                }}>
                  AI Insight
                </span>

                {/* Message Text */}
                <p style={{
                  fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '12px',
                  color: '#60F6AB',
                  margin: '0 0 4px 0',
                }}>
                  Welcome to the Politics chat! This is an AI-generated message.
                </p>

                {/* Reply, Reaction, Menu */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  {/* Left: Reply + Smile */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60F6AB" strokeWidth="2">
                        <polyline points="9 17 4 12 9 7"/>
                        <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                      </svg>
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60F6AB" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                        <line x1="9" y1="9" x2="9.01" y2="9"/>
                        <line x1="15" y1="9" x2="15.01" y2="9"/>
                      </svg>
                    </button>
                  </div>

                  {/* Right: 3 dots */}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#60F6AB">
                      <circle cx="5" cy="12" r="2"/>
                      <circle cx="12" cy="12" r="2"/>
                      <circle cx="19" cy="12" r="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Example message from other user */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '4px',
              width: '100%',
            }}>
              {/* Time - centered above bubble */}
              <span style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '10px',
                color: '#707070',
                textAlign: 'center',
              }}>
                14:32
              </span>

              <div style={{ 
                display: 'flex', 
                gap: '5px',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}>
                {/* Chat Bubble */}
                <div
                  className="chat-bubble-other"
                  style={{
                    backgroundColor: '#242424',
                    border: '1px solid transparent',
                    backgroundImage: 'linear-gradient(#242424, #242424), linear-gradient(135deg, #707070, #333333)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    borderRadius: '32.5px 32.5px 0 32.5px',
                    padding: '8px 12px',
                    maxWidth: 'calc(100% - 65px)',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {/* Username */}
                  <span style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '10px',
                    color: '#606060',
                    display: 'block',
                    marginBottom: '4px',
                    textAlign: 'center',
                  }}>
                    demo_user
                  </span>

                  {/* Message Text */}
                  <p style={{
                    fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '12px',
                    color: '#D3D3D3',
                    margin: '0 0 4px 0',
                  }}>
                    This is an example message from another user in the chat.
                  </p>

                  {/* Reply, Reaction, Menu */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    {/* Left: Reply + Smile */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                          <polyline points="9 17 4 12 9 7"/>
                          <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                        </svg>
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                          <line x1="9" y1="9" x2="9.01" y2="9"/>
                          <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                      </button>
                    </div>

                    {/* Right: 3 dots */}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#707070">
                        <circle cx="5" cy="12" r="2"/>
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="19" cy="12" r="2"/>
                      </svg>
                    </button>
                  </div>
                </div>

              {/* Right: PFP + Rank */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '5px',
              }}>
                {/* PFP */}
                <div
                  className="message-pfp"
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '2px solid #888888',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#2A2A2A',
                    overflow: 'hidden',
                    filter: 'grayscale(100%)',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>👤</span>
                </div>

                {/* User Rank Badge */}
                <div
                  className="user-rank-badge"
                  style={{
                    width: '50px',
                    height: '13px',
                    backgroundColor: '#2A2A2A',
                    border: '2px solid transparent',
                    backgroundImage: 'linear-gradient(#2A2A2A, #2A2A2A), linear-gradient(135deg, #888888, #555555)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    borderRadius: '6.5px',
                  }}
                />
              </div>
            </div>

            {/* Example message from self */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '4px',
              width: '100%',
            }}>
              {/* Time - centered */}
              <span style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '10px',
                color: '#707070',
                textAlign: 'center',
              }}>
                14:35
              </span>

              <div style={{ 
                display: 'flex', 
                gap: '5px',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
              }}>
                {/* Left: PFP + Rank */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                }}>
                  {/* PFP */}
                  <div
                    className="message-pfp"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: '2px solid #888888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#2A2A2A',
                      overflow: 'hidden',
                      filter: 'grayscale(100%)',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>👤</span>
                  </div>

                  {/* User Rank Badge */}
                  <div
                    className="user-rank-badge"
                    style={{
                      width: '50px',
                      height: '13px',
                      backgroundColor: '#2A2A2A',
                      border: '2px solid #888888',
                      borderRadius: '6.5px',
                    }}
                  />
                </div>

                {/* Chat Bubble */}
                <div
                  className="chat-bubble-self"
                  style={{
                    backgroundColor: '#5A5A5A',
                    border: '1px solid transparent',
                    backgroundImage: 'linear-gradient(#5A5A5A, #5A5A5A), linear-gradient(135deg, #707070, #333333)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    borderRadius: '32.5px 32.5px 32.5px 0',
                    padding: '8px 12px',
                    maxWidth: 'calc(100% - 65px)',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {/* Username */}
                  <span style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '10px',
                    color: '#909090',
                    display: 'block',
                    marginBottom: '4px',
                    textAlign: 'center',
                  }}>
                    You
                  </span>

                  {/* Message Text */}
                  <p style={{
                    fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '12px',
                    color: '#D3D3D3',
                    margin: '0 0 4px 0',
                  }}>
                    This is my message response!
                  </p>

                  {/* Reply, Delivered, Menu */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    {/* Left: Reply + Delivered */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="2">
                          <polyline points="9 17 4 12 9 7"/>
                          <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                        </svg>
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                    </div>

                    {/* Right: 3 dots */}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#A8A8A8">
                        <circle cx="5" cy="12" r="2"/>
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="19" cy="12" r="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* MESSAGE INPUT */}
      <div 
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '0 0 20px 0',
        }}
      >
        <div
          className="message-input-container"
          style={{
            width: '90%',
            height: '60px',
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
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #5BC854, #082724)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here…"
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
            className="message-input-field"
          />
        </div>
      </div>
    </div>
  );
};
