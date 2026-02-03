import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { useNotificationStore } from './stores/notificationStore';
import { WalletConnect } from './components/auth/WalletConnect';
import { BetaActivation } from './components/auth/BetaActivation';
import { ChatsList } from './components/chat/ChatsList';
import { NotificationBanner } from './components/common/NotificationBanner';
import { initializeMarketDetection } from './services/marketDetection';
import { authService } from './services/api';

function App() {
  const { isAuthenticated, setAuth, logout } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [requiresBetaActivation, setRequiresBetaActivation] = useState(false);

  useEffect(() => {
    // Check if we're returning from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      console.log('🔑 OAuth callback detected with token');
      
      // Check if we're running as Chrome extension
      const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
      
      if (isExtension) {
        console.log('📦 Running as extension - storing token and closing tab');
        // Store token in chrome.storage for extension
        chrome.storage.local.set({ authToken: token }, () => {
          console.log('✅ Token stored, closing callback tab');
          // Close this tab
          window.close();
        });
      } else {
        // Regular web app flow
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
      }
    } else {
      // No token in URL - check if we're extension and have stored token
      const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
      
      if (isExtension) {
        console.log('📦 Extension startup - checking for stored token');
        chrome.storage.local.get(['authToken'], (result) => {
          console.log('📥 chrome.storage.local result:', result);
          if (result.authToken) {
            console.log('🔑 Found stored token:', result.authToken.substring(0, 20) + '...');
            console.log('🔑 Token length:', result.authToken.length);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            console.log('📡 Fetching user from:', `${apiUrl}/auth/me`);
            console.log('📡 With Authorization header:', `Bearer ${result.authToken.substring(0, 20)}...`);
            
            fetch(`${apiUrl}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${result.authToken}`,
              },
            })
              .then(res => {
                console.log('📥 /auth/me response status:', res.status);
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                return res.json();
              })
              .then(userData => {
                console.log('✅ User data received:', userData);
                setAuth(userData, result.authToken);
                setIsCheckingAuth(false);
              })
              .catch(error => {
                console.error('Failed to fetch user data:', error);
                console.error('Error details:', error.message);
                setIsCheckingAuth(false);
              });
          } else {
            console.log('❌ No stored token found');
            setIsCheckingAuth(false);
          }
        });
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [setAuth]);

  // Check beta status when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      checkBetaStatus();
    }
  }, [isAuthenticated]);

  const checkBetaStatus = async () => {
    try {
      // Get current user from store
      const currentUser = useAuthStore.getState().user;
      
      // Admins, mods, and creators always have access
      if (currentUser?.role === 'admin' || 
          currentUser?.role === 'moderator' || 
          currentUser?.rank === 'CREATOR') {
        setRequiresBetaActivation(false);
        initializeMarketDetection();
        return;
      }

      const status = await authService.getBetaStatus();
      setRequiresBetaActivation(status.requiresActivation);
      
      // Only initialize market detection if beta access is granted
      if (status.betaAccess) {
        initializeMarketDetection();
      }
    } catch (error) {
      console.error('Failed to check beta status:', error);
    }
  };

  const handleBetaActivationSuccess = () => {
    setRequiresBetaActivation(false);
    initializeMarketDetection();
    addNotification({
      type: 'success',
      title: 'Welcome!',
      message: 'Beta access activated successfully 🚀',
    });
  };

  // Listen for WebSocket notifications
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const notification = event.detail;
      addNotification({
        type: notification.type || 'system',
        title: notification.type === 'reply' ? 'New Reply' : (notification.title || 'Notification'),
        message: notification.message,
        data: {
          ...notification.data,
          conversationId: notification.conversationId,
          messageId: notification.messageId,
          senderId: notification.senderId,
        },
      });
    };

    window.addEventListener('ws-notification', handleNotification as EventListener);
    return () => {
      window.removeEventListener('ws-notification', handleNotification as EventListener);
    };
  }, [addNotification]);

  // Listen for storage changes (auth updates) - for instant login without refresh
  useEffect(() => {
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    
    if (!isExtension) return;
    
    const handleStorageChange = (changes: any, area: string) => {
      if (area === 'local' && changes.authToken) {
        const newToken = changes.authToken.newValue;
        
        if (newToken) {
          console.log('🔑 Auth token updated in storage, fetching user data');
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          
          fetch(`${apiUrl}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
          })
            .then(res => res.json())
            .then(userData => {
              setAuth(userData, newToken);
              console.log('✅ Logged in automatically after OAuth!');
            })
            .catch(error => {
              console.error('Failed to fetch user data:', error);
            });
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
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
      {!isAuthenticated ? (
        <WalletConnect />
      ) : requiresBetaActivation ? (
        <BetaActivation 
          onSuccess={handleBetaActivationSuccess}
          onLogout={logout}
        />
      ) : (
        <ChatsList />
      )}
    </>
  );
}

export default App;
