'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      // Load global chats
      const globalRes = await axios.get(`${API_URL}/conversations/global`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Load market chats
      const marketRes = await axios.get(`${API_URL}/conversations/market`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      setMessages(res.data.messages.reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    loadMessages(conv._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(
        `${API_URL}/conversations/${selectedConv._id}/messages`,
        { text: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      loadMessages(selectedConv._id);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString();
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

        <Card className="lg:col-span-2 border-[var(--color-border)] bg-[var(--color-card)]">
          <CardHeader>
            <CardTitle>
              {selectedConv ? (selectedConv.title || selectedConv.slug || 'Chat') : 'Select a chatroom'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedConv ? (
              <div className="space-y-4">
                <div className="h-[400px] overflow-y-auto space-y-2 p-4 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-background)]">
                  {messages.map((msg) => (
                    <div key={msg._id} className="p-2 rounded-lg bg-[var(--color-muted)]/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs">
                          {msg.sender_id?.display_name || msg.sender_id?.username || 'Unknown'}
                        </span>
                        <span className="text-xs text-[var(--color-muted-foreground)]">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm break-words">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>Send</Button>
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
