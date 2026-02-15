import React from 'react';
import { websocketService } from '../../../services/websocket';
import { useNotificationStore } from '../../../stores/notificationStore';

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  myMarketStatus: 'position' | 'whale' | null;
  myPositionSizeUSD: number;
  conversationId: string;
}

export const PositionModal: React.FC<PositionModalProps> = ({
  isOpen,
  onClose,
  myMarketStatus,
  myPositionSizeUSD,
  conversationId,
}) => {
  const { addNotification } = useNotificationStore();
  
  if (!isOpen) return null;
  
  return (
    // PASTE POSITION MODAL CODE HERE (lines 2713-2859 from ChatRoom.tsx)
    <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => onClose()}
        >
          <div
            style={{
              backgroundColor: '#19191A',
              border: '1px solid #333',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '18px',
              color: '#FFFFFF',
              margin: '0 0 16px 0',
              textAlign: 'center',
            }}>
              Your Position
            </h3>
            
            <div style={{
              backgroundColor: '#0F0F0F',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <span style={{ fontSize: '32px' }}>
                  {myMarketStatus === 'whale' ? '🐳' : '⚡'}
                </span>
                <span style={{
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#5BC854',
                }}>
                  ${myPositionSizeUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '13px',
                color: '#888',
                textAlign: 'center',
              }}>
                {myMarketStatus === 'whale' ? 'Whale Position' : 'Position Value'}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '8px',
            }}>
              <button
                onClick={() => onClose()}
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid #333',
                  borderRadius: '20px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '14px',
                  color: '#888',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              
              <button
                onClick={async () => {
                  onClose();
                  try {
                    const positionText = `${myMarketStatus === 'whale' ? '🐳' : '⚡'} $${myPositionSizeUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    
                    websocketService.sendMessage(
                      conversationId,
                      positionText,
                      undefined,
                      [],
                      {
                        type: 'position_share',
                        positionSizeUSD: myPositionSizeUSD,
                        isWhale: myMarketStatus === 'whale',
                      }
                    );
                    
                    addNotification({
                      type: 'system',
                      title: 'Position Shared',
                      message: 'Your position has been shared in the chat',
                    });
                  } catch (error) {
                    console.error('Failed to share position:', error);
                    addNotification({
                      type: 'system',
                      title: 'Error',
                      message: 'Failed to share position',
                    });
                  }
                }}
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #5BC854, #082724)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '14px',
                  color: '#5BC854',
                  cursor: 'pointer',
                }}
              >
                Share in Chat
              </button>
            </div>
          </div>
        </div>
  );
};
