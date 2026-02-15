import React from 'react';

// Parse message text to highlight @mentions (with click support)
export const renderMessageWithMentions = (
  text: string,
  participants: any[],
  onUserClick?: (userId: string) => void
): React.ReactNode => {
  const parts = text.split(/(@\w+)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      const username = part.substring(1);
      const mentionedUser = participants.find(u => u.username === username);
      
      return (
        <span
          key={index}
          style={{
            color: '#5BC854',
            fontWeight: '600',
            cursor: mentionedUser ? 'pointer' : 'default',
          }}
          onClick={(e) => {
            if (mentionedUser && onUserClick) {
              e.stopPropagation();
              onUserClick(mentionedUser._id || mentionedUser.id);
            }
          }}
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// Format date for separator
export const formatDateSeparator = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
};

// Check if we need to show a date separator
export const shouldShowDateSeparator = (currentDate: Date, previousDate: Date | null): boolean => {
  if (!previousDate) return true;
  return currentDate.toDateString() !== previousDate.toDateString();
};
