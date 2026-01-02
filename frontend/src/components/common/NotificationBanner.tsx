import { useEffect, useState } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import type { Notification } from '../../stores/notificationStore';
import './NotificationBanner.css';

const BANNER_DURATION = 4000; // 4 seconds

export const NotificationBanner = () => {
  const { bannerQueue, removeBanner, markAsRead } = useNotificationStore();
  const [currentBanner, setCurrentBanner] = useState<Notification | null>(null);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create a simple notification beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  // Show next banner from queue
  useEffect(() => {
    if (bannerQueue.length > 0 && !currentBanner) {
      const nextBanner = bannerQueue[0];
      setCurrentBanner(nextBanner);
      playNotificationSound();
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setCurrentBanner(null);
        removeBanner(nextBanner.id);
      }, BANNER_DURATION);

      return () => clearTimeout(timer);
    }
  }, [bannerQueue, currentBanner, removeBanner]);

  if (!currentBanner) return null;

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'message': return '#5BC854';
      case 'friend_request': return '#60A5FA';
      case 'mention': return '#F59E0B';
      case 'reaction': return '#EC4899';
      case 'system': return '#8B5CF6';
      default: return '#707070';
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        );
      case 'friend_request':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        );
      case 'mention':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="12" y1="2" x2="12" y2="6"/>
          </svg>
        );
      case 'reaction':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
    }
  };

  const typeColor = getTypeColor(currentBanner.type);

  return (
    <div
      className="notification-banner-container"
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <div
        onClick={() => {
          markAsRead(currentBanner.id);
          setCurrentBanner(null);
          removeBanner(currentBanner.id);
        }}
        style={{
          minWidth: '320px',
          maxWidth: '500px',
          backgroundColor: '#19191A',
          border: `1px solid ${typeColor}`,
          borderRadius: '15px',
          padding: '15px 20px',
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(91, 200, 84, 0.1)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Icon */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: `${typeColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: typeColor,
          flexShrink: 0,
        }}>
          {getTypeIcon(currentBanner.type)}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginBottom: '4px',
          }}>
            {currentBanner.title}
          </div>
          <div style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '12px',
            color: '#B9B7B7',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '350px',
          }}>
            {currentBanner.message.length > 50 ? currentBanner.message.substring(0, 50) + '...' : currentBanner.message}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentBanner(null);
            removeBanner(currentBanner.id);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#707070',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

