'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Smile } from 'lucide-react';
import { EmojiPicker } from '@/components/EmojiPicker';
import { adminApi } from '@/lib/api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bunch.up.railway.app/api';

interface Conversation {
  _id: string;
  type: 'dm' | 'group' | 'global' | 'market';
  title?: string;
  slug?: string;
  market_id?: string;
  participant_count: number;
  last_message_at?: string;
}

interface Message {
  _id: string;
  text: string;
  sender_id: any;
  created_at: string;
  reactions?: Record<string, string[]>;
}

export default function ChatroomsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const [globalRes, marketRes] = await Promise.all([
        axios.get(`${API_URL}/conversations/global`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/conversations/market`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setConversations([...globalRes.data.conversations, ...marketRes.data.conversations]);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${API_URL}/conversations/${convId}/messages?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages);
      
      // Scroll to bottom after messages load (without visible scrolling animation)
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
        }
      }, 0);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    loadMessages(conv._id);
  };

  const handleSendMessage = async () => {
    const textToSend = showImageInput && imageUrl ? imageUrl : newMessage;
    if (!textToSend.trim() || !selectedConv) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(
        `${API_URL}/conversations/${selectedConv._id}/messages`,
        { text: textToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      setImageUrl('');
      setShowImageInput(false);
      loadMessages(selectedConv._id);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await adminApi.reactToMessage(messageId, emoji);
      // Reload messages to show updated reactions
      if (selectedConv) {
        loadMessages(selectedConv._id);
      }
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Chatrooms</h1>
        <p className="text-muted-foreground text-lg mt-1">View and message in any chatroom</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
          <CardHeader>
            <CardTitle>Chatrooms ({conversations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-[var(--color-muted-foreground)]">Loading...</div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {conversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedConv?._id === conv._id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-muted)]/30'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {conv.title || conv.slug || conv.market_id}
                    </div>
                    <div className="text-xs text-[var(--color-muted-foreground)] mt-1">
                      {conv.type} • {conv.participant_count} members
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-[var(--color-border)] bg-[var(--color-card)]">
          <CardHeader>
            <CardTitle>
              {selectedConv ? (selectedConv.title || selectedConv.slug || 'Chat') : 'Select a chatroom'}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100vh-200px)] flex flex-col">
            {selectedConv ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-background)] mb-4">
                  {messages.map((msg) => {
                    const mediaUrl = extractMediaUrl(msg.text);
                    return (
                      <div key={msg._id} className="group">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 p-3 rounded-lg bg-[var(--color-muted)]/30 border border-[var(--color-border)]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-xs">
                                {msg.sender_id?.display_name || msg.sender_id?.username || 'Unknown'}
                              </span>
                              <span className="text-xs text-[var(--color-muted-foreground)]">
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                            {mediaUrl ? (
                              <img src={mediaUrl} alt="Media" className="max-w-xs rounded mt-1" />
                            ) : (
                              <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                            )}
                          </div>
                          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowEmojiPicker(showEmojiPicker === msg._id ? null : msg._id)}
                            >
                              <Smile className="h-4 w-4" />
                            </Button>
                            {showEmojiPicker === msg._id && (
                              <EmojiPicker
                                onSelect={(emoji) => handleReact(msg._id, emoji)}
                                onClose={() => setShowEmojiPicker(null)}
                              />
                            )}
                          </div>
                        </div>
                        
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 ml-0 max-w-full">
                            {Object.entries(msg.reactions)
                              .filter(([emoji, userIds]) => userIds.length > 0)
                              .map(([emoji, userIds]) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReact(msg._id, emoji)}
                                  className="inline-flex items-center gap-1.5 text-xs bg-[var(--color-secondary)] px-2.5 py-1.5 rounded-full hover:bg-[var(--color-accent)] transition-colors border border-[var(--color-border)] whitespace-nowrap"
                                >
                                  <span className="text-base leading-none">{emoji}</span>
                                  <span className="font-semibold text-xs">{userIds.length}</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="space-y-2">
                  {showImageInput && (
                    <Input
                      placeholder="Paste image/GIF URL..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder={showImageInput ? "Or type a message..." : "Type a message..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !showImageInput && handleSendMessage()}
                      disabled={showImageInput && imageUrl.length > 0}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowImageInput(!showImageInput)}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--color-muted-foreground)]">
                Select a chatroom to view and send messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
