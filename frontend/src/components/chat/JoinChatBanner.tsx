import React from 'react';

interface JoinChatBannerProps {
  contextType: 'market' | 'category';
  title: string;
  onJoin: () => void;
  loading?: boolean;
}

/**
 * Clean banner component prompting user to join a chat
 * Shown when auto-join is disabled
 */
export const JoinChatBanner: React.FC<JoinChatBannerProps> = ({
  contextType,
  title,
  onJoin,
  loading = false,
}) => {
  const icon = contextType === 'market' ? (
    // Chart icon for markets
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A9BCC" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ) : (
    // Folder/Category icon
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A9BCC" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );

  return (
    <button
      onClick={onJoin}
      disabled={loading}
      style={{
        width: '100%',
        height: '44px',
        backgroundColor: '#3D3A60',
        border: '1px solid transparent',
        backgroundImage: 'linear-gradient(#3D3A60, #3D3A60), linear-gradient(135deg, #7A9BCC, #5C6B8A)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        padding: '0 16px',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(122, 155, 204, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {icon}
      <span style={{
        fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '13px',
        color: '#7A9BCC',
        fontWeight: '500',
        maxWidth: '70%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {loading ? 'Joining...' : `Join: ${title}`}
      </span>
    </button>
  );
};
