import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import './WalletConnect.css';

export const WalletConnect = () => {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  // Debug: Log when component mounts
  console.log('🎨 WalletConnect component rendered');
  console.log('🔧 Chrome runtime available:', typeof chrome !== 'undefined' && !!chrome.runtime);
  console.log('🔧 API URL:', import.meta.env.VITE_API_URL);

  const handleTwitterLogin = () => {
    console.log('🔵 Twitter login button clicked!');
    setLoading(true);
    
    // Check if running as Chrome extension
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      console.log('📦 Extension detected, sending START_AUTH message to service worker');
      
      // Let the service worker handle OAuth using chrome.identity.launchWebAuthFlow
      chrome.runtime.sendMessage({ type: 'START_AUTH' }, (response) => {
        setLoading(false);
        if (chrome.runtime.lastError) {
          console.error('❌ Auth failed:', chrome.runtime.lastError);
        } else if (response?.success) {
          console.log('✅ Auth initiated successfully');
        }
      });
    } else {
      // Regular web app flow
      console.log('🌐 Running as web app, using direct redirect');
      const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
      window.location.href = `${apiUrl}/api/auth/twitter`;
    }
  };

  const handleWalletLogin = () => {
    console.log('🔵 Wallet login button clicked!');
    setLoading(true);
    
    // Open wallet auth page in new window (same pattern as Twitter OAuth)
    const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://bunch.up.railway.app';
    const authUrl = `${apiUrl}/api/auth/wallet`;
    
    console.log('🌐 Opening wallet auth window:', authUrl);
    window.open(
      authUrl,
      '_blank',
      'width=420,height=700,popup=yes'
    );
    
    // Reset loading after window opens
    setTimeout(() => setLoading(false), 1000);
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
            alt="Bunch Logo" 
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

        {/* Twitter LOGIN BUTTON */}
        <button
          onClick={handleTwitterLogin}
          disabled={loading}
          className="gradient-border-button"
          style={{
            width: '80%',
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

        {/* Wallet LOGIN BUTTON */}
        <button
          onClick={handleWalletLogin}
          disabled={loading}
          className="gradient-border-button"
          style={{
            width: '80%',
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              position: 'absolute',
              left: '24px',
            }}
          >
            <path
              d="M17 9V7C17 5.89543 16.1046 5 15 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H15C16.1046 19 17 18.1046 17 17V15M17 9H19C20.1046 9 21 9.89543 21 11V13C21 14.1046 20.1046 15 19 15H17M17 9V15M17 15V17"
              stroke="#B9B7B7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="14" cy="12" r="1" fill="#B9B7B7" />
          </svg>
          <span style={{ color: '#B9B7B7', fontSize: '10px', fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: '300' }}>
            connect wallet
          </span>
        </button>

        {/* Legal Links */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <a
            href="https://bunch-extension.vercel.app/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#666',
              fontSize: '10px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#999'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
          >
            Privacy Policy
          </a>
          <span style={{ color: '#444', fontSize: '10px' }}>•</span>
          <a
            href="https://bunch-extension.vercel.app/terms"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#666',
              fontSize: '10px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#999'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
};
