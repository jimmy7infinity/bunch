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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            Bunch Admin
          </CardTitle>
          <CardDescription className="text-base">
            Sign in with Twitter to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <Button 
            onClick={handleTwitterLogin} 
            className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in with Twitter'
            )}
          </Button>

          <div className="rounded-lg bg-muted/50 border border-border/50 p-4 text-sm space-y-2">
            <p className="font-medium text-foreground">🔒 Admin Access Required</p>
            <p className="text-muted-foreground leading-relaxed">
              Only users with admin, moderator, or creator roles can access this panel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
