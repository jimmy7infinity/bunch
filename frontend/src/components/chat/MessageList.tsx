import { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  onReact: (messageId: string, emoji: string) => void;
  currentUserId?: string;
}

export const MessageList = ({ messages, onReact, currentUserId }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No messages yet. Be the first to say something!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message._id}
          message={message}
          onReact={onReact}
          isOwnMessage={message.sender_id.id === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};





