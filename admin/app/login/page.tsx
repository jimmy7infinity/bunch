'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bunch.up.railway.app/api';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we got a token from OAuth callback
    const token = searchParams.get('token');
    if (token) {
      handleTokenLogin(token);
    }
  }, [searchParams]);

  const handleTokenLogin = async (token: string) => {
    try {
      setLoading(true);
      localStorage.setItem('admin_token', token);
      
      // Verify user has admin/mod role
      const user = await adminApi.getMe();
      if (!['admin', 'moderator', 'creator'].includes(user.role)) {
        setError('Access denied. Admin privileges required.');
        localStorage.removeItem('admin_token');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError('Authentication failed. Please try again.');
      localStorage.removeItem('admin_token');
      setLoading(false);
    }
  };

  const handleTwitterLogin = () => {
    setLoading(true);
    // Redirect to backend Twitter OAuth
    const backendUrl = API_URL.replace('/api', '');
    const redirectUri = window.location.origin + '/login';
    window.location.href = `${backendUrl}/api/auth/twitter?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bunch Admin Panel</CardTitle>
          <CardDescription>Sign in with Twitter to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <Button 
            onClick={handleTwitterLogin} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in with Twitter'}
          </Button>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Admin Access Required</p>
            <p className="text-muted-foreground">
              Only users with admin, moderator, or creator roles can access this panel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
