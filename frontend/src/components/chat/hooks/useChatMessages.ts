import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useChatStore } from '../../../stores/chatStore';
import { useNotificationStore } from '../../../stores/notificationStore';
import { websocketService } from '../../../services/websocket';
import { messageService, marketPositionService } from '../../../services/api';
import { getDisplayRank } from '../../../utils/ranks';
import type { ChatRoom as ChatRoomType } from '../../../types';

interface UseChatMessagesProps {
  conversation: ChatRoomType;
  chatWindowRef: React.RefObject<HTMLDivElement>;
}

export const useChatMessages = ({ conversation, chatWindowRef }: UseChatMessagesProps) => {
  const { user, token } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { 
    messages: storeMessages, 
    addMessage, 
    setMessages: setStoreMessages,
    updateMessage,
    deleteMessage: deleteStoreMessage,
    updateMessageReactions 
  } = useChatStore();
  
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [marketPositions, setMarketPositions] = useState<Record<string, 'yes' | 'no'>>({});
  const [whales, setWhales] = useState<Record<string, boolean>>({});
  
  const currentConversationIdRef = useRef<string>(conversation._id);
  
  // Filter messages to only show messages for THIS conversation
  const conversationMessages = storeMessages.filter(
    msg => msg.conversation_id === conversation._id
  );
  
  // Load messages and connect to WebSocket
  useEffect(() => {
    currentConversationIdRef.current = conversation._id;
    console.log('[useChatMessages] Conversation changed to:', conversation._id);
    
    // Clear messages immediately when conversation changes
    setStoreMessages([]);
    setIsLoadingMessages(true);
    
    const loadMessages = async () => {
      try {
        console.log('[useChatMessages] Loading messages for conversation:', conversation._id);
        const response = await messageService.getMessages(conversation._id, 50);
        console.log('[useChatMessages] Received messages response:', {
          conversationId: conversation._id,
          messagesCount: response.data?.length || 0,
        });
        setStoreMessages(response.data || []);
        setHasMoreMessages(response.has_more || false);
        
        // Scroll to bottom after messages are loaded
        setTimeout(() => {
          if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
          }
        }, 100);
      } catch (error) {
        console.error('[useChatMessages] Failed to load messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    // Connect to WebSocket
    if (token && !websocketService.isConnected()) {
      websocketService.connect(token);
    }

    // Join the conversation room
    websocketService.joinRoom(conversation._id);

    // Load initial messages
    loadMessages();

    // Listen for new messages
    const unsubscribeNew = websocketService.onMessageNew((message) => {
      console.log('[useChatMessages] Received new message for conversation:', message.conversation_id);
      
      // Check if this is from someone else and show notification
      const isFromSelf = message.sender_id?._id === (user?._id || user?.id) || message.sender_id?.id === (user?._id || user?.id);
      if (!isFromSelf && message.conversation_id === conversation._id) {
        const senderName = message.sender_id?.display_name || message.sender_id?.username || 'Someone';
        
        // Check for mentions
        const currentUsername = user?.username || '';
        const isMentioned = message.text?.includes(`@${currentUsername}`);
        
        if (isMentioned) {
          addNotification({
            type: 'mention',
            title: `${senderName} mentioned you`,
            message: message.text.substring(0, 50) + (message.text.length > 50 ? '...' : ''),
          });
        } else {
          // Regular message notification
          addNotification({
            type: 'message',
            title: `${senderName} in ${conversation.title || 'Chat'}`,
            message: message.text.substring(0, 50) + (message.text.length > 50 ? '...' : ''),
          });
        }
      }
      
      // Get current messages from the store
      const currentMessages = useChatStore.getState().messages;
      
      if (!Array.isArray(currentMessages)) {
        setStoreMessages([message]);
        return;
      }
      
      // Remove temp messages that match this real message
      const filtered = currentMessages.filter(m => {
        if (!m._id.startsWith('temp-')) return true;
        
        const isSameConversation = m.conversation_id === message.conversation_id;
        const isSameSender = (m.sender_id?._id === message.sender_id?._id || m.sender_id?.id === message.sender_id?.id);
        const isSameText = m.text === message.text;
        const timeDiff = Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime());
        
        return !(isSameConversation && isSameSender && isSameText && timeDiff < 5000);
      });
      
      // Add the new real message
      setStoreMessages([...filtered, message]);
    });

    // Listen for message updates
    const unsubscribeUpdated = websocketService.onMessageUpdated((message) => {
      updateMessage(message._id, message);
    });

    // Listen for reaction updates
    const unsubscribeReaction = websocketService.onMessageReaction((data) => {
      updateMessageReactions(data.messageId, data.reactions);
    });

    // Listen for deleted messages
    const unsubscribeDeleted = websocketService.onMessageDeleted((data) => {
      deleteStoreMessage(data.messageId);
    });

    // Listen for position status updates (market chats only)
    const unsubscribePosition = websocketService.onUserPositionUpdate((data) => {
      console.log('📊 Received position update:', data);
      
      // Update market positions state
      setMarketPositions(prev => ({
        ...prev,
        [data.userId]: 'yes',
      }));
      
      // Update whales state
      if (data.isWhale) {
        setWhales(prev => ({
          ...prev,
          [data.userId]: true,
        }));
      }
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdated();
      unsubscribeReaction();
      unsubscribeDeleted();
      unsubscribePosition();
      websocketService.leaveRoom(conversation._id);
    };
  }, [conversation._id, token]);
  
  // Load participants when messages change
  useEffect(() => {
    const uniqueUsers = new Map();
    conversationMessages.forEach(msg => {
      if (msg.sender_id && typeof msg.sender_id === 'object') {
        const userId = msg.sender_id._id || msg.sender_id.id;
        if (userId && !uniqueUsers.has(userId)) {
          uniqueUsers.set(userId, {
            _id: userId,
            id: userId,
            username: msg.sender_id.username,
            display_name: msg.sender_id.display_name,
            avatar_url: msg.sender_id.avatar_url,
            rank: getDisplayRank(msg.sender_id),
          });
        }
      }
    });
    setParticipants(Array.from(uniqueUsers.values()));
  }, [storeMessages, conversation._id]);
  
  // Auto-load market positions for position badges (⚡/🐳) in market chats
  useEffect(() => {
    if (conversation.type !== 'market' || !conversation.market_id) {
      // Clear positions if not in a market chat
      setMarketPositions({});
      setWhales({});
      return;
    }

    const loadMarketPositions = async () => {
      try {
        console.log('[useChatMessages] Loading market statuses for:', conversation.market_id);
        
        // Load all market statuses (actual Polymarket positions detected via API)
        const statusesResult = await marketPositionService.getMarketStatuses(conversation.market_id);
        const positionsMap: Record<string, 'yes' | 'no'> = {};
        const whalesMap: Record<string, boolean> = {};
        
        statusesResult.statuses.forEach((status) => {
          const userId = status.userId;
          
          if (status.status === 'whale') {
            whalesMap[userId] = true;
            positionsMap[userId] = 'yes'; // Whales have positions too
          } else if (status.status === 'position') {
            positionsMap[userId] = 'yes';
          }
        });
        
        setMarketPositions(positionsMap);
        setWhales(whalesMap);
        
        console.log('[useChatMessages] Loaded market statuses:', {
          positions: Object.keys(positionsMap).length,
          whales: Object.keys(whalesMap).length,
        });
      } catch (error) {
        console.error('[useChatMessages] Failed to load market statuses:', error);
      }
    };

    loadMarketPositions();
  }, [conversation._id, conversation.type, conversation.market_id]);
  
  // Load more messages (infinite scroll pagination)
  const loadMoreMessages = async () => {
    if (isLoadingMoreMessages || !hasMoreMessages) return;
    
    setIsLoadingMoreMessages(true);
    try {
      const oldestMessage = conversationMessages[conversationMessages.length - 1];
      if (!oldestMessage) {
        setHasMoreMessages(false);
        return;
      }
      
      const response = await messageService.getMessages(
        conversation._id, 
        50, 
        oldestMessage.created_at
      );
      
      if (response.data && response.data.length > 0) {
        setStoreMessages([...storeMessages, ...response.data]);
      }
      
      setHasMoreMessages(response.has_more || false);
    } catch (error) {
      console.error('[useChatMessages] Failed to load more messages:', error);
    } finally {
      setIsLoadingMoreMessages(false);
    }
  };
  
  // Auto-scroll to bottom when appropriate
  useEffect(() => {
    if (!chatWindowRef.current || conversationMessages.length === 0) return;
    
    const chatWindow = chatWindowRef.current;
    const isNearBottom = chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.clientHeight < 100;
    
    if (isNearBottom) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [conversationMessages.length]);
  
  // Scroll handler for infinite scroll
  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (!chatWindow) return;
    
    const handleScroll = () => {
      if (chatWindow.scrollTop < 200 && hasMoreMessages && !isLoadingMoreMessages) {
        const previousScrollHeight = chatWindow.scrollHeight;
        const previousScrollTop = chatWindow.scrollTop;
        
        loadMoreMessages().then(() => {
          setTimeout(() => {
            if (chatWindow) {
              const newScrollHeight = chatWindow.scrollHeight;
              chatWindow.scrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight);
            }
          }, 0);
        });
      }
    };
    
    chatWindow.addEventListener('scroll', handleScroll);
    return () => chatWindow.removeEventListener('scroll', handleScroll);
  }, [hasMoreMessages, isLoadingMoreMessages, conversationMessages.length]);
  
  return {
    conversationMessages,
    isLoadingMessages,
    isLoadingMoreMessages,
    hasMoreMessages,
    currentConversationIdRef,
    loadMoreMessages,
    participants,
    marketPositions: marketPositions,
    whales: whales,
    setMarketPositions,
    setWhales,
  };
};
