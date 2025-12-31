import React, { useRef, useEffect } from 'react';
import './ProfileDropdown.css';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
  anchorEl: HTMLElement | null;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  onViewProfile,
  onSettings,
  onLogout,
  anchorEl,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const dropdownStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${rect.bottom + 10}px`,
    right: `${window.innerWidth - rect.right}px`,
    zIndex: 1000,
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
          backgroundColor: '#242424',
          border: '1px solid transparent',
          backgroundImage: 'linear-gradient(#242424, #242424), linear-gradient(135deg, #707070, #333333)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          borderRadius: '15px',
          padding: '10px',
          minWidth: '180px',
        }}
      >
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
  );
};

