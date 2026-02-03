'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { Message, User } from '@/types';
import { Trash2, ExternalLink, Eye, Loader2, UserCircle } from 'lucide-react';

export default function MediaPage() {
  const router = useRouter();
  const [media, setMedia] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 50;

  useEffect(() => {
    loadMedia(true);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerTarget.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMedia(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, media.length]);

  const loadMedia = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setMedia([]);
      } else {
        setLoadingMore(true);
      }

      // For now, just load with limit - backend doesn't support pagination for media yet
      const data = await adminApi.getMedia(PAGE_SIZE);
      
      if (reset) {
        setMedia(data.media);
      } else {
        // Simple pagination: just fetch more if available
        setHasMore(data.media.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleViewContext = async (messageId: string) => {
    try {
      const data = await adminApi.getMessageById(messageId);
      setSelectedMessage(data);
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Delete this media?')) return;

    try {
      await adminApi.deleteMessage(messageId);
      setMedia(media.filter((m) => m._id !== messageId));
      if (selectedMessage?.message._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert('Failed to delete media');
    }
  };

  const extractMediaUrl = (text: string) => {
    const urlMatch = text.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
    if (urlMatch) return urlMatch[0];
    
    const tenorMatch = text.match(/(https?:\/\/[^\s]*tenor\.com[^\s]*)/i);
    if (tenorMatch) return tenorMatch[0];
    
    const giphyMatch = text.match(/(https?:\/\/[^\s]*giphy\.com[^\s]*)/i);
    if (giphyMatch) return giphyMatch[0];
    
    return null;
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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Media</h1>
        <p className="text-muted-foreground text-lg mt-1">Recent images and GIFs</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Recent Media ({media.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                  {media.map((message) => {
                    const mediaUrl = extractMediaUrl(message.text);
                    return (
                      <div
                        key={message._id}
                        className="flex items-center gap-4 p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="w-16 h-16 rounded bg-muted flex-shrink-0 overflow-hidden">
                          {mediaUrl && (
                            <img
                              src={mediaUrl}
                              alt="Media"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => navigateToUser(message.sender_id)}
                            className="font-medium text-sm hover:text-primary transition-colors inline-flex items-center gap-1.5"
                          >
                            <UserCircle className="h-4 w-4" />
                            {getSenderName(message.sender_id)}
                          </button>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewContext(message._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(mediaUrl || message.text, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
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
                    );
                  })}
                </div>

                {/* Load more trigger */}
                {hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-4">
                    {loadingMore && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading more media...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Context</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="rounded-lg border-2 border-primary/50 bg-primary/10 p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <button
                      onClick={() => navigateToUser(selectedMessage.message.sender_id)}
                      className="font-semibold text-sm hover:text-primary transition-colors inline-flex items-center gap-1.5"
                    >
                      <UserCircle className="h-4 w-4" />
                      {getSenderName(selectedMessage.message.sender_id)}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(selectedMessage.message.created_at)}
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      ← This Media
                    </span>
                  </div>
                  <div className="text-sm break-words">{selectedMessage.message.text}</div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    CONTEXT ({selectedMessage.context.length} messages - 5 before, current, 5 after)
                  </p>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {selectedMessage.context.map((msg: Message) => (
                      <div
                        key={msg._id}
                        className={`rounded-lg p-3 text-sm ${
                          msg._id === selectedMessage.message._id
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
                          {msg._id === selectedMessage.message._id && (
                            <span className="text-xs font-semibold text-primary">
                              ← This Message
                            </span>
                          )}
                        </div>
                        <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Click on a media item to view context
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
