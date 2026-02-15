import { useEffect } from 'react';

interface UseMentionsProps {
  participants: any[];
  mentionSearch: string;
  showMentionPicker: boolean;
  message: string;
  cursorPosition: number;
  setMessage: (message: string) => void;
  setCursorPosition: (position: number) => void;
  setShowMentionPicker: (show: boolean) => void;
  setMentionSearch: (search: string) => void;
  messageInputRef: React.RefObject<HTMLTextAreaElement>;
}

export const useMentions = ({
  participants,
  mentionSearch,
  showMentionPicker,
  message,
  cursorPosition,
  setMessage,
  setCursorPosition,
  setShowMentionPicker,
  setMentionSearch,
  messageInputRef,
}: UseMentionsProps) => {
  
  // Filter users for mention autocomplete
  const filteredMentionUsers = participants.filter(u => 
    u.username?.toLowerCase().includes(mentionSearch.toLowerCase())
  );
  
  // Handle message input change with @mention detection
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursor = e.target.selectionStart || 0;
    
    setMessage(newValue);
    setCursorPosition(newCursor);
    
    // Check if we're typing an @mention
    const textBeforeCursor = newValue.substring(0, newCursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if ((charBeforeAt === ' ' || lastAtIndex === 0) && !textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setShowMentionPicker(true);
        return;
      }
    }
    
    setShowMentionPicker(false);
  };
  
  // Insert mention into message
  const insertMention = (username: string) => {
    const textBeforeCursor = message.substring(0, cursorPosition);
    const textAfterCursor = message.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const newMessage = 
      textBeforeCursor.substring(0, lastAtIndex) + 
      `@${username} ` + 
      textAfterCursor;
    
    setMessage(newMessage);
    setShowMentionPicker(false);
    setMentionSearch('');
    
    // Focus back on input
    setTimeout(() => {
      if (messageInputRef.current) {
        const newCursorPos = lastAtIndex + username.length + 2;
        messageInputRef.current.focus();
        messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };
  
  return {
    filteredMentionUsers,
    handleMessageChange,
    insertMention,
  };
};
