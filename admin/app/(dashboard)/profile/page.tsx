'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bunch.up.railway.app/api';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getMe();
      setUser(data);
      setFormData({
        username: data.username || '',
        display_name: data.display_name || '',
        bio: data.bio || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.patch(
        `${API_URL}/users/me`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[var(--color-muted-foreground)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-[var(--color-muted-foreground)] text-lg mt-1">Manage your admin profile</p>
      </div>

      <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            {!editing && (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {user?.avatar_url && (
            <div className="flex justify-center">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-24 h-24 rounded-full"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              {editing ? (
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                />
              ) : (
                <div className="text-sm p-3 rounded-lg bg-[var(--color-muted)]/30">
                  @{user?.username}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Display Name</label>
              {editing ? (
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Display Name"
                />
              ) : (
                <div className="text-sm p-3 rounded-lg bg-[var(--color-muted)]/30">
                  {user?.display_name || 'Not set'}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bio</label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="flex min-h-[100px] w-full rounded-lg border-2 border-[var(--color-input)] bg-[var(--color-background)] px-4 py-2 text-sm transition-all duration-200 placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:border-[var(--color-primary)]"
                />
              ) : (
                <div className="text-sm p-3 rounded-lg bg-[var(--color-muted)]/30 min-h-[100px]">
                  {user?.bio || 'No bio set'}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <div className="text-sm p-3 rounded-lg bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/30">
                <span className="font-semibold capitalize">{user?.role}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rank</label>
              <div className="text-sm p-3 rounded-lg bg-[var(--color-muted)]/30">
                {user?.rank}
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => {
                setEditing(false);
                setFormData({
                  username: user?.username || '',
                  display_name: user?.display_name || '',
                  bio: user?.bio || '',
                });
              }}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Twitter Username</span>
            <span className="font-medium">@{user?.twitter_username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Account Created</span>
            <span className="font-medium">{new Date(user?.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Last Seen</span>
            <span className="font-medium">{new Date(user?.last_seen_at).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
