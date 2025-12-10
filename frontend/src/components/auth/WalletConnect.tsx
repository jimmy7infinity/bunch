import { useState } from 'react';
import { authService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const WalletConnect = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if MetaMask is installed
      if (!window.ethereum) {
        setError('Please install MetaMask to continue');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const walletAddress = accounts[0];

      // Get nonce from backend
      const { message } = await authService.getNonce();

      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      // Send to backend for verification
      const authResponse = await authService.loginWithWallet(
        walletAddress,
        signature,
        message
      );

      // Save auth state
      setAuth(authResponse.user, authResponse.access_token);

      console.log('✅ Logged in successfully:', authResponse.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">PolyBanter</h1>
        <p className="text-center text-muted-foreground mb-8">
          Social chat for Polymarket
        </p>

        <button
          onClick={connectWallet}
          disabled={loading}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <p className="mt-6 text-xs text-center text-muted-foreground">
          By connecting, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

