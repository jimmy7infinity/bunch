'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { User, Message } from '@/types';
import { Search, Ban, Volume2, Trash2 } from 'lucide-react';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const data = await adminApi.searchUsers(searchQuery);
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const data = await adminApi.getUserDetails(userId);
      setSelectedUser(data);
    } catch (error) {
      console.error('Failed to load user details:', error);
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    try {
      await adminApi.banUser(userId, reason, true);
      alert('User banned successfully');
      setUsers(users.map((u) => (u._id === userId ? { ...u, status: 'banned' as const } : u)));
      if (selectedUser?.user._id === userId) {
        setSelectedUser({ ...selectedUser, user: { ...selectedUser.user, status: 'banned' } });
      }
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user');
    }
  };

  const handleMuteUser = async (userId: string, duration: number) => {
    try {
      await adminApi.muteUser(userId, duration);
      alert(`User muted for ${duration} hours`);
    } catch (error) {
      console.error('Failed to mute user:', error);
      alert('Failed to mute user');
    }
  };

  const handleDeleteAllMessages = async (userId: string) => {
    if (!confirm('Are you sure you want to delete ALL messages from this user? This cannot be undone.')) {
      return;
    }

    try {
      const result = await adminApi.deleteAllUserMessages(userId);
      alert(`Deleted ${result.deletedCount} messages`);
      if (selectedUser?.user._id === userId) {
        setSelectedUser({ ...selectedUser, recentMessages: [] });
      }
    } catch (error) {
      console.error('Failed to delete messages:', error);
      alert('Failed to delete messages');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Search and manage user accounts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by username, display name, or Twitter username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center text-muted-foreground">
                Search for users to see results
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.display_name || user.username}</div>
                          <div className="text-xs text-muted-foreground">@{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{user.rank}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user.status === 'banned'
                              ? 'bg-red-100 text-red-800'
                              : user.status === 'suspended'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUser(user._id)}
                        >
                          View
                        </Button>
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
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {selectedUser.user.avatar_url && (
                    <img
                      src={selectedUser.user.avatar_url}
                      alt={selectedUser.user.username}
                      className="h-16 w-16 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {selectedUser.user.display_name || selectedUser.user.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{selectedUser.user.username}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Rank: {selectedUser.user.rank} | Role: {selectedUser.user.role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Messages: {selectedUser.messageCount}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBanUser(selectedUser.user._id)}
                    disabled={selectedUser.user.status === 'banned'}
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Ban User
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMuteUser(selectedUser.user._id, 24)}
                  >
                    <Volume2 className="h-4 w-4 mr-1" />
                    Mute 24h
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMuteUser(selectedUser.user._id, 168)}
                  >
                    <Volume2 className="h-4 w-4 mr-1" />
                    Mute 7d
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteAllMessages(selectedUser.user._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete All Messages
                  </Button>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Recent Messages</h4>
                  <div className="space-y-2">
                    {selectedUser.recentMessages.slice(0, 10).map((msg: Message) => (
                      <div key={msg._id} className="rounded-lg border p-2 text-sm">
                        {msg.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Select a user to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
