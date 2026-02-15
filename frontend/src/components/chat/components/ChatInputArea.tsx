import React from 'react';

interface ChatInputAreaProps {
  message: string;
  onMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  showMentionPicker: boolean;
  showMediaMenu: boolean;
  setShowMediaMenu: (show: boolean) => void;
  setShowGifPicker: (show: boolean) => void;
  isUploadingImage: boolean;
  messageInputRef: React.RefObject<HTMLTextAreaElement>;
  imageInputRef: React.RefObject<HTMLInputElement>;
  mediaMenuRef: React.RefObject<HTMLDivElement>;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  message,
  onMessageChange,
  onSendMessage,
  onImageUpload,
  showMentionPicker,
  showMediaMenu,
  setShowMediaMenu,
  setShowGifPicker,
  isUploadingImage,
  messageInputRef,
  imageInputRef,
  mediaMenuRef,
}) => {
  return (
    // PASTE CHAT INPUT AREA CODE HERE (lines 2499-2694 from ChatRoom.tsx)
    <div
          className="message-input-container"
          style={{
            width: '90%',
            marginTop: '10px',
            minHeight: '60px',
            backgroundColor: '#19191A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            gap: '10px',
          }}
        >
            {/* Media Button (GIF + Image) */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMediaMenu(!showMediaMenu)}
                disabled={isUploadingImage}
                style={{
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  backgroundColor: '#19191A',
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                  opacity: isUploadingImage ? 0.5 : 1,
                }}
              >
                {isUploadingImage ? (
                  <span style={{ fontSize: '12px', color: '#5BC854' }}>...</span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#909090" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                )}
              </button>

              {/* Media Menu Popup */}
              {showMediaMenu && (
                <div
                  ref={mediaMenuRef}
                  style={{
                    position: 'absolute',
                    bottom: '50px',
                    left: '0',
                    backgroundColor: '#19191A',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    zIndex: 100,
                  }}
                >
                  <button
                    onClick={() => {
                      setShowMediaMenu(false);
                      setShowGifPicker(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#D3D3D3',
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#242424'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '16px' }}>GIF</span>
                  </button>
                  <div style={{ height: '1px', backgroundColor: '#333' }} />
                  <button
                    onClick={() => {
                      setShowMediaMenu(false);
                      imageInputRef.current?.click();
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#D3D3D3',
                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#242424'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#909090" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              style={{ display: 'none' }}
            />

            {/* Send Button */}
            <button
              className="send-button"
              onClick={onSendMessage}
              disabled={!message.trim()}
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                backgroundColor: '#19191A',
                border: '1px solid transparent',
                backgroundImage: message.trim() 
                  ? 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #5BC854, #082724)'
                  : 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: message.trim() ? 'pointer' : 'not-allowed',
                opacity: message.trim() ? 1 : 0.5,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={message.trim() ? "#5BC854" : "#707070"} strokeWidth="2">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>

            {/* Message Input */}
            <textarea
              ref={messageInputRef}
              value={message}
              onChange={onMessageChange}
              onKeyDown={(e) => {
                // If mention picker is open and Enter is pressed, close it and let message send
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Type your message here…"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#CBCBCB',
                fontSize: '12px',
                fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '300',
                resize: 'none',
                minHeight: '40px',
                maxHeight: '120px',
                overflowY: 'auto',
                paddingTop: '10px',
              }}
              className="message-input-field"
              rows={1}
            />
        </div>
  );
};
