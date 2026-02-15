import React from 'react';
import { formatDateSeparator } from '../utils/messageRendering';

interface DateSeparatorProps {
  date: Date;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      margin: '20px 0 10px 0',
    }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#333333' }} />
      <span style={{
        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '11px',
        color: '#707070',
        padding: '0 10px',
        whiteSpace: 'nowrap',
      }}>
        {formatDateSeparator(date)}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#333333' }} />
    </div>
  );
};
