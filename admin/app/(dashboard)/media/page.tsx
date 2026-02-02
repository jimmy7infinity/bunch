'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { Message, User } from '@/types';
import { Trash2, ExternalLink, Eye } from 'lucide-react';

export default function MediaPage() {
  const [media, setMedia] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getMedia(100);
      setMedia(data.media);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
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
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-2">
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
                        <div className="font-medium text-sm">
                          {getSenderName(message.sender_id)}
                        </div>
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
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">
                      {getSenderName(selectedMessage.message.sender_id)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(selectedMessage.message.created_at)}
                    </span>
                  </div>
                  <div className="text-sm break-words">{selectedMessage.message.text}</div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">
                    SURROUNDING MESSAGES
                  </p>
                  <div className="space-y-2">
                    {selectedMessage.context.map((msg: Message) => (
                      <div
                        key={msg._id}
                        className={`rounded-lg p-3 text-sm ${
                          msg._id === selectedMessage.message._id
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-background/50'
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
