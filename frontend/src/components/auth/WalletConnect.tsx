import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import './WalletConnect.css';

export const WalletConnect = () => {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  // Debug: Log when component mounts
  console.log('🎨 WalletConnect component rendered');
  console.log('🔧 Chrome runtime available:', typeof chrome !== 'undefined' && !!chrome.runtime);
  console.log('🔧 API URL:', import.meta.env.VITE_API_URL);

  const handleTwitterLogin = () => {
    console.log('🔵 Twitter login button clicked!');
    setLoading(true);
    
    // Redirect to backend Twitter OAuth endpoint
    const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const authUrl = `${apiUrl}/api/auth/twitter`;
    console.log('🔗 Auth URL:', authUrl);
    
    // Check if running as Chrome extension
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      console.log('🌐 Running as Chrome extension, sending message to service worker');
      // Send message to service worker to open tab
      chrome.runtime.sendMessage(
        { type: 'OPEN_AUTH_TAB', url: authUrl },
        (response) => {
          setLoading(false);
          if (chrome.runtime.lastError) {
            console.error('❌ Failed to open auth tab:', chrome.runtime.lastError);
            // Fallback to window.open
            console.log('🔄 Trying fallback: window.open');
            window.open(authUrl, '_blank');
          } else {
            console.log('✅ Auth tab opened successfully:', response);
          }
        }
      );
    } else {
      console.log('🌐 Running as web app, using window.location.href');
      // Regular redirect for web app
      window.location.href = authUrl;
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: '#19191A' }}
    >
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
        {/* MAIN LOGO */}
        <div style={{ width: '250px', height: '250px' }}>
          <img 
            src="/logo.png" 
            alt="PolyBanter Logo" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Division Element */}
        <div 
          style={{
            width: '80%',
            height: '10px',
            borderRadius: '5px',
            backgroundColor: '#19191A',
            boxShadow: 'inset -2px -2px 4px rgba(93, 93, 93, 0.15), inset 0px 2px 2px rgba(0, 0, 0, 0.25)'
          }}
        />

        <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        {/* BUTTON 1 */}
        <button
          onClick={handleTwitterLogin}
          disabled={loading}
          className="gradient-border-button"
          style={{
            width: '100%',
            height: '50px',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <img 
            src="/x-logo.png" 
            alt="X" 
            style={{
              width: '20px',
              height: '20px',
              position: 'absolute',
              left: '24px',
              objectFit: 'contain',
            }}
          />
          <span style={{ color: '#B9B7B7', fontSize: '10px', fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: '300' }}>
            {loading ? 'connecting...' : 'connect to X'}
          </span>
        </button>

        {/* BUTTON 2 */}
        <div
          className="gradient-border-button"
          style={{
            width: '100%',
            height: '50px',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '0 20px',
          }}
        >
          <img 
            src="/polymarket-logo.png" 
            alt="Polymarket" 
            style={{
              width: '20px',
              height: '20px',
              position: 'absolute',
              left: '24px',
              objectFit: 'contain',
            }}
          />
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="paste your PolyMarket address"
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#B9B7B7',
              fontSize: '10px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: '300',
              textAlign: 'center',
            }}
          />
        </div>
        </div>
      </div>
    </div>
  );
};
