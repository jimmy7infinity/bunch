'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api';
import { User, Message } from '@/types';
import { Search, Ban, Volume2, Trash2, X } from 'lucide-react';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (showAll) {
      loadAllUsers();
    }
  }, [showAll]);

  const loadAllUsers = async () => {
    // For now, we'll search with empty query to get some users
    // In production, you'd want a dedicated endpoint for listing all users
    try {
      setLoading(true);
      const data = await adminApi.searchUsers('', 100);
      setAllUsers(data.users.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const data = await adminApi.searchUsers(searchQuery);
      setUsers(data.users.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      setShowAll(false);
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
      const updateUserStatus = (u: User) => u._id === userId ? { ...u, status: 'banned' as const } : u;
      setUsers(users.map(updateUserStatus));
      setAllUsers(allUsers.map(updateUserStatus));
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
    if (!confirm('Delete ALL messages from this user? This cannot be undone.')) return;

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

  const displayUsers = showAll ? allUsers : users;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-lg mt-1">Search and manage users</p>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Search by username, display name, or Twitter username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)}
              disabled={loading}
            >
              {showAll ? 'Hide All' : 'Show All'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>
              {showAll ? `All Users (${displayUsers.length})` : `Search Results (${displayUsers.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : displayUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {showAll ? 'No users found' : 'Search for users to see results'}
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {displayUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleViewUser(user._id)}
                  >
                    {user.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {user.display_name || user.username}
                      </div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{user.rank}</span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          user.status === 'banned'
                            ? 'bg-red-500/20 text-red-400'
                            : user.status === 'suspended'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Details</CardTitle>
            {selectedUser && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedUser(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {selectedUser.user.avatar_url && (
                    <img
                      src={selectedUser.user.avatar_url}
                      alt={selectedUser.user.username}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {selectedUser.user.display_name || selectedUser.user.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{selectedUser.user.username}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Rank: {selectedUser.user.rank}</span>
                      <span>•</span>
                      <span>Role: {selectedUser.user.role}</span>
                      <span>•</span>
                      <span>Messages: {selectedUser.messageCount}</span>
                    </div>
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
                    Ban
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMuteUser(selectedUser.user._id, 24)}
                  >
                    <Volume2 className="h-4 w-4 mr-1" />
                    24h
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMuteUser(selectedUser.user._id, 168)}
                  >
                    <Volume2 className="h-4 w-4 mr-1" />
                    7d
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteAllMessages(selectedUser.user._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete All
                  </Button>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Recent Messages</h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedUser.recentMessages.slice(0, 10).map((msg: Message) => (
                      <div key={msg._id} className="rounded-lg border border-border/50 bg-background/50 p-2 text-sm">
                        {msg.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a user to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
