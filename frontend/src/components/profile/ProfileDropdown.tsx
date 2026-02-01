import React, { useRef, useEffect } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import './ProfileDropdown.css';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
  anchorEl: HTMLElement | null;
  onNavigateToChat?: (conversationId: string) => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  onViewProfile,
  onSettings,
  onLogout,
  anchorEl,
  onNavigateToChat,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorEl]);

  if (!isOpen || !anchorEl) return null;

  // Position dropdown below the anchor element
  const rect = anchorEl.getBoundingClientRect();
  
  // Calculate width as 95% of viewport width and center it
  const dropdownWidth = window.innerWidth * 0.95;
  const leftPosition = (window.innerWidth - dropdownWidth) / 2;
  
  const dropdownStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${rect.bottom + 10}px`,
    left: `${leftPosition}px`,
    width: `${dropdownWidth}px`,
    zIndex: 1000,
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        );
      case 'friend_request':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        );
      case 'mention':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
            <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z"/>
            <path d="M9 9l1.5 3.5L14 14 12.5 10.5z"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="profile-dropdown"
      style={dropdownStyle}
    >
      <div
        className="dropdown-menu"
        style={{
          backgroundColor: '#19191A',
          border: '1px solid transparent',
          backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          borderRadius: '15px',
          padding: '15px',
          display: 'flex',
          gap: '15px',
          width: '100%',
        }}
      >
        {/* LEFT COLUMN: Notifications */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          minWidth: '0', // Allow flex shrink
        }}>
          {/* Notifications Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '10px',
            borderBottom: '1px solid #333333',
          }}>
            <span style={{
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}>
              Notifications
            </span>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '11px',
                  color: '#5BC854',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List - Scrollable */}
          <div style={{
            overflowY: 'auto',
            maxHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '5px',
          }}>
            {notifications.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '12px',
                color: '#707070',
              }}>
                No notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    // Navigate to chat if conversationId exists
                    if (onNavigateToChat && (notif as any).conversationId) {
                      onNavigateToChat((notif as any).conversationId);
                      onClose();
                    }
                  }}
                  style={{
                    backgroundColor: notif.read ? '#1A1A1A' : '#1F2A1F',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: notif.read ? '1px solid #2A2A2A' : '1px solid #5BC85450',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#252525'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? '#1A1A1A' : '#1F2A1F'}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    {getNotificationIcon(notif.type)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        marginBottom: '4px',
                      }}>
                        {notif.title}
                      </div>
                      <div style={{
                        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '11px',
                        color: '#B9B7B7',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '200px',
                      }}>
                        {notif.message.length > 40 ? notif.message.substring(0, 40) + '...' : notif.message}
                      </div>
                      <div style={{
                        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '10px',
                        color: '#707070',
                        marginTop: '4px',
                      }}>
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notif.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        color: '#707070',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* VERTICAL DIVIDER */}
        <div style={{
          width: '1px',
          backgroundColor: '#333333',
          alignSelf: 'stretch',
        }} />

        {/* RIGHT COLUMN: Menu */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          minWidth: '160px',
        }}>
        {/* View Profile */}
        <button
          onClick={() => {
            onViewProfile();
            onClose();
          }}
          className="dropdown-item"
          style={{
            width: '100%',
            padding: '12px 15px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '13px',
            color: '#B9B7B7',
          }}>
            View My Profile
          </span>
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            onSettings();
            onClose();
          }}
          className="dropdown-item"
          style={{
            width: '100%',
            padding: '12px 15px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
          </svg>
          <span style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '13px',
            color: '#B9B7B7',
          }}>
            Settings
          </span>
        </button>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: '#333333',
          margin: '5px 0',
        }} />

        {/* Logout */}
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="dropdown-item dropdown-item-danger"
          style={{
            width: '100%',
            padding: '12px 15px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C85454" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '13px',
            color: '#C85454',
          }}>
            Logout
          </span>
        </button>
        </div>
      </div>
    </div>
  );
};



