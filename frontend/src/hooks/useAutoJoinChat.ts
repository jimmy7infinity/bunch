import { useEffect, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { roomService } from '../services/api';
import type { ChatRoom } from '../types';

interface AutoJoinResult {
  shouldShowCTA: boolean;
  joinChat: () => Promise<ChatRoom | null>;
  currentContext: ReturnType<typeof useChatStore.getState>['currentMarketContext'];
}

/**
 * Hook to handle automatic chat joining based on Polymarket context
 * Handles both market-specific chats and category global chats
 */
export function useAutoJoinChat(
  onChatJoined?: (chat: ChatRoom) => void
): AutoJoinResult {
  const { currentMarketContext } = useChatStore();
  const { user } = useAuthStore();
  const [shouldShowCTA, setShouldShowCTA] = useState(false);

  const joinChat = async (): Promise<ChatRoom | null> => {
    if (!currentMarketContext) {
      console.log('⚠️ No context to join');
      return null;
    }

    try {
      let conversation: ChatRoom;

      if (currentMarketContext.contextType === 'market') {
        // Join market-specific chat
        console.log('📍 Joining market chat:', currentMarketContext.marketId);
        conversation = await roomService.getOrCreateMarketChat(
          currentMarketContext.marketId!,
          currentMarketContext.marketTitle!
        );
      } else if (currentMarketContext.contextType === 'category') {
        // Join global category chat
        console.log('📂 Joining category chat:', currentMarketContext.chatName);
        
        // Find the global chat by name
        const globalChats = await roomService.getGlobalRooms();
        const targetChat = globalChats.find(
          chat => chat.name === currentMarketContext.chatName
        );

        if (!targetChat) {
          console.warn('⚠️ Global chat not found:', currentMarketContext.chatName);
          return null;
        }

        conversation = targetChat;
      } else {
        console.warn('⚠️ Unknown context type');
        return null;
      }

      // Notify parent component
      onChatJoined?.(conversation);
      setShouldShowCTA(false);
      
      return conversation;
    } catch (error) {
      console.error('Failed to join chat:', error);
      return null;
    }
  };

  // Auto-join effect
  useEffect(() => {
    const handleContextChange = async () => {
      // Check if user has auto-join enabled
      const autoPredictionChat = user?.settings?.autoPredictionChat ?? true;

      if (!currentMarketContext) {
        setShouldShowCTA(false);
        return;
      }

      if (!autoPredictionChat) {
        // Show CTA instead of auto-joining
        setShouldShowCTA(true);
        return;
      }

      // Auto-join is enabled
      setShouldShowCTA(false);
      await joinChat();
    };

    handleContextChange();
  }, [currentMarketContext, user?.settings?.autoPredictionChat]);

  return {
    shouldShowCTA,
    joinChat,
    currentContext: currentMarketContext,
  };
}
