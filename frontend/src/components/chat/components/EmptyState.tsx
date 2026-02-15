import React from 'react';

interface EmptyStateProps {
  chatName: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ chatName }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      padding: '40px 20px',
    }}>
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="9" y1="10" x2="15" y2="10"/>
        <line x1="9" y1="14" x2="13" y2="14"/>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '18px',
          color: '#B9B7B7',
          marginBottom: '8px',
        }}>
          No messages yet
        </div>
        <div style={{
          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '13px',
          color: '#707070',
          maxWidth: '250px',
        }}>
          Be the first to send a message in this chat
        </div>
      </div>
    </div>
  );
};
