import React from 'react';
import { getUserRanks } from '../../utils/ranks';
import type { RankColors } from '../../utils/ranks';
import { RankedPFP } from '../common/RankedPFP';

interface RanksDisplayProps {
  comingSoon?: boolean;
}

export const RanksDisplay: React.FC<RanksDisplayProps> = ({ comingSoon = false }) => {
  const userRanks = getUserRanks();

  const renderRankItem = (rank: RankColors) => {
    return (
      <div
        key={rank.name}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 0',
          filter: comingSoon ? 'grayscale(100%)' : 'none',
          opacity: comingSoon ? 0.5 : 1,
        }}
      >
        {/* PFP with Rank using RankedPFP component - xlarge125 size (3.75x = 187.5px, which is 1.25x of xlarge 150px) - centered */}
        <RankedPFP rank={rank.name} size="xlarge125" showRankLabel={true} />
      </div>
    );
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      position: 'relative',
    }}>
      {/* Coming Soon Overlay */}
      {comingSoon && (
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: '#B9B7B7',
          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '18px',
          fontWeight: '600',
          zIndex: 10,
          backgroundColor: '#19191A',
          padding: '15px 30px',
          borderRadius: '15px',
          border: '1px solid #333',
        }}>
          Coming Soon
        </div>
      )}
      {/* Container with background like button section */}
      <div style={{
        width: '95%',
        backgroundColor: '#19191A',
        borderRadius: '30px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
      }}>
        {/* User Ranks - reversed order (Legend+ at top, Recruit at bottom) */}
        {[...userRanks].reverse().map((rank) => renderRankItem(rank))}
      </div>
    </div>
  );
};


