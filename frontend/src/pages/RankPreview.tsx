import React, { useState } from 'react';
import { RankedPFP } from '../components/common/RankedPFP';
import { getAllRanks, getUserRanks, getStaffRanks, getPerformanceRanks, getSpecialRanks } from '../utils/ranks';

type SizeOption = 'tiny' | 'small' | 'medium' | 'chat' | 'large' | 'xlarge' | 'xlarge125' | 'xxlarge';

export const RankPreview: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState<SizeOption>('xlarge');
  const [filter, setFilter] = useState<'all' | 'user' | 'staff' | 'performance' | 'special'>('all');

  const getFilteredRanks = () => {
    switch (filter) {
      case 'user':
        return getUserRanks();
      case 'staff':
        return getStaffRanks();
      case 'performance':
        return getPerformanceRanks();
      case 'special':
        return getSpecialRanks();
      default:
        return getAllRanks();
    }
  };

  const ranks = getFilteredRanks();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#19191A',
      padding: '40px',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '40px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'Stalinist One, SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '36px',
          color: '#FFFFFF',
          marginBottom: '10px',
        }}>
          🎖️ Bunch Rank Preview
        </h1>
        <p style={{
          color: '#888888',
          fontSize: '16px',
          marginBottom: '30px',
        }}>
          Preview all ranks at different sizes • Total: {ranks.length} ranks
        </p>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          {/* Size Selector */}
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}>
            <label style={{ color: '#FFFFFF', fontSize: '14px' }}>Size:</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value as SizeOption)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#2A2A2A',
                color: '#FFFFFF',
                border: '1px solid #444444',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="tiny">Tiny (45x45)</option>
              <option value="small">Small (28x28)</option>
              <option value="medium">Medium (50x50)</option>
              <option value="chat">Chat (75x75)</option>
              <option value="large">Large (100x100)</option>
              <option value="xlarge">XLarge (150x150)</option>
              <option value="xlarge125">XLarge125 (187.5x187.5)</option>
              <option value="xxlarge">XXLarge (225x225)</option>
            </select>
          </div>

          {/* Filter Selector */}
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}>
            <label style={{ color: '#FFFFFF', fontSize: '14px' }}>Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#2A2A2A',
                color: '#FFFFFF',
                border: '1px solid #444444',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Ranks</option>
              <option value="user">Regular Ranks</option>
              <option value="staff">Staff Ranks</option>
              <option value="performance">Performance Ranks</option>
              <option value="special">Special Ranks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Headers and Ranks Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Regular Ranks */}
        {(filter === 'all' || filter === 'user') && (
          <RankSection 
            title="Regular Ranks" 
            subtitle="RECRUIT → LEGEND → LEGEND+"
            ranks={getUserRanks()} 
            size={selectedSize} 
          />
        )}

        {/* Staff Ranks */}
        {(filter === 'all' || filter === 'staff') && (
          <RankSection 
            title="Team Ranks" 
            subtitle="Staff & Contributors"
            ranks={getStaffRanks()} 
            size={selectedSize} 
          />
        )}

        {/* Performance Ranks */}
        {(filter === 'all' || filter === 'performance') && (
          <RankSection 
            title="Performance Ranks" 
            subtitle="Temporary - Earned through gameplay"
            ranks={getPerformanceRanks()} 
            size={selectedSize} 
          />
        )}

        {/* Special Ranks */}
        {(filter === 'all' || filter === 'special') && (
          <RankSection 
            title="Special Ranks" 
            subtitle="Unlockable & Limited Edition"
            ranks={getSpecialRanks()} 
            size={selectedSize} 
          />
        )}
      </div>

      {/* Legend */}
      <div style={{
        maxWidth: '1400px',
        margin: '60px auto 0',
        padding: '30px',
        backgroundColor: '#222222',
        borderRadius: '12px',
        border: '1px solid #333333',
      }}>
        <h3 style={{
          color: '#FFFFFF',
          fontSize: '18px',
          marginBottom: '20px',
          fontFamily: 'Stalinist One, SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          📖 Rank Categories
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          color: '#CCCCCC',
          fontSize: '14px',
          lineHeight: '1.6',
        }}>
          <div>
            <strong style={{ color: '#FFFFFF' }}>Regular Ranks:</strong><br />
            Progression-based ranks from RECRUIT to LEGEND. Plus (+) variants unlock after reaching LEGEND.
          </div>
          <div>
            <strong style={{ color: '#FFFFFF' }}>Team Ranks:</strong><br />
            CREATOR (early supporters), ADMIN, and MOD. Always have animated accents.
          </div>
          <div>
            <strong style={{ color: '#FFFFFF' }}>Performance Ranks:</strong><br />
            Temporary ranks earned through specific achievements. Expire seasonally. Use animated GIFs.
          </div>
          <div>
            <strong style={{ color: '#FFFFFF' }}>Special Ranks:</strong><br />
            Limited edition ranks like EARLY (first 1000 users) and NINJA (permanent unlock easter egg).
          </div>
        </div>
      </div>
    </div>
  );
};

