import React, { useState, useEffect } from 'react';
import { friendService } from '../../services/api';
import { RankedPFP } from '../common/RankedPFP';
import type { User } from '../../types';
import './CreateGroupModal.css';

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
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load friends from API
  useEffect(() => {
    const loadFriends = async () => {
      if (isOpen) {
        try {
          setIsLoading(true);
          const friendsList = await friendService.getFriends();
          setFriends(friendsList);
        } catch (error) {
          console.error('Failed to load friends:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadFriends();
  }, [isOpen]);

  const filteredFriends = friends.filter(friend =>
    (friend.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (friend.display_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
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
    // For single friend, no group name needed
    // For multiple friends, group name is required
    const canCreate = selectedFriends.size === 1 || (selectedFriends.size > 1 && groupName.trim());
    if (canCreate) {
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
        className="modal-content bio-section"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#19191A',
          border: '1px solid transparent',
          backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
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
            Create Chat / Group Chat
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

        {/* Group Name Input - only show if more than 1 friend selected */}
        {selectedFriends.size > 1 && (
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
              className="nav-button"
              style={{
                width: '100%',
                height: '45px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '10px',
                padding: '0 15px',
                fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '13px',
                color: '#D3D3D3',
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Search Friends */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#B9B7B7',
            }}>
              Add Friends ({selectedFriends.size} selected)
            </label>
            {selectedFriends.size > 0 && (
              <button
                onClick={() => setSelectedFriends(new Set())}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '12px',
                  color: '#C85454',
                }}
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="nav-button"
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
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
          gap: '0',
          maxHeight: '300px',
        }}>
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#707070',
            }}>
              Loading friends...
            </div>
          ) : filteredFriends.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#707070',
            }}>
              {friends.length === 0 ? 'No friends yet' : 'No friends found'}
            </div>
          ) : (
            filteredFriends.map((friend, index) => {
              const friendId = friend._id || friend.id;
              return (
                <React.Fragment key={friendId}>
                  <div
                    onClick={() => toggleFriend(friendId)}
                    className="friend-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: selectedFriends.has(friendId) ? '12px' : '10px 0',
                      backgroundColor: selectedFriends.has(friendId) ? '#1A2A1A' : 'transparent',
                      border: selectedFriends.has(friendId) ? '1px solid #5BC854' : '1px solid transparent',
                      borderRadius: selectedFriends.has(friendId) ? '10px' : '0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      margin: selectedFriends.has(friendId) ? '5px 0' : '0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <RankedPFP 
                        rank={friend.rank || 'RECRUIT'} 
                        size="small" 
                        showRankLabel={false}
                        avatarUrl={friend.avatar_url}
                      />
                      <span style={{
                        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '13px',
                        color: '#D3D3D3',
                      }}>
                        {friend.display_name || friend.username}
                      </span>
                    </div>
                    {selectedFriends.has(friendId) && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  {/* Horizontal separator (not for last item, and only show if not selected) */}
                  {index < filteredFriends.length - 1 && !selectedFriends.has(friendId) && (
                    <div style={{
                      height: '1px',
                      backgroundColor: '#333333',
                      margin: '5px 0',
                    }} />
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            className="modal-button-secondary nav-button"
            style={{
              flex: 1,
              height: '45px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '20px',
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
            disabled={selectedFriends.size === 0 || (selectedFriends.size > 1 && !groupName.trim())}
            className="modal-button-primary nav-button"
            style={{
              flex: 1,
              height: '45px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: (selectedFriends.size === 1 || (selectedFriends.size > 1 && groupName.trim()))
                ? 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #5BC854, #3A8A3A)'
                : 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '20px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '14px',
              color: (selectedFriends.size === 1 || (selectedFriends.size > 1 && groupName.trim())) ? '#5BC854' : '#606060',
              cursor: (selectedFriends.size === 1 || (selectedFriends.size > 1 && groupName.trim())) ? 'pointer' : 'not-allowed',
            }}
          >
            {selectedFriends.size === 1 ? 'Create Chat' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};



