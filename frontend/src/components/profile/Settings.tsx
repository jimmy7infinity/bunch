import React, { useState, useEffect } from 'react';
import { polymarketService, userService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ethers } from 'ethers';
import './Settings.css';

// Declare ethereum on window object
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  
  // Wallet linking state
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);
  const [walletError, setWalletError] = useState('');
  
  // Polymarket verification state
  const { user, refreshUser, logout } = useAuthStore();
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [polymarketUsername, setPolymarketUsername] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  // Auto-join prediction chats setting
  const [autoPredictionChat, setAutoPredictionChat] = useState(user?.settings?.autoPredictionChat ?? true);

  // Load verification status on mount
  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      const status = await polymarketService.getVerificationStatus();
      if (status.has_pending_token) {
        // Fetch the token again if there's a pending one
        const { token } = await polymarketService.startVerification();
        setVerificationToken(token);
        setShowVerification(true);
      }
    } catch (error) {
      console.error('Failed to load verification status:', error);
    }
  };

  const handleStartVerification = async () => {
    try {
      setVerificationStatus('loading');
      const { token } = await polymarketService.startVerification();
      setVerificationToken(token);
      setShowVerification(true);
      setVerificationStatus('idle');
    } catch (error) {
      console.error('Failed to start verification:', error);
      setVerificationMessage('Failed to start verification. Please try again.');
      setVerificationStatus('error');
    }
  };

  const handleCopyToken = () => {
    if (verificationToken) {
      navigator.clipboard.writeText(verificationToken);
      setVerificationMessage('Token copied to clipboard!');
      setTimeout(() => setVerificationMessage(''), 3000);
    }
  };

  const handleConfirmVerification = async () => {
    if (!polymarketUsername.trim()) {
      setVerificationMessage('Please enter your Polymarket username');
      setVerificationStatus('error');
      return;
    }

    try {
      setVerificationStatus('loading');
      const result = await polymarketService.confirmVerification(polymarketUsername);
      
      if (result.success) {
        setVerificationStatus('success');
        setVerificationMessage(result.message);
        setVerificationToken(null);
        setShowVerification(false);
        setPolymarketUsername('');
        // Refresh user data to get updated polymarket info
        await refreshUser();
      } else {
        setVerificationStatus('error');
        setVerificationMessage(result.message);
      }
    } catch (error: any) {
      console.error('Verification failed:', error);
      setVerificationStatus('error');
      setVerificationMessage(error.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  const handleToggleAutoPredictionChat = async () => {
    const newValue = !autoPredictionChat;
    setAutoPredictionChat(newValue);
    
    try {
      await userService.updateProfile({
        settings: { autoPredictionChat: newValue },
      });
      await refreshUser();
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert on error
      setAutoPredictionChat(!newValue);
    }
  };

  const handleLinkWallet = async () => {
    try {
      setIsLinkingWallet(true);
      setWalletError('');

      // Check if MetaMask or other Web3 provider is available
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet to continue');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      if (!address) {
        throw new Error('No wallet address found');
      }

      // Create message for signing
      const message = `Sign this message to link your wallet to Bunch.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;

      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Send to backend
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/users/link-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          wallet_address: address,
          signature,
          message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to link wallet');
      }

      const data = await response.json();
      console.log('✅ Wallet linked successfully:', data);

      // Refresh user data
      await refreshUser();
      
      alert('Wallet linked successfully!');
    } catch (error: any) {
      console.error('Failed to link wallet:', error);
      setWalletError(error.message || 'Failed to link wallet');
      alert(`Error: ${error.message || 'Failed to link wallet'}`);
    } finally {
      setIsLinkingWallet(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#19191A' 
    }}>
      {/* TOP BAR */}
      <div 
        className="settings-topbar"
        style={{
          height: '75px',
          backgroundColor: '#19191A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0 20px',
        }}
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="nav-icon-button"
          style={{
            position: 'absolute',
            left: '20px',
            width: '40px',
            height: '40px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BAB9B9" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Title with Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '15px',
            background: 'linear-gradient(135deg, #C0C0C0, #CBCBCB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Settings
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
          </svg>
        </div>
      </div>

      {/* SETTINGS CONTENT */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        gap: '15px',
      }}>
        {/* Notifications Section */}
        <div 
          className="bio-section"
          style={{
            width: '90%',
            maxWidth: '500px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '20px',
            padding: '20px',
          }}
        >
          <span style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '14px',
            color: '#B9B7B7',
            marginBottom: '15px',
            display: 'block',
          }}>
            Notifications
          </span>

          {/* Push Notifications Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
            borderBottom: '1px solid #333333',
          }}>
            <div>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '13px',
                color: '#D3D3D3',
                marginBottom: '4px',
              }}>
                Push Notifications
              </div>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '11px',
                color: '#707070',
              }}>
                Receive notifications for new messages
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="toggle-button"
              style={{
                width: '50px',
                height: '28px',
                backgroundColor: notificationsEnabled ? '#5BC854' : '#333333',
                border: 'none',
                borderRadius: '14px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: notificationsEnabled ? '25px' : '3px',
                transition: 'left 0.3s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }} />
            </button>
          </div>

          {/* Sound Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
          }}>
            <div>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '13px',
                color: '#D3D3D3',
                marginBottom: '4px',
              }}>
                Sound Effects
              </div>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '11px',
                color: '#707070',
              }}>
                Play sounds for new messages
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="toggle-button"
              style={{
                width: '50px',
                height: '28px',
                backgroundColor: soundEnabled ? '#5BC854' : '#333333',
                border: 'none',
                borderRadius: '14px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: soundEnabled ? '25px' : '3px',
                transition: 'left 0.3s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }} />
            </button>
          </div>
        </div>

        {/* Privacy Section */}
        <div 
          className="bio-section"
          style={{
            width: '90%',
            maxWidth: '500px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '20px',
            padding: '20px',
          }}
        >
          <span style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '14px',
            color: '#B9B7B7',
            marginBottom: '15px',
            display: 'block',
          }}>
            Privacy
          </span>

          {/* Private Profile Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
          }}>
            <div>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '13px',
                color: '#D3D3D3',
                marginBottom: '4px',
              }}>
                Private Profile
              </div>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '11px',
                color: '#707070',
              }}>
                Only friends can see your profile
              </div>
            </div>
            <button
              onClick={() => setPrivateProfile(!privateProfile)}
              className="toggle-button"
              style={{
                width: '50px',
                height: '28px',
                backgroundColor: privateProfile ? '#5BC854' : '#333333',
                border: 'none',
                borderRadius: '14px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: privateProfile ? '25px' : '3px',
                transition: 'left 0.3s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }} />
            </button>
          </div>
        </div>

        {/* Polymarket Verification Section */}
        {/* Hide if user signed up with wallet+Polymarket (already verified at signup) */}
        {!(user?.wallet_address && user?.polymarket?.verified && !user?.twitter_id) && (
          <div 
            className="bio-section"
            style={{
              width: '90%',
              maxWidth: '500px',
              backgroundColor: '#19191A',
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '20px',
              padding: '20px',
            }}
          >
          <span style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '14px',
            color: '#B9B7B7',
            marginBottom: '15px',
            display: 'block',
          }}>
            Polymarket Verification
          </span>

          {user?.polymarket?.verified ? (
            // Already verified
            <div style={{
              padding: '15px',
              backgroundColor: '#1A2E1A',
              border: '1px solid #2E5C2E',
              borderRadius: '10px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5BC854" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span style={{
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '13px',
                  color: '#5BC854',
                  fontWeight: 600,
                }}>
                  Verified
                </span>
              </div>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '12px',
                color: '#B9B7B7',
              }}>
                Connected: <span style={{ color: '#D3D3D3' }}>{user.polymarket.username}</span>
              </div>
            </div>
          ) : (
            // Not verified yet
            <>
              {!showVerification ? (
                <button
                  onClick={handleStartVerification}
                  disabled={verificationStatus === 'loading'}
                  className="settings-action-button"
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#19191A',
                    border: '1px solid #5C6B8A',
                    borderRadius: '10px',
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '13px',
                    color: '#7A9BCC',
                    cursor: verificationStatus === 'loading' ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    opacity: verificationStatus === 'loading' ? 0.6 : 1,
                  }}
                >
                  {verificationStatus === 'loading' ? 'Starting...' : 'Verify Polymarket Account'}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Step 1: Copy token */}
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#242424',
                    borderRadius: '10px',
                  }}>
                    <div style={{
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '12px',
                      color: '#B9B7B7',
                      marginBottom: '8px',
                    }}>
                      Step 1: Copy your verification token
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      backgroundColor: '#19191A',
                      borderRadius: '6px',
                      fontFamily: 'SF Mono, Consolas, monospace',
                      fontSize: '11px',
                      color: '#7A9BCC',
                      wordBreak: 'break-all',
                    }}>
                      <span style={{ flex: 1 }}>{verificationToken}</span>
                      <button
                        onClick={handleCopyToken}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#5C6B8A',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Add to Polymarket bio */}
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#242424',
                    borderRadius: '10px',
                  }}>
                    <div style={{
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '12px',
                      color: '#B9B7B7',
                      marginBottom: '8px',
                    }}>
                      Step 2: Add token to your Polymarket bio
                    </div>
                    <a
                      href="https://polymarket.com/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '8px 12px',
                        backgroundColor: '#5C6B8A',
                        border: 'none',
                        borderRadius: '6px',
                        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '12px',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Open Polymarket Settings →
                    </a>
                  </div>

                  {/* Step 3: Confirm */}
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#242424',
                    borderRadius: '10px',
                  }}>
                    <div style={{
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '12px',
                      color: '#B9B7B7',
                      marginBottom: '4px',
                    }}>
                      Step 3: Enter your Polymarket username
                    </div>
                    <div style={{
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '10px',
                      color: '#707070',
                      marginBottom: '8px',
                    }}>
                      From your profile URL: polymarket.com/<span style={{ color: '#7A9BCC' }}>@yourname</span>
                    </div>
                    <input
                      type="text"
                      value={polymarketUsername}
                      onChange={(e) => setPolymarketUsername(e.target.value)}
                      placeholder="yourname (without @)"
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#19191A',
                        border: '1px solid #333333',
                        borderRadius: '6px',
                        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '12px',
                        color: '#D3D3D3',
                        marginBottom: '8px',
                      }}
                    />
                    <button
                      onClick={handleConfirmVerification}
                      disabled={verificationStatus === 'loading'}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#5BC854',
                        border: 'none',
                        borderRadius: '6px',
                        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '12px',
                        color: '#FFFFFF',
                        cursor: verificationStatus === 'loading' ? 'not-allowed' : 'pointer',
                        opacity: verificationStatus === 'loading' ? 0.6 : 1,
                      }}
                    >
                      {verificationStatus === 'loading' ? 'Checking profile... (may take up to 20s)' : 'I\'ve added it - Verify'}
                    </button>
                  </div>
                </div>
              )}

              {/* Status message */}
              {verificationMessage && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px',
                  backgroundColor: verificationStatus === 'success' ? '#1A2E1A' : verificationStatus === 'error' ? '#2E1A1A' : '#242424',
                  border: `1px solid ${verificationStatus === 'success' ? '#2E5C2E' : verificationStatus === 'error' ? '#5C2E2E' : '#333333'}`,
                  borderRadius: '6px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '11px',
                  color: verificationStatus === 'success' ? '#5BC854' : verificationStatus === 'error' ? '#C85454' : '#B9B7B7',
                }}>
                  {verificationMessage}
                </div>
              )}
            </>
          )}
        </div>
        )}

        {/* Polymarket Settings Section */}
        <div 
          className="bio-section"
          style={{
            width: '90%',
            maxWidth: '500px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '20px',
            padding: '20px',
          }}
        >
          <span style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '14px',
            color: '#B9B7B7',
            marginBottom: '15px',
            display: 'block',
          }}>
            Polymarket Features
          </span>

          {/* Auto-join Prediction Chats Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
            gap: '12px',
          }}>
            <div style={{ flex: '1', minWidth: 0 }}>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '13px',
                color: '#D3D3D3',
                marginBottom: '4px',
              }}>
                Auto-join Prediction Chats
              </div>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '11px',
                color: '#707070',
              }}>
                Automatically join market chats while browsing Polymarket
              </div>
            </div>
            <button
              onClick={handleToggleAutoPredictionChat}
              className="toggle-button"
              style={{
                width: '50px',
                height: '28px',
                backgroundColor: autoPredictionChat ? '#5BC854' : '#333333',
                border: 'none',
                borderRadius: '14px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: autoPredictionChat ? '25px' : '3px',
                transition: 'left 0.3s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }} />
            </button>
          </div>
        </div>

        {/* Connected Accounts Section */}
        <div 
          className="bio-section"
          style={{
            width: '90%',
            maxWidth: '500px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '20px',
            padding: '20px',
          }}
        >
          <span style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '14px',
            color: '#B9B7B7',
            marginBottom: '15px',
            display: 'block',
          }}>
            Connected Accounts
          </span>

          {/* Twitter/X Connection */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#242424',
            borderRadius: '10px',
            marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/x-logo.png" alt="X" style={{ width: '20px', height: '20px' }} />
              <div>
                <div style={{
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '11px',
                  color: '#E5E5E5',
                }}>
                  X (Twitter)
                </div>
                {user?.twitter_username && (
                  <div style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '10px',
                    color: '#707070',
                  }}>
                    @{user.twitter_username}
                  </div>
                )}
              </div>
            </div>
            {user?.twitter_id ? (
              <span style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '10px',
                color: '#5BC854',
              }}>
                Connected
              </span>
            ) : (
              <button
                onClick={() => {
                  const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://bunch.up.railway.app';
                  window.open(`${apiUrl}/api/auth/twitter`, '_blank', 'width=420,height=700');
                }}
                style={{
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '10px',
                  color: '#5BC854',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Connect
              </button>
            )}
          </div>

          {/* Wallet Connection */}
          {/* Only show if user doesn't have a wallet yet AND has Twitter account */}
          {!user?.wallet_address && user?.twitter_id && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#242424',
              borderRadius: '10px',
              marginBottom: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17 9V7C17 5.89543 16.1046 5 15 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H15C16.1046 19 17 18.1046 17 17V15M17 9H19C20.1046 9 21 9.89543 21 11V13C21 14.1046 20.1046 15 19 15H17M17 9V15M17 15V17"
                    stroke="#B9B7B7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="14" cy="12" r="1" fill="#B9B7B7" />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '11px',
                    color: '#E5E5E5',
                  }}>
                    Crypto Wallet
                  </div>
                  <div style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '9px',
                    color: '#707070',
                    marginTop: '2px',
                  }}>
                    Verify your Polymarket account to link wallet
                  </div>
                </div>
              </div>
              <span style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '10px',
                color: '#707070',
              }}>
                Not connected
              </span>
            </div>
          )}

          {/* Show wallet if already connected (read-only) */}
          {user?.wallet_address && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#242424',
              borderRadius: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17 9V7C17 5.89543 16.1046 5 15 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H15C16.1046 19 17 18.1046 17 17V15M17 9H19C20.1046 9 21 9.89543 21 11V13C21 14.1046 20.1046 15 19 15H17M17 9V15M17 15V17"
                    stroke="#B9B7B7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="14" cy="12" r="1" fill="#B9B7B7" />
                </svg>
                <div>
                  <div style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '11px',
                    color: '#E5E5E5',
                  }}>
                    Crypto Wallet
                  </div>
                  <div style={{
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '10px',
                    color: '#707070',
                  }}>
                    {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                  </div>
                </div>
              </div>
              <span style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '10px',
                color: '#5BC854',
              }}>
                Connected
              </span>
            </div>
          )}
        </div>

        {/* Account Section */}
        <div 
          className="bio-section"
          style={{
            width: '90%',
            maxWidth: '500px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '20px',
            padding: '20px',
          }}
        >
          <span style={{
            fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '14px',
            color: '#B9B7B7',
            marginBottom: '15px',
            display: 'block',
          }}>
            Account
          </span>

          {/* Delete Account */}
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
                try {
                  await userService.deleteAccount();
                  console.log('✅ Account deleted, logging out...');
                  
                  // Clear auth state
                  logout();
                  
                  // For Chrome extension, close the panel
                  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
                    console.log('📦 Extension detected, closing window');
                    window.close();
                  } else {
                    // For web app, force reload to login screen
                    console.log('🌐 Web app, reloading to root');
                    window.location.replace('/');
                  }
                } catch (error) {
                  console.error('Failed to delete account:', error);
                  alert('Failed to delete account. Please try again.');
                }
              }
            }}
            className="settings-action-button-danger"
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#19191A',
              border: '1px solid #8B2A2A',
              borderRadius: '10px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '13px',
              color: '#C85454',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Delete Account
          </button>
        </div>

        {/* App Info */}
        <div style={{
          width: '90%',
          maxWidth: '500px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '11px',
            color: '#606060',
            marginBottom: '5px',
          }}>
            Bunch v1.0.0
          </div>

          {/* Legal Section */}
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #2A2A2A',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
          }}>
            <div style={{
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#808080',
              fontWeight: '500',
            }}>
              Legal
            </div>
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}>
              <a
                href="https://bunch-extension.vercel.app/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#606060',
                  fontSize: '11px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#999'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#606060'}
              >
                Privacy Policy
              </a>
              <span style={{ color: '#404040', fontSize: '11px' }}>•</span>
              <a
                href="https://bunch-extension.vercel.app/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#606060',
                  fontSize: '11px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#999'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#606060'}
              >
                Terms of Service
              </a>
            </div>
          </div>

          <div style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '11px',
            color: '#606060',
            marginTop: '16px',
          }}>
            © 2026 All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
};