// Section component for organizing ranks by category
const RankSection: React.FC<{
  title: string;
  subtitle: string;
  ranks: any[];
  size: SizeOption;
}> = ({ title, subtitle, ranks, size }) => {
  if (ranks.length === 0) return null;

  return (
    <div style={{ marginBottom: '60px' }}>
      <div style={{
        marginBottom: '30px',
        paddingBottom: '15px',
        borderBottom: '2px solid #333333',
      }}>
        <h2 style={{
          fontFamily: 'Stalinist One, SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '24px',
          color: '#FFFFFF',
          marginBottom: '5px',
        }}>
          {title}
        </h2>
        <p style={{
          color: '#888888',
          fontSize: '14px',
        }}>
          {subtitle}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '40px',
        justifyItems: 'center',
      }}>
        {ranks.map((rank) => (
          <RankCard key={rank.name} rank={rank} size={size} />
        ))}
      </div>
    </div>
  );
};

// Individual rank card
const RankCard: React.FC<{
  rank: any;
  size: SizeOption;
}> = ({ rank, size }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      padding: '20px',
      backgroundColor: '#222222',
      borderRadius: '12px',
      border: '1px solid #333333',
      minWidth: '180px',
      transition: 'transform 0.2s, border-color 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = '#555555';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = '#333333';
    }}
    >
      {/* PFP with Rank */}
      <RankedPFP
        rank={rank.name}
        pfpEmoji="👤"
        size={size}
        showRankLabel={true}
      />

      {/* Rank Info */}
      <div style={{
        textAlign: 'center',
        width: '100%',
      }}>
        <div style={{
          fontFamily: 'Stalinist One, SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '14px',
          color: '#FFFFFF',
          marginBottom: '8px',
        }}>
          {rank.name}
        </div>

        {/* Color Info */}
        <div style={{
          fontSize: '11px',
          color: '#888888',
          marginBottom: '8px',
        }}>
          {rank.category.toUpperCase()}
          {rank.hasAccent && ' • Accent'}
          {rank.isAnimated && ' • GIF'}
        </div>

        {/* Border Colors */}
        <div style={{
          display: 'flex',
          gap: '4px',
          justifyContent: 'center',
          marginBottom: '4px',
        }}>
          <ColorSwatch color={rank.pfpBorder.topLeft} label="Border 1" />
          <ColorSwatch color={rank.pfpBorder.bottomRight} label="Border 2" />
        </div>

        {/* Rank Fill & Text Colors */}
        <div style={{
          display: 'flex',
          gap: '4px',
          justifyContent: 'center',
        }}>
          <ColorSwatch color={rank.rankFill} label="Fill" />
          <ColorSwatch color={rank.rankText} label="Text" />
        </div>
      </div>
    </div>
  );
};

// Color swatch component
const ColorSwatch: React.FC<{ color: string; label: string }> = ({ color, label }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
      }}
      title={`${label}: ${color}`}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: color,
          border: '1px solid #444444',
          borderRadius: '4px',
        }}
      />
      <span style={{
        fontSize: '9px',
        color: '#666666',
      }}>
        {color}
      </span>
    </div>
  );
};
