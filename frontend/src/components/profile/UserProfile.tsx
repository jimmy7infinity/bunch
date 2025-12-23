import React, { useState } from 'react';
import './UserProfile.css';

interface UserProfileProps {
  userId: string;
  isOwnProfile: boolean;
  onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, isOwnProfile, onBack }) => {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [bio, setBio] = useState('This is a sample bio. It has roots in a piece of classical Latin literature from 45 BC.');
  const [username, setUsername] = useState(isOwnProfile ? 'your_username' : 'jafar904');

  // Mock user data - will be replaced with actual API calls
  const userData = {
    pfp: '👤',
    rank: 'Gold', // This will determine the stroke color
    friendStatus: isOwnProfile ? null : 'not_friends', // 'friends', 'pending', 'not_friends'
  };

  // Get rank color based on rank
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Gold':
        return '#AE8B2A';
      case 'Silver':
        return '#C0C0C0';
      case 'Bronze':
        return '#CD7F32';
      default:
        return '#888888';
    }
  };

  const rankColor = getRankColor(userData.rank);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#19191A' 
    }}>
      {/* TOP BAR */}
      <div 
        className="profile-topbar"
        style={{
          height: '75px',
          backgroundColor: '#19191A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0 20px',
        }}
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="nav-icon-button"
          style={{
            position: 'absolute',
            left: '20px',
            width: '40px',
            height: '40px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Title */}
        <span style={{
          fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '15px',
          background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {isOwnProfile ? 'My Profile' : 'User Profile'}
        </span>
      </div>

      {/* PROFILE CONTENT */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        gap: '30px',
      }}>
        {/* Profile Picture with Rank */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '10px',
          position: 'relative',
        }}>
          <div
            className="profile-pfp"
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: `3px solid ${rankColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#2A2A2A',
              overflow: 'hidden',
              filter: 'grayscale(100%)',
            }}
          >
            <span style={{ fontSize: '80px' }}>{userData.pfp}</span>
          </div>

          {/* Edit PFP Button (only for own profile) */}
          {isOwnProfile && (
            <button
              className="edit-pfp-button"
              style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '40px',
                height: '40px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}

          {/* User Rank Badge */}
          <div
            className="profile-rank-badge"
            style={{
              width: '100px',
              height: '26px',
              backgroundColor: '#2A2A2A',
              border: `3px solid ${rankColor}`,
              borderRadius: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{
              fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: rankColor,
              fontWeight: '600',
            }}>
              {userData.rank}
            </span>
          </div>
        </div>

        {/* Username */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          width: '90%',
          maxWidth: '400px',
          justifyContent: 'center',
        }}>
          {isEditingUsername && isOwnProfile ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setIsEditingUsername(false)}
              autoFocus
              style={{
                backgroundColor: '#19191A',
                border: '1px solid #333333',
                borderRadius: '10px',
                padding: '8px 15px',
                fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '18px',
                color: '#D3D3D3',
                outline: 'none',
                textAlign: 'center',
                maxWidth: '250px',
              }}
            />
          ) : (
            <span style={{
              fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '20px',
              background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              @{username}
            </span>
          )}
          {isOwnProfile && !isEditingUsername && (
            <button
              onClick={() => setIsEditingUsername(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Action Buttons (for other users' profiles) */}
        {!isOwnProfile && (
          <div style={{ 
            width: '90%', 
            maxWidth: '400px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '30px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 15px',
            gap: '10px',
          }}>
            {/* Add Friend / Remove Friend Button */}
            {userData.friendStatus === 'friends' ? (
              <button
                className="profile-pill-button"
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="12" y1="12" x2="18" y2="12"/>
                </svg>
              </button>
            ) : userData.friendStatus === 'pending' ? (
              <button
                className="profile-pill-button"
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </button>
            ) : (
              <button
                className="profile-pill-button"
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="15" y1="7" x2="21" y2="7"/>
                  <line x1="18" y1="4" x2="18" y2="10"/>
                </svg>
              </button>
            )}

            {/* Message / Message Request Button */}
            {userData.friendStatus === 'friends' ? (
              <button
                className="profile-pill-button-primary"
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #5BC854, #082724)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            ) : (
              <button
                className="profile-pill-button"
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9B7B7" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            )}

            {/* Block Button */}
            <button
              className="profile-pill-button-danger"
              style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #8B2A2A, #5C1717)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: '6px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C85454" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </button>
          </div>
        )}

        {/* Bio Section */}
        <div style={{
          width: '90%',
          maxWidth: '500px',
          backgroundColor: '#242424',
          border: '1px solid transparent',
          backgroundImage: 'linear-gradient(#242424, #242424), linear-gradient(135deg, #707070, #333333)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          borderRadius: '20px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{
              fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '14px',
              color: '#B9B7B7',
            }}>
              Bio
            </span>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
          </div>
          {isEditingBio ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                backgroundColor: '#19191A',
                border: '1px solid #333333',
                borderRadius: '10px',
                padding: '10px',
                fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '12px',
                color: '#D3D3D3',
                resize: 'vertical',
              }}
            />
          ) : (
            <p style={{
              fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#909090',
              margin: 0,
              lineHeight: '1.5',
            }}>
              {bio}
            </p>
          )}
        </div>

        {/* Friends List (only for own profile) */}
        {isOwnProfile && (
          <>
            <div style={{
              width: '90%',
              maxWidth: '500px',
              backgroundColor: '#242424',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#242424, #242424), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '20px',
              padding: '20px',
            }}>
              <span style={{
                fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '14px',
                color: '#B9B7B7',
                marginBottom: '15px',
                display: 'block',
              }}>
                Friends (12)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Sample friend item */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  backgroundColor: '#19191A',
                  borderRadius: '10px',
                }}>
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
                    <span style={{ fontSize: '16px' }}>👤</span>
                  </div>
                  <span style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '12px',
                    color: '#B9B7B7',
                  }}>
                    friend_username
                  </span>
                </div>
              </div>
            </div>

            {/* Friend Requests */}
            <div style={{
              width: '90%',
              maxWidth: '500px',
              backgroundColor: '#242424',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#242424, #242424), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '20px',
              padding: '20px',
            }}>
              <span style={{
                fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '14px',
                color: '#B9B7B7',
                marginBottom: '15px',
                display: 'block',
              }}>
                Friend Requests (2)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Sample request item */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  backgroundColor: '#19191A',
                  borderRadius: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                      <span style={{ fontSize: '16px' }}>👤</span>
                    </div>
                    <span style={{
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '12px',
                      color: '#B9B7B7',
                    }}>
                      request_username
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: '#19191A',
                      border: '1px solid #5BC854',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                    <button style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: '#19191A',
                      border: '1px solid #C85454',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C85454" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
