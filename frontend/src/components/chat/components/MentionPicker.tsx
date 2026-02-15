import React from 'react';
import { RankedPFP } from '../../common/RankedPFP';

interface MentionPickerProps {
  isOpen: boolean;
  filteredUsers: any[];
  onSelectUser: (username: string) => void;
  mentionPickerRef: React.RefObject<HTMLDivElement>;
}

export const MentionPicker: React.FC<MentionPickerProps> = ({
  isOpen,
  filteredUsers,
  onSelectUser,
  mentionPickerRef,
}) => {
  if (!isOpen) return null;
  
  return (
    <div 
      ref={mentionPickerRef}
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '20px',
        right: '20px',
        maxHeight: '200px',
        backgroundColor: '#19191A',
        border: '1px solid transparent',
        backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        borderRadius: '20px',
        padding: '10px',
        overflowY: 'auto',
        zIndex: 100,
        boxShadow: '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      {filteredUsers.length === 0 ? (
        <div style={{ 
          padding: '10px', 
          color: '#707070', 
          textAlign: 'center',
          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '13px',
        }}>
          No users found
        </div>
      ) : (
        filteredUsers.map((u) => (
        <button
          key={u._id || u.id}
          onClick={() => onSelectUser(u.username)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '10px',
            color: '#D3D3D3',
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '13px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#242424'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <RankedPFP
            rank={u.rank || 'RECRUIT'}
            size="tiny"
            showRankLabel={false}
            avatarUrl={u.avatar_url}
          />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div>{u.display_name || u.username}</div>
            <div style={{
              fontSize: '10px',
              color: '#707070',
              background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {u.rank || 'RECRUIT'}
            </div>
          </div>
        </button>
        ))
      )}
    </div>
  );
};
