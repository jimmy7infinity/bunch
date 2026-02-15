import React from 'react';

interface ReplyPreviewProps {
  replyingTo: { messageId: string; username: string; preview: string } | null;
  onClose: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({ replyingTo, onClose }) => {
  if (!replyingTo) return null;
  
  return (
    // PASTE REPLY PREVIEW CODE HERE (lines 2446-2497 from ChatRoom.tsx)
    <div style={{
      width: '90%',
      backgroundColor: '#242424',
      border: '1px solid #333',
      borderRadius: '10px',
      padding: '8px 12px',
      marginTop: '10px',
      marginBottom: '5px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '11px', 
          color: '#5BC854',
          marginBottom: '2px',
          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          Replying to @{replyingTo.username}
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#909090',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          {replyingTo.preview}
        </div>
      </div>
      <button
        onClick={() => onClose()}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
};
