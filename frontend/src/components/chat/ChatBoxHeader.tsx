import type { ChatRoom as ChatRoomType } from '../../types';
import { PositionPicker } from './PositionPicker';

interface ChatBoxHeaderProps {
  conversation: ChatRoomType;
  onlineCount: number;
  onMembersClick: () => void;
  myPosition: 'yes' | 'no' | null;
  onPositionChange: (position: 'yes' | 'no' | null) => void;
}

export const ChatBoxHeader = ({
  conversation,
  onlineCount,
  onMembersClick,
  myPosition,
  onPositionChange,
}: ChatBoxHeaderProps) => {
  const getChatTypeIcon = () => {
    if (conversation.type === 'global') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      );
    } else if (conversation.type === 'market') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      );
    }
  };

  return (
    <div
      className="chat-heading"
      style={{
        width: '90%',
        height: '50px',
        backgroundColor: '#242424',
        border: '1px solid transparent',
        backgroundImage: 'linear-gradient(#242424, #242424), linear-gradient(135deg, #4D4D4D, #333333)',
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
        onClick={onMembersClick}
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

      {/* Right: Position Picker (for market chats) + Online Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Position Picker - Only for market chats */}
        {conversation.type === 'market' && conversation.market_id && (
          <PositionPicker
            marketId={conversation.market_id}
            myPosition={myPosition}
            onPositionChange={onPositionChange}
          />
        )}

        {/* Online Indicator */}
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
    </div>
  );
};
