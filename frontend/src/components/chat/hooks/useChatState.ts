import { useState, useRef } from 'react';

export const useChatState = () => {
  const [message, setMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [hasAINotifications, setHasAINotifications] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ messageId: string; username: string; preview: string } | null>(null);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [participants, setParticipants] = useState<any[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const mentionPickerRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaMenuRef = useRef<HTMLDivElement>(null);
  
  return {
    message,
    setMessage,
    isFavorite,
    setIsFavorite,
    hasNotifications,
    setHasNotifications,
    hasAINotifications,
    setHasAINotifications,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    isMembersModalOpen,
    setIsMembersModalOpen,
    showReactionPicker,
    setShowReactionPicker,
    replyingTo,
    setReplyingTo,
    showMentionPicker,
    setShowMentionPicker,
    mentionSearch,
    setMentionSearch,
    cursorPosition,
    setCursorPosition,
    participants,
    setParticipants,
    highlightedMessageId,
    setHighlightedMessageId,
    showMessageMenu,
    setShowMessageMenu,
    showGifPicker,
    setShowGifPicker,
    isUploadingImage,
    setIsUploadingImage,
    showMediaMenu,
    setShowMediaMenu,
    messageInputRef,
    reactionPickerRef,
    mentionPickerRef,
    messageMenuRef,
    messageRefs,
    searchPanelRef,
    imageInputRef,
    mediaMenuRef,
  };
};
