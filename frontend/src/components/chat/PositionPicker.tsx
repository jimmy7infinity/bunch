import { useState } from 'react';
import { marketPositionService } from '../../services/api';

interface PositionPickerProps {
  marketId: string;
  myPosition: 'yes' | 'no' | null;
  onPositionChange: (position: 'yes' | 'no' | null) => void;
}

export const PositionPicker = ({ marketId, myPosition, onPositionChange }: PositionPickerProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleSetPosition = async (position: 'yes' | 'no') => {
    try {
      await marketPositionService.setPosition(marketId, position);
      onPositionChange(position);
      setShowPicker(false);
    } catch (error) {
      console.error('Failed to set position:', error);
    }
  };

  const handleClearPosition = async () => {
    try {
      await marketPositionService.clearPosition(marketId);
      onPositionChange(null);
      setShowPicker(false);
    } catch (error) {
      console.error('Failed to clear position:', error);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        style={{
          width: '28px',
          height: '28px',
          backgroundColor: '#19191A',
          border: '1px solid transparent',
          backgroundImage: myPosition 
            ? `linear-gradient(#19191A, #19191A), linear-gradient(135deg, ${myPosition === 'yes' ? '#5BC854' : '#C85454'}, #333333)`
            : 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {myPosition ? (myPosition === 'yes' ? '🟢' : '🔴') : '⚪'}
      </button>

      {/* Position Dropdown */}
      {showPicker && (
        <div style={{
          position: 'absolute',
          top: '35px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#242424',
          border: '1px solid #333333',
          borderRadius: '12px',
          padding: '8px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}>
          <button
            onClick={() => handleSetPosition('yes')}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: myPosition === 'yes' ? '#1A2E1A' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🟢
          </button>

          <button
            onClick={() => handleSetPosition('no')}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: myPosition === 'no' ? '#2E1A1A' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🔴
          </button>

          {myPosition && (
            <button
              onClick={handleClearPosition}
              style={{
                width: '40px',
                height: '32px',
                backgroundColor: 'transparent',
                border: '1px solid #333333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '10px',
                color: '#707070',
                marginTop: '4px',
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};
