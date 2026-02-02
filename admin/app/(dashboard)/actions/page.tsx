'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api';
import { Megaphone, MessageCircle } from 'lucide-react';

export default function ActionsPage() {
  const [announcement, setAnnouncement] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) {
      alert('Please enter an announcement message');
      return;
    }

    try {
      setLoading(true);
      await adminApi.sendAnnouncement(announcement);
      alert('Announcement sent successfully!');
      setAnnouncement('');
    } catch (error) {
      console.error('Failed to send announcement:', error);
      alert('Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSystemMessage = async () => {
    if (!conversationId.trim() || !systemMessage.trim()) {
      alert('Please enter both conversation ID and message');
      return;
    }

    try {
      setLoading(true);
      await adminApi.sendSystemMessage(conversationId, systemMessage);
      alert('System message sent successfully!');
      setSystemMessage('');
      setConversationId('');
    } catch (error) {
      console.error('Failed to send system message:', error);
      alert('Failed to send system message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Actions</h1>
        <p className="text-muted-foreground">Send announcements and system messages</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              <CardTitle>Global Announcement</CardTitle>
            </div>
            <CardDescription>
              Send an announcement to all users in the General chat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="announcement" className="text-sm font-medium">
                Announcement Message
              </label>
              <textarea
                id="announcement"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your announcement message..."
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
              />
            </div>
            <Button onClick={handleSendAnnouncement} disabled={loading} className="w-full">
              <Megaphone className="mr-2 h-4 w-4" />
              Send Global Announcement
            </Button>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Preview:</p>
              <p className="mt-1 text-muted-foreground">
                📢 <strong>ANNOUNCEMENT:</strong> {announcement || '(your message here)'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle>System Message</CardTitle>
            </div>
            <CardDescription>
              Send a system message to a specific chat room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="conversationId" className="text-sm font-medium">
                Conversation ID
              </label>
              <Input
                id="conversationId"
                placeholder="Enter conversation ID"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can find the conversation ID in the Messages section
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="systemMessage" className="text-sm font-medium">
                System Message
              </label>
              <textarea
                id="systemMessage"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter system message..."
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
              />
            </div>
            <Button onClick={handleSendSystemMessage} disabled={loading} className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send System Message
            </Button>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Preview:</p>
              <p className="mt-1 text-muted-foreground">
                🔔 <strong>SYSTEM:</strong> {systemMessage || '(your message here)'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <h4 className="font-medium">Global Announcements:</h4>
            <ul className="ml-4 mt-1 list-disc space-y-1 text-muted-foreground">
              <li>Use for platform-wide updates, maintenance notices, or important news</li>
              <li>Sent to the General global chat room</li>
              <li>All users will see the announcement</li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="font-medium">System Messages:</h4>
            <ul className="ml-4 mt-1 list-disc space-y-1 text-muted-foreground">
              <li>Use for room-specific notifications or warnings</li>
              <li>Requires the conversation ID of the target room</li>
              <li>Only users in that specific room will see the message</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
