import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { WalletConnect } from './components/auth/WalletConnect';
import { ChatsList } from './components/chat/ChatsList';
import { NotificationBanner } from './components/common/NotificationBanner';

function App() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if we're returning from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Fetch user data with the token
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(userData => {
          // Save auth data
          setAuth(userData, token);
          // Clear URL params
          window.history.replaceState({}, document.title, '/');
        })
        .catch(error => {
          console.error('Failed to fetch user data:', error);
        })
        .finally(() => {
          setIsCheckingAuth(false);
        });
    } else {
      setIsCheckingAuth(false);
    }
  }, [setAuth]);

  if (isCheckingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#19191A',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <NotificationBanner />}
      {isAuthenticated ? <ChatsList /> : <WalletConnect />}
    </>
  );
}

export default App;
