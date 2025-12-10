import { useEffect, useState, useRef } from 'react';
import { messageService } from '../../services/api';
import { websocketService } from '../../services/websocket';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const ChatRoom = () => {
  const { token, user, logout } = useAuthStore();
  const { messages, onlineCount, isConnected, setMessages, addMessage, setOnlineCount, setConnected, updateMessageReactions } = useChatStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // Load initial messages
    const loadMessages = async () => {
      try {
        const data = await messageService.getMessages(50);
        setMessages(data.messages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Connect WebSocket
    const socket = websocketService.connect(token);

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen for new messages
    websocketService.onMessageNew((message) => {
      addMessage(message);
    });

    // Listen for reactions
    websocketService.onMessageReaction((data) => {
      updateMessageReactions(data.messageId, data.reactions);
    });

    // Listen for online count
    websocketService.onUsersCount((data) => {
      setOnlineCount(data.count);
    });

    return () => {
      websocketService.disconnect();
    };
  }, [token]);

  const handleSendMessage = (text: string) => {
    websocketService.sendMessage(text);
  };

  const handleReact = (messageId: string, emoji: string) => {
    websocketService.reactToMessage(messageId, emoji);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div>
          <h1 className="text-xl font-bold">🌍 Global Chat</h1>
          <p className="text-sm text-muted-foreground">
            {onlineCount} online {isConnected ? '🟢' : '🔴'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {user?.display_name || user?.username}
          </div>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:opacity-80"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} onReact={handleReact} currentUserId={user?.id} />

      {/* Input */}
      <MessageInput onSend={handleSendMessage} disabled={!isConnected} />
    </div>
  );
};

