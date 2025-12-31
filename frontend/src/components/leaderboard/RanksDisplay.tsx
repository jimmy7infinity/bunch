import React from 'react';
import { getUserRanks } from '../../utils/ranks';
import type { RankColors } from '../../utils/ranks';
import { RankedPFP } from '../common/RankedPFP';

export const RanksDisplay: React.FC = () => {
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
    }}>
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


