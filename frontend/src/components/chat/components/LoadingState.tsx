import React from 'react';

interface LoadingStateProps {
  text?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ text = 'Loading messages...' }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '14px',
        color: '#707070',
      }}>
        {text}
      </div>
    </div>
  );
};
