import React, { useState } from 'react';
import './Settings.css';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);

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

          {/* Change Password */}
          <button
            className="settings-action-button"
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#19191A',
              border: '1px solid #333333',
              borderRadius: '10px',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '13px',
              color: '#D3D3D3',
              cursor: 'pointer',
              textAlign: 'left',
              marginBottom: '10px',
            }}
          >
            Change Password
          </button>

          {/* Delete Account */}
          <button
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
            PolyBanter v1.0.0
          </div>
          <div style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '11px',
            color: '#606060',
          }}>
            © 2024 All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
};

