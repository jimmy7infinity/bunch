'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api';
import { Message, User, Conversation } from '@/types';
import { Trash2, ChevronDown, ChevronUp, Loader2, UserCircle } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [contextMessages, setContextMessages] = useState<Record<string, Message[]>>({});
  const observerTarget = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 50;

  useEffect(() => {
    loadMessages(true);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerTarget.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMessages(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, messages.length]);

  const loadMessages = async (reset: boolean = false, userId?: string) => {
    try {
      if (reset) {
        setLoading(true);
        setMessages([]);
      } else {
        setLoadingMore(true);
      }

      const oldestMessage = reset ? null : messages[messages.length - 1];
      const data = await adminApi.getMessages({ 
        limit: PAGE_SIZE, 
        userId,
        before: oldestMessage?.created_at
      });

      if (reset) {
        setMessages(data.messages);
      } else {
        setMessages(prev => [...prev, ...data.messages]);
      }

      setHasMore(data.messages.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFilter = () => {
    setHasMore(true);
    loadMessages(true, userFilter || undefined);
  };

  const toggleContext = async (messageId: string) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
      return;
    }

    if (!contextMessages[messageId]) {
      try {
        const data = await adminApi.getMessageById(messageId);
        // Backend returns {message, context} where context already includes the message
        setContextMessages(prev => ({ ...prev, [messageId]: data.context }));
      } catch (error) {
        console.error('Failed to load context:', error);
      }
    }
    
    setExpandedMessage(messageId);
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      await adminApi.deleteMessage(messageId);
      setMessages(messages.filter((m) => m._id !== messageId));
      if (expandedMessage === messageId) {
        setExpandedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  const getSenderName = (sender: string | User) => {
    if (typeof sender === 'string') return 'Unknown';
    return sender.display_name || sender.username;
  };

  const getSenderId = (sender: string | User): string | null => {
    if (typeof sender === 'string') return sender;
    return sender._id || null;
  };

  const navigateToUser = (sender: string | User) => {
    const userId = getSenderId(sender);
    if (userId) {
      router.push(`/users?id=${userId}`);
    }
  };

  const getConversationTitle = (conv: string | Conversation) => {
    if (typeof conv === 'string') return 'Unknown';
    return conv.title || conv.slug || conv.type;
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground text-lg mt-1">View and moderate messages</p>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Filter by User ID"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={handleFilter}>Apply</Button>
            <Button variant="outline" onClick={() => { setUserFilter(''); setHasMore(true); loadMessages(true); }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {messages.map((message) => (
                  <div key={message._id} className="border border-border/50 rounded-lg overflow-hidden">
                    <div className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <button
                            onClick={() => navigateToUser(message.sender_id)}
                            className="font-semibold text-sm hover:text-primary transition-colors inline-flex items-center gap-1.5"
                          >
                            <UserCircle className="h-4 w-4" />
                            {getSenderName(message.sender_id)}
                          </button>
                          <span className="text-xs text-muted-foreground">
                            {getConversationTitle(message.conversation_id)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                        <p className="text-sm break-words">{message.text}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleContext(message._id)}
                        >
                          {expandedMessage === message._id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(message._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {expandedMessage === message._id && contextMessages[message._id] && (
                      <div className="border-t border-border/50 bg-muted/20 p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-3">
                          CONTEXT ({contextMessages[message._id].length} messages - 5 before, current, 5 after)
                        </p>
                        <div className="space-y-2">
                          {contextMessages[message._id].map((msg: Message) => (
                            <div
                              key={msg._id}
                              className={`rounded-lg p-3 text-sm ${
                                msg._id === message._id
                                  ? 'bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]'
                                  : 'bg-background/50 border border-border/30'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <button
                                  onClick={() => navigateToUser(msg.sender_id)}
                                  className="font-medium text-xs hover:text-primary transition-colors inline-flex items-center gap-1"
                                >
                                  <UserCircle className="h-3 w-3" />
                                  {getSenderName(msg.sender_id)}
                                </button>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(msg.created_at)}
                                </span>
                                {msg._id === message._id && (
                                  <span className="text-xs font-semibold text-primary">
                                    ← This Message
                                  </span>
                                )}
                              </div>
                              <p className="break-words">{msg.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Load more trigger */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center py-6">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading more messages...</span>
                    </div>
                  )}
                </div>
              )}

              {!hasMore && messages.length > 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No more messages to load
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
