import React from 'react';
import { getRankColors, getPFPBorderStyle, getRankBorderStyle } from '../../utils/ranks';

interface RankedPFPProps {
  rank: string;
  pfpEmoji?: string;
  avatarUrl?: string;
  size?: 'tiny' | 'small' | 'medium' | 'chat' | 'large' | 'xlarge' | 'xlarge125' | 'xxlarge';
  showRankLabel?: boolean;
  borderOnly?: boolean; // Only show colored border, no accent or rank label
  borderColor?: string; // Override border color (for borderOnly mode)
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
  avatarUrl,
  size = 'medium',
  showRankLabel = true,
  borderOnly = false,
  borderColor,
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
  
  // Apply custom offsets if defined (at base scale)
  const accentOffsetY = (rankColors.accentOffsetY || 0) * scale;
  const accentOffsetX = (rankColors.accentOffsetX || 0) * scale;
  
  // Neumorphic shadows (scaled based on PFP size, designed for 50x50)
  // Keep shadow size proportional but not linearly scaled to avoid huge shadows
  const shadowScale = Math.min(scale, 2); // Cap shadow scaling at 2x
  const pfpShadow = `${-1 * shadowScale}px ${-1 * shadowScale}px ${2 * shadowScale}px 0 rgba(255, 255, 255, 0.08), ${10 * shadowScale}px ${10 * shadowScale}px ${20 * shadowScale}px 0 rgba(0, 0, 0, 0.25)`;

  // Determine border style
  const borderStyle = borderColor 
    ? borderColor // Use provided solid color
    : getPFPBorderStyle(rank); // Use rank gradient (supports multi-color)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: borderOnly ? 0 : `${gap}px`, // No gap in borderOnly mode
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
            background: borderStyle,
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
              overflow: 'hidden',
            }}
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
            ) : (
              <span style={{ fontSize: `${emojiSize}px`, lineHeight: 1 }}>{pfpEmoji}</span>
            )}
          </div>
        </div>
        
        {/* Rank Accent Overlay - hidden in borderOnly mode */}
        {!borderOnly && rankColors.hasAccent && rankColors.accentFile && (
          <div
            style={{
              position: 'absolute',
              bottom: `${-gap + accentOffsetY}px`,
              left: `calc(50% + ${accentOffsetX}px)`,
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

      {/* Rank Label - hidden in borderOnly mode */}
      {!borderOnly && showRankLabel && (
        <div
          style={{
            width: `${rankWidth}px`, // Fixed width, not minWidth
            height: `${rankHeight}px`,
            background: getRankBorderStyle(rank), // Use helper function (supports multi-color)
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


