'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { Message, User, Conversation } from '@/types';
import { Trash2, Eye } from 'lucide-react';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

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

  const handleViewContext = async (messageId: string) => {
    try {
      const data = await adminApi.getMessageById(messageId);
      setSelectedMessage(data);
    } catch (error) {
      console.error('Failed to load message context:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await adminApi.deleteMessage(messageId);
      setMessages(messages.filter((m) => m._id !== messageId));
      if (selectedMessage?.message._id === messageId) {
        setSelectedMessage(null);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">View and moderate recent messages</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="User ID (optional)"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />
            <Button onClick={handleFilter}>Filter</Button>
            <Button variant="outline" onClick={() => { setUserFilter(''); loadMessages(); }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message._id}>
                      <TableCell className="font-medium">
                        {getSenderName(message.sender_id)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {message.text}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {getConversationTitle(message.conversation_id)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewContext(message._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(message._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Context</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm font-medium">
                    {getSenderName(selectedMessage.message.sender_id)}
                  </div>
                  <div className="text-sm">{selectedMessage.message.text}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(selectedMessage.message.created_at).toLocaleString()}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">Surrounding Messages</h3>
                  <div className="space-y-2">
                    {selectedMessage.context.map((msg: Message) => (
                      <div
                        key={msg._id}
                        className={`rounded-lg border p-3 ${
                          msg._id === selectedMessage.message._id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {getSenderName(msg.sender_id)}
                        </div>
                        <div className="text-sm">{msg.text}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Click on a message to view context
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
