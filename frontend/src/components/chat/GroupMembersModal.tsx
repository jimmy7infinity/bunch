import React, { useState, useEffect, useRef } from 'react';
import { roomService } from '../../services/api';
import { RankedPFP } from '../common/RankedPFP';
import './GroupMembersModal.css';

interface GroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatName: string;
  conversationId: string;
  onMemberClick: (userId: string) => void;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  isOpen,
  onClose,
  chatName,
  conversationId,
  onMemberClick,
}) => {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const observerTarget = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 50;

  // Load initial participants
  useEffect(() => {
    if (isOpen && conversationId) {
      loadParticipants(true);
    }
  }, [isOpen, conversationId]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerTarget.current || !hasMore || isLoading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadParticipants(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadingMore, members.length]);

  const loadParticipants = async (reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setMembers([]);
      } else {
        setLoadingMore(true);
      }

      const offset = reset ? 0 : members.length;
      const result = await roomService.getRoomMembers(conversationId, offset, PAGE_SIZE);

      if (reset) {
        setMembers(result.participants);
      } else {
        setMembers(prev => [...prev, ...result.participants]);
      }

      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Failed to load participants:', error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Filter members by search query
  const filteredMembers = members.filter(member => {
    const user = member.user_id;
    if (!user) return false;
    const username = user.username?.toLowerCase() || '';
    const displayName = user.display_name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return username.includes(query) || displayName.includes(query);
  });

  const onlineCount = members.filter(m => m.user_id?.is_online).length;

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
              {totalCount > 0 ? totalCount : members.length} members • {onlineCount} online
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

        {/* Search Input */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
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

        {/* Members List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#707070',
            }}>
              Loading members...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#707070',
            }}>
              {searchQuery ? 'No members found' : 'No members'}
            </div>
          ) : (
            <>
              {filteredMembers.map((participant) => {
                const user = participant.user_id;
                if (!user) return null;
                
                return (
                  <div
                    key={user._id || user.id}
                    onClick={() => {
                      onMemberClick(user._id || user.id);
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
                        <RankedPFP 
                          rank={user.rank || 'RECRUIT'} 
                          size="small" 
                          showRankLabel={false}
                          avatarUrl={user.avatar_url}
                        />
                        {/* Online indicator */}
                        {user.is_online && (
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
                          {user.display_name || user.username}
                        </div>
                        <div style={{
                          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                          fontSize: '11px',
                          color: '#707070',
                        }}>
                          {user.rank || 'RECRUIT'}
                        </div>
                      </div>
                    </div>

                    {/* Arrow icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                );
              })}

              {/* Load more indicator */}
              {!searchQuery && hasMore && (
                <div ref={observerTarget} style={{
                  textAlign: 'center',
                  padding: '12px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '11px',
                  color: '#707070',
                }}>
                  {loadingMore ? 'Loading more members...' : ' '}
                </div>
              )}

              {!searchQuery && !hasMore && members.length > PAGE_SIZE && (
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '11px',
                  color: '#707070',
                }}>
                  All {totalCount} members loaded
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};


