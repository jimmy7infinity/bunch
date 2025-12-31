import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    // Get token from URL query params
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
          // Redirect to main app
          navigate('/');
        })
        .catch(error => {
          console.error('Failed to fetch user data:', error);
          navigate('/');
        });
    } else {
      // No token, redirect to home
      navigate('/');
    }
  }, [navigate, setAuth]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      backgroundColor: '#19191A',
      color: 'white'
    }}>
      <div>
        <h2>Logging you in...</h2>
        <p>Please wait...</p>
      </div>
    </div>
  );
};

