import React, { useState } from 'react';
import './CreateGroupModal.css';

interface Friend {
  id: string;
  username: string;
  pfp: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string, selectedFriends: string[]) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Mock friends data - will be replaced with actual API call
  const friends: Friend[] = [
    { id: '1', username: 'friend_one', pfp: '👤' },
    { id: '2', username: 'friend_two', pfp: '👤' },
    { id: '3', username: 'friend_three', pfp: '👤' },
    { id: '4', username: 'friend_four', pfp: '👤' },
    { id: '5', username: 'friend_five', pfp: '👤' },
  ];

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleCreate = () => {
    if (groupName.trim() && selectedFriends.size > 0) {
      onCreateGroup(groupName, Array.from(selectedFriends));
      setGroupName('');
      setSelectedFriends(new Set());
      setSearchQuery('');
      onClose();
    }
  };

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
          <h2 style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '18px',
            background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
          }}>
            Create Group Chat
          </h2>
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

        {/* Group Name Input */}
        <div>
          <label style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '12px',
            color: '#B9B7B7',
            display: 'block',
            marginBottom: '8px',
          }}>
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name..."
            style={{
              width: '100%',
              height: '45px',
              backgroundColor: '#19191A',
              border: '1px solid #333333',
              borderRadius: '10px',
              padding: '0 15px',
              fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '13px',
              color: '#D3D3D3',
              outline: 'none',
            }}
          />
        </div>

        {/* Search Friends */}
        <div>
          <label style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '12px',
            color: '#B9B7B7',
            display: 'block',
            marginBottom: '8px',
          }}>
            Add Friends ({selectedFriends.size} selected)
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: '#19191A',
              border: '1px solid #333333',
              borderRadius: '10px',
              padding: '0 15px',
              fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#D3D3D3',
              outline: 'none',
            }}
          />
        </div>

        {/* Friends List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '300px',
        }}>
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => toggleFriend(friend.id)}
              className="friend-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: selectedFriends.has(friend.id) ? '#2A3A2A' : '#19191A',
                border: `1px solid ${selectedFriends.has(friend.id) ? '#5BC854' : '#333333'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  border: '2px solid #888888',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#2A2A2A',
                  filter: 'grayscale(100%)',
                }}>
                  <span style={{ fontSize: '16px' }}>{friend.pfp}</span>
                </div>
                <span style={{
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '13px',
                  color: '#D3D3D3',
                }}>
                  {friend.username}
                </span>
              </div>
              {selectedFriends.has(friend.id) && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            className="modal-button-secondary"
            style={{
              flex: 1,
              height: '45px',
              backgroundColor: '#19191A',
              border: '1px solid #333333',
              borderRadius: '10px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '14px',
              color: '#B9B7B7',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedFriends.size === 0}
            className="modal-button-primary"
            style={{
              flex: 1,
              height: '45px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: selectedFriends.size > 0 && groupName.trim() 
                ? 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #5BC854, #082724)'
                : 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #333333, #1A1A1A)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '10px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '14px',
              color: selectedFriends.size > 0 && groupName.trim() ? '#5BC854' : '#606060',
              cursor: selectedFriends.size > 0 && groupName.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};
