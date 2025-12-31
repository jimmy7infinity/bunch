import React from 'react';
import './GroupMembersModal.css';

interface Member {
  id: string;
  username: string;
  pfp: string;
  rank: string;
  isOnline: boolean;
}

interface GroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatName: string;
  members: Member[];
  onMemberClick: (userId: string) => void;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  isOpen,
  onClose,
  chatName,
  members,
  onMemberClick,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#242424',
          border: '1px solid transparent',
          backgroundImage: 'linear-gradient(#242424, #242424), linear-gradient(135deg, #707070, #333333)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          borderRadius: '20px',
          padding: '30px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{
              fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '18px',
              background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 5px 0',
            }}>
              {chatName}
            </h2>
            <span style={{
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#707070',
            }}>
              {members.length} members • {members.filter(m => m.isOnline).length} online
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Members List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {members.map((member) => (
            <div
              key={member.id}
              onClick={() => {
                onMemberClick(member.id);
                onClose();
              }}
              className="member-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#19191A',
                border: '1px solid #333333',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* PFP with online indicator */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #888888',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#2A2A2A',
                    filter: 'grayscale(100%)',
                  }}>
                    <span style={{ fontSize: '20px' }}>{member.pfp}</span>
                  </div>
                  {/* Online indicator */}
                  {member.isOnline && (
                    <div
                      className="online-indicator-small"
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #4DEB97, #2B9522)',
                        border: '2px solid #19191A',
                      }}
                    />
                  )}
                </div>

                {/* Username and Rank */}
                <div>
                  <div style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '13px',
                    color: '#D3D3D3',
                    marginBottom: '3px',
                  }}>
                    {member.username}
                  </div>
                  <div style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '11px',
                    color: '#707070',
                  }}>
                    {member.rank}
                  </div>
                </div>
              </div>

              {/* Arrow icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


