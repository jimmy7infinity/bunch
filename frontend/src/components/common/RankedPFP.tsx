import React from 'react';
import { getRankColors } from '../../utils/ranks';

interface RankedPFPProps {
  rank: string;
  pfpEmoji?: string;
  size?: 'tiny' | 'small' | 'medium' | 'chat' | 'large' | 'xlarge' | 'xlarge125' | 'xxlarge';
  showRankLabel?: boolean;
}

// Base size is 50x50 from Figma
const SIZES = {
  tiny: 0.9,      // 45x45 (for top bar profile icon)
  small: 0.56,    // 28x28 (for leaderboard items)
  medium: 1.0,    // 50x50 (base size from Figma, for chat messages)
  chat: 1.5,      // 75x75 (1.5x bigger - reserved for future use)
  large: 2.0,     // 100x100 (for ranks display)
  xlarge: 3.0,    // 150x150 (for profile pages)
  xlarge125: 3.75, // 187.5x187.5 (for ranks tab - xlarge * 1.25)
  xxlarge: 4.5,   // 225x225 (xlarge * 1.5)
};

export const RankedPFP: React.FC<RankedPFPProps> = ({ 
  rank, 
  pfpEmoji = '👤',
  size = 'medium',
  showRankLabel = true,
}) => {
  const rankColors = getRankColors(rank);
  const scale = SIZES[size];
  
  // Base dimensions from Figma
  const pfpSize = 50 * scale;
  const borderWidth = 1.5 * scale; // Reduced from 3 to 1.5 (half the weight)
  const rankWidth = 50 * scale; // Fixed width matching PFP
  const rankHeight = 13 * scale;
  const gap = 3 * scale;
  
  // Font size from Figma: 5px for 50x50 PFP
  const rankFontSize = 5 * scale;
  
  // Calculate emoji size (approximately 60% of PFP size for good fit)
  const emojiSize = pfpSize * 0.6;

  // Calculate accent scaling
  // Accents were designed for 1000x1000 PFP
  const accentScaleFactor = pfpSize / 1000;
  
  // Neumorphic shadows (scaled based on PFP size, designed for 50x50)
  // Keep shadow size proportional but not linearly scaled to avoid huge shadows
  const shadowScale = Math.min(scale, 2); // Cap shadow scaling at 2x
  const pfpShadow = `${-1 * shadowScale}px ${-1 * shadowScale}px ${2 * shadowScale}px 0 rgba(255, 255, 255, 0.08), ${10 * shadowScale}px ${10 * shadowScale}px ${20 * shadowScale}px 0 rgba(0, 0, 0, 0.25)`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: `${gap}px`,
    }}>
      {/* PFP with gradient border and rank accent */}
      <div style={{ 
        position: 'relative', 
        flexShrink: 0,
        filter: `drop-shadow(${pfpShadow})`,
      }}>
        <div
          style={{
            width: `${pfpSize}px`,
            height: `${pfpSize}px`,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${rankColors.pfpBorder.topLeft}, ${rankColors.pfpBorder.bottomRight})`,
            padding: `${borderWidth}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: '#2A2A2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'grayscale(100%)',
            }}
          >
            <span style={{ fontSize: `${emojiSize}px`, lineHeight: 1 }}>{pfpEmoji}</span>
          </div>
        </div>
        
        {/* Rank Accent Overlay */}
        {rankColors.hasAccent && rankColors.accentFile && (
          <div
            style={{
              position: 'absolute',
              bottom: `${-gap}px`,
              left: '50%',
              transform: `translateX(-50%) scale(${accentScaleFactor})`,
              transformOrigin: 'center bottom',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <img
              src={`/rank_accent/${rankColors.accentFile}`}
              alt="rank accent"
              style={{
                display: 'block',
                width: 'auto',
                height: 'auto',
              }}
            />
          </div>
        )}
      </div>

      {/* Rank Label */}
      {showRankLabel && (
        <div
          style={{
            width: `${rankWidth}px`, // Fixed width, not minWidth
            height: `${rankHeight}px`,
            background: `linear-gradient(135deg, ${rankColors.rankBorder.topLeft}, ${rankColors.rankBorder.bottomRight})`,
            padding: `${borderWidth}px`,
            borderRadius: `${rankHeight / 2}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: `drop-shadow(${pfpShadow})`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: rankColors.rankFill,
              borderRadius: `${(rankHeight - borderWidth * 2) / 2}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'Stalinist One, SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: `${rankFontSize}px`,
                color: rankColors.rankText,
                fontWeight: '400',
                letterSpacing: '0.2px',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {rank}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

