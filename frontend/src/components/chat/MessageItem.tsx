import { useState } from 'react';
import type { Message } from '../../types';

interface MessageItemProps {
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
  isOwnMessage: boolean;
}

const EMOJIS = ['👍', '👎', '🔥', '💎'];

export const MessageItem = ({ message, onReact, isOwnMessage }: MessageItemProps) => {
  const [showReactions, setShowReactions] = useState(false);

  const handleReact = (emoji: string) => {
    onReact(message._id, emoji);
    setShowReactions(false);
  };


  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender info */}
        {!isOwnMessage && (
          <div className="text-xs text-muted-foreground mb-1 px-2">
            {message.sender_id.status === 'deleted' 
              ? 'Deleted Account' 
              : (message.sender_id.display_name || message.sender_id.username)}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative group px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-card-foreground'
          }`}
        >
          {/* Reply indicator */}
          {message.reply_to && (
            <div className="mb-2 pb-2 border-b border-border/50">
              <div className="text-xs opacity-70 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 14 4 9 9 4"/>
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
                </svg>
                <span>Replying to {message.reply_to.sender_id?.display_name || message.reply_to.sender_id?.username || 'Unknown'}</span>
              </div>
              <div className="text-xs opacity-60 mt-1 truncate">
                {message.reply_to.text || message.reply_to.preview || '...'}
              </div>
            </div>
          )}

          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>

          {/* React button */}
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-accent"
          >
            +
          </button>

          {/* Reaction picker */}
          {showReactions && (
            <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-2 flex gap-1 z-10">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="hover:bg-accent rounded p-1 text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex gap-1 mt-1 px-2">
            {Object.entries(message.reactions).map(([emoji, userIds]) => {
              const count = userIds.length;
              if (count === 0) return null;
              return (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full hover:bg-accent"
                >
                  {emoji} {count}
                </button>
              );
            })}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground mt-1 px-2">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};

