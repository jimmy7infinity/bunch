'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api';
import { Message, User, Conversation } from '@/types';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [contextMessages, setContextMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async (userId?: string) => {
    try {
      setLoading(true);
      const data = await adminApi.getMessages({ limit: 100, userId });
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadMessages(userFilter || undefined);
  };

  const toggleContext = async (messageId: string) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
      return;
    }

    if (!contextMessages[messageId]) {
      try {
        const data = await adminApi.getMessageById(messageId);
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
            <Button variant="outline" onClick={() => { setUserFilter(''); loadMessages(); }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Recent Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div key={message._id} className="border border-border/50 rounded-lg overflow-hidden">
                  <div className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-sm">
                          {getSenderName(message.sender_id)}
                        </span>
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
                        CONTEXT ({contextMessages[message._id].length} messages)
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
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-xs">
                                {getSenderName(msg.sender_id)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(msg.created_at)}
                              </span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
