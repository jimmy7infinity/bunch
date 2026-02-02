'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Smile } from 'lucide-react';
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
}

export default function ChatroomsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
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
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
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

        <Card className="lg:col-span-2 border-[var(--color-border)] bg-[var(--color-card)] flex flex-col">
          <CardHeader>
            <CardTitle>
              {selectedConv ? (selectedConv.title || selectedConv.slug || 'Chat') : 'Select a chatroom'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {selectedConv ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-2 p-4 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-background)] mb-4">
                  {messages.map((msg) => {
                    const mediaUrl = extractMediaUrl(msg.text);
                    return (
                      <div key={msg._id} className="p-2 rounded-lg bg-[var(--color-muted)]/30">
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
                          <p className="text-sm break-words">{msg.text}</p>
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
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--color-muted-foreground)]">
                Select a chatroom to view and send messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
