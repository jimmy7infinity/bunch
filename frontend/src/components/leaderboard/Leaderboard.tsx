import React, { useState } from 'react';
import { RanksDisplay } from './RanksDisplay';
import { RankedPFP } from '../common/RankedPFP';
import './Leaderboard.css';

interface LeaderboardProps {
  onBack: () => void;
  onUserClick?: (userId: string) => void;
}

interface LeaderboardUser {
  id: string;
  username: string;
  pfp: string;
  rank: string;
  score: number;
  position: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, onUserClick }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'ranks'>('leaderboard');

  // Mock leaderboard data - will be replaced with actual API call
  const mockLeaderboard: LeaderboardUser[] = [
    { id: '1', username: 'top_player', pfp: '👤', rank: 'CREATOR', score: 25420, position: 1 },
    { id: '2', username: 'second_best', pfp: '👤', rank: 'ADMIN', score: 24230, position: 2 },
    { id: '3', username: 'third_place', pfp: '👤', rank: 'MOD', score: 23150, position: 3 },
    { id: '4', username: 'player_four', pfp: '👤', rank: 'LEGEND+', score: 15420, position: 4 },
    { id: '5', username: 'player_five', pfp: '👤', rank: 'ICON+', score: 14230, position: 5 },
    { id: '6', username: 'player_six', pfp: '👤', rank: 'TITAN+', score: 13150, position: 6 },
    { id: '7', username: 'player_seven', pfp: '👤', rank: 'HERO+', score: 11890, position: 7 },
    { id: '8', username: 'player_eight', pfp: '👤', rank: 'CHAMP+', score: 10540, position: 8 },
    { id: '9', username: 'player_nine', pfp: '👤', rank: 'CAPTAIN+', score: 9320, position: 9 },
    { id: '10', username: 'player_ten', pfp: '👤', rank: 'VETERAN+', score: 7890, position: 10 },
  ];

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'linear-gradient(135deg, #FFD700, #FFA500)';
      case 2:
        return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)';
      case 3:
        return 'linear-gradient(135deg, #CD7F32, #8B4513)';
      default:
        return 'linear-gradient(135deg, #707070, #505050)';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#19191A' 
    }}>
      {/* TOP BAR */}
      <div 
        className="leaderboard-topbar"
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

        {/* Title with Icon - Dynamic based on active tab */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '15px',
            background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {activeTab === 'leaderboard' ? 'Leaderboard' : 'Ranks'}
          </span>
          {activeTab === 'leaderboard' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2">
              <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z"/>
            </svg>
          )}
        </div>
      </div>

      {/* TABS - styled like button section on ChatsList */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 0',
      }}>
        <div 
          className="button-container"
          style={{
            width: '95%',
            height: '60px',
            backgroundColor: '#19191A',
            borderRadius: '30px',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 15px',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="nav-button"
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
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '13px',
                color: '#707070',
              }}
            >
              <span style={{
                background: activeTab === 'leaderboard' 
                  ? 'linear-gradient(135deg, #C0C0C0, #CBCBCB)'
                  : 'inherit',
                WebkitBackgroundClip: activeTab === 'leaderboard' ? 'text' : undefined,
                WebkitTextFillColor: activeTab === 'leaderboard' ? 'transparent' : undefined,
                backgroundClip: activeTab === 'leaderboard' ? 'text' : undefined,
              }}>
                Leaderboard
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ranks')}
              className="nav-button"
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
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '13px',
                color: '#707070',
              }}
            >
              <span style={{
                background: activeTab === 'ranks' 
                  ? 'linear-gradient(135deg, #C0C0C0, #CBCBCB)'
                  : 'inherit',
                WebkitBackgroundClip: activeTab === 'ranks' ? 'text' : undefined,
                WebkitTextFillColor: activeTab === 'ranks' ? 'transparent' : undefined,
                backgroundClip: activeTab === 'ranks' ? 'text' : undefined,
              }}>
                Ranks
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {activeTab === 'leaderboard' ? (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0',
          gap: '0',
        }}>
          {/* Container with background like button section */}
          <div style={{
            width: '95%',
            backgroundColor: '#19191A',
            borderRadius: '30px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {mockLeaderboard.map((user) => {
              return (
                <div
                  key={user.id}
                  onClick={() => onUserClick?.(user.id)}
                  className="leaderboard-item"
                  style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: '#19191A',
                    border: '1px solid transparent',
                    backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    borderRadius: '20px',
                    padding: '0 15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  {/* Position */}
                  <div
                    className="position-badge"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: getPositionColor(user.position),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Stalinist One, SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '11px',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}
                  >
                    {user.position}
                  </div>

                  {/* PFP - only showing PFP without rank label in leaderboard */}
                  <div style={{ flexShrink: 0 }}>
                    <RankedPFP rank={user.rank} size="small" showRankLabel={false} />
                  </div>

                  {/* User Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '12px',
                      color: '#D3D3D3',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {user.username}
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{
                    fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '12px',
                    color: '#B9B7B7',
                    fontWeight: '600',
                    flexShrink: 0,
                  }}>
                    {user.score.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <RanksDisplay />
      )}
    </div>
  );
};


