import React from 'react';
import { RankedPFP } from '../../common/RankedPFP';
import { getRankColors, getDisplayRank, getRankBorderStyle } from '../../../utils/ranks';
import { renderMessageWithMentions } from '../utils/messageRendering';
import { isImageMessage, isPositionShare } from '../utils/messageHelpers';
import { useNotificationStore } from '../../../stores/notificationStore';
import { userService, messageService } from '../../../services/api';
import { websocketService } from '../../../services/websocket';

interface MessageBubbleProps {
  message: any;
  isOwnMessage: boolean;
  conversationType: string;
  marketPositions: Record<string, 'yes' | 'no'>;
  whales: Record<string, boolean>;
  highlightedMessageId: string | null;
  participants: any[];
  onUserClick?: (userId: string) => void;
  onReply: (messageId: string, username: string, preview: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onScrollToMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  showMessageMenu: string | null;
  setShowMessageMenu: (id: string | null) => void;
  showReactionPicker: string | null;
  setShowReactionPicker: (id: string | null) => void;
  messageRef: (el: HTMLDivElement | null) => void;
  messageMenuRef: React.RefObject<HTMLDivElement>;
  reactionPickerRef: React.RefObject<HTMLDivElement>;
  reactionEmojis: string[];
  user: any;
}

export const MessageBubble: React.FC<MessageBubbleProps> = (props) => {
  const { 
    message: msg, 
    messageRef,
    isOwnMessage,
    conversationType,
    marketPositions,
    whales,
    highlightedMessageId,
    participants,
    onUserClick,
    onReply,
    onReact,
    onScrollToMessage,
    onDeleteMessage,
    showMessageMenu,
    setShowMessageMenu,
    showReactionPicker,
    setShowReactionPicker,
    messageMenuRef,
    reactionPickerRef,
    reactionEmojis,
    user,
  } = props;
  
  const { addNotification } = useNotificationStore();
  
  const senderName = msg.sender_id?.display_name || msg.sender_id?.username || 'Unknown';
  const isAI = msg.is_ai === true;
  const senderRank = getDisplayRank(msg.sender_id);
  
  // Get rank colors for border
  const rankColors = getRankColors(senderRank);
  const hasSpecialRank = senderRank.includes('+') || 
                         ['MOD', 'ADMIN', 'CREATOR'].includes(senderRank) ||
                         ['DIAMOND', 'ON FIRE', 'DANK', 'SIZE', 'NINJA', 'EARLY', 'TESTER'].includes(senderRank);
  
  // Use getRankBorderStyle for proper multi-color gradient support
  const borderGradient = hasSpecialRank
    ? getRankBorderStyle(senderRank)
    : 'linear-gradient(135deg, #707070, #333333)';
  
  // Check if this is a position share
  if (isPositionShare(msg.metadata)) {
    return (
      <div
        key={msg._id}
        ref={messageRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          gap: '4px',
          margin: '10px 0',
        }}
      >
        {/* Time - centered for system messages */}
        <span style={{
          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '10px',
          color: '#707070',
        }}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
        
        {/* System Message Bubble - No PFP, Centered */}
        <div
          style={{
            backgroundColor: '#2A2A2A',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#2A2A2A, #2A2A2A), linear-gradient(135deg, #505050, #3A3A3A)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            borderRadius: '20px',
            padding: '10px 16px',
            maxWidth: '70%',
            textAlign: 'center',
            boxShadow: '-2.5px -2.5px 5px rgba(255, 255, 255, 0.02), 5px 5px 15px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}>
            {/* Position Badge and Amount */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '20px' }}>
                {msg.metadata.isWhale ? '🐳' : '⚡'}
              </span>
              <span style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '15px',
                fontWeight: '600',
                color: '#FFFFFF',
              }}>
                ${msg.metadata.positionSizeUSD?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            {/* Position share text */}
            <span style={{
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              color: '#A0A0A0',
            }}>
              {senderName} shared their position
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular message
  return (
    <div 
      key={msg._id}
      ref={messageRef}
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        gap: '4px',
      }}>
      {/* Time - positioned above the straight part of bubble */}
      <span style={{
        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '10px',
        color: '#707070',
        alignSelf: isOwnMessage ? 'flex-end' : (isAI ? 'center' : 'flex-start'),
        marginLeft: isOwnMessage ? '0' : (isAI ? '0' : '93px'),
        marginRight: isOwnMessage ? '93px' : '0',
      }}>
        {/* Delivery status ticks for own messages - before time */}
        {isOwnMessage && (
          <span style={{ marginRight: '4px', fontSize: '10px', letterSpacing: '-3px' }}>
            {msg.status === 'pending' && '○'} {/* Single circle - sending */}
            {msg.status === 'sent' && '✓'} {/* Single tick - sent */}
            {(msg.status === 'delivered' || !msg.status) && '✓✓'} {/* Double tick - delivered */}
            {msg.status === 'read' && <span style={{ color: '#5BC854' }}>✓✓</span>} {/* Green double tick - read */}
            {msg.status === 'failed' && '✗'} {/* X - failed */}
          </span>
        )}
        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
      </span>

      {/* Message Container */}
      <div style={{
        display: 'flex',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: '10px',
        width: '100%',
      }}>
        {/* PFP */}
        {!isAI && (
          <div
            onClick={() => !isOwnMessage && onUserClick?.(msg.sender_id?._id || msg.sender_id?.id || '')}
            style={{ cursor: !isOwnMessage ? 'pointer' : 'default', flexShrink: 0 }}
          >
            <RankedPFP 
              rank={senderRank} 
              size="medium" 
              showRankLabel={true}
              avatarUrl={msg.sender_id?.avatar_url}
            />
          </div>
        )}

        {/* Check if message is an image/GIF */}
        {(() => {
                            const isImageMessage = msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com');
                            
                            return (
                          <div
                            style={{
                              position: 'relative', // Add position relative for absolute children
                              backgroundColor: isAI ? '#065C60' : (isOwnMessage ? '#5A5A5A' : '#242424'),
                              border: '1px solid transparent',
                              backgroundImage: isAI 
                                ? 'linear-gradient(#065C60, #065C60), linear-gradient(135deg, #00E4B6, #34DF87)'
                                : `linear-gradient(${isOwnMessage ? '#5A5A5A' : '#242424'}, ${isOwnMessage ? '#5A5A5A' : '#242424'}), ${borderGradient}`,
                              backgroundOrigin: 'border-box',
                              backgroundClip: 'padding-box, border-box',
                              borderRadius: isOwnMessage ? '32.5px 32.5px 0 32.5px' : (isAI ? '20px' : '32.5px 32.5px 32.5px 0'),
                              padding: isImageMessage ? '0' : '8px 12px', // No padding for images
                              minWidth: isImageMessage ? 'auto' : '90px',
                              maxWidth: 'calc(100% - 65px)',
                              overflow: 'visible', // Changed from 'hidden' to 'visible' to prevent reaction clipping
                              wordWrap: 'break-word',
                              whiteSpace: 'pre-wrap',
                              boxShadow: highlightedMessageId === msg._id 
                                ? '0 0 0 3px rgba(91, 200, 84, 0.4), -2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)'
                                : '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
                              transition: 'box-shadow 0.3s ease',
                            }}
                          >
                          {!isImageMessage && (
                            <>
                          {/* Username - positioned at start of straight edge */}
                          <span style={{
                            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: '10px',
                            color: isAI ? '#60F6AB' : '#909090',
                            display: 'block',
                            marginBottom: '4px',
                            marginLeft: isOwnMessage ? '0' : (isAI ? '0' : '20px'),
                            marginRight: isOwnMessage ? '20px' : '0',
                            textAlign: isAI ? 'center' : (isOwnMessage ? 'right' : 'left'),
                          }}>
                            {isOwnMessage ? 'You' : senderName}
                            {/* Market status badges: ⚡ (position) or 🐳 (whale) - shown in market chats */}
                            {conversationType === 'market' && !isAI && (() => {
                              const senderId = msg.sender_id?._id || msg.sender_id?.id;
                              const position = marketPositions[senderId];
                              const isWhale = whales[senderId];
                              
                              return (
                                <>
                                  {isWhale ? (
                                    <span style={{ marginLeft: '4px' }} title="Whale (top 10%)">🐳</span>
                                  ) : position ? (
                                    <span style={{ marginLeft: '4px' }} title="Has position">⚡</span>
                                  ) : null}
                                </>
                              );
                            })()}
                            {/* Polymarket verified badge - only show if NOT in market chat or no active position */}
                            {!isAI && msg.sender_id?.polymarket?.verified && (() => {
                              // In market chats, hide verified badge if user has an active position
                              if (conversationType === 'market') {
                                const senderId = msg.sender_id?._id || msg.sender_id?.id;
                                const hasPosition = marketPositions[senderId] || whales[senderId];
                                
                                // Don't show verified badge if they have active position (⚡/🐳 already shown)
                                if (hasPosition) {
                                  return null;
                                }
                              }
                              
                              // Show verified badge in non-market chats or if no position
                              return (
                                <img 
                                  src="/polymarket-logo.png" 
                                  alt="Polymarket Verified"
                                  title="Polymarket Verified"
                                  style={{
                                    width: '10px',
                                    height: '10px',
                                    marginLeft: '4px',
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                  }}
                                />
                              );
                            })()}
                          </span>

                          {/* Reply Preview - clickable to scroll to original message */}
                          {msg.reply_to && (
                            <div
                              onClick={() => {
                                if (msg.reply_to?._id) {
                                  onScrollToMessage(msg.reply_to._id);
                                }
                              }}
                              style={{
                                backgroundColor: '#2A2A2A',
                                borderLeft: '3px solid #5BC854',
                                padding: '6px 10px',
                                marginBottom: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333333'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
                            >
                              <div style={{ 
                                fontSize: '10px', 
                                color: '#5BC854',
                                marginBottom: '2px',
                                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                              }}>
                                {msg.reply_to.sender_id?.display_name || msg.reply_to.sender_id?.username || 'User'}
                              </div>
                              <div style={{ 
                                fontSize: '11px', 
                                color: '#909090',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                              }}>
                                {msg.reply_to.preview || msg.reply_to.text || 'Message'}
                              </div>
                            </div>
                          )}
                          </>
                          )}

                          {/* Message Content - Image, GIF, or Text */}
                          {(() => {
                            const isImageMessage = msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com');
                            
                            return isImageMessage ? (
                              // Image/GIF wrapper with border radius matching the message bubble
                              <div style={{ overflow: 'hidden', borderRadius: isOwnMessage ? '32.5px 32.5px 0 32.5px' : (isAI ? '20px' : '32.5px 32.5px 32.5px 0') }}>
                                <img
                                  src={msg.text}
                                  alt="Shared media"
                                  style={{
                                    width: '100%',
                                    maxHeight: '300px',
                                    objectFit: 'cover',
                                    display: 'block',
                                    margin: '0',
                                    padding: '0',
                                  }}
                                  onError={(e) => {
                                    // If image fails to load, show as text instead
                                    e.currentTarget.style.display = 'none';
                                    const textNode = document.createElement('p');
                                    textNode.textContent = msg.text;
                                    textNode.style.cssText = `
                                      font-family: Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif;
                                      font-size: 12px;
                                      color: ${isAI ? '#60F6AB' : '#D3D3D3'};
                                      margin: 0 0 4px 0;
                                      padding: 8px 12px;
                                    `;
                                    e.currentTarget.parentElement?.appendChild(textNode);
                                  }}
                                />
                              </div>
                            ) : (
                              <p style={{
                                fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '12px',
                                color: isAI ? '#60F6AB' : '#D3D3D3',
                                margin: '0 0 4px 0',
                              }}>
                                {renderMessageWithMentions(msg.text, participants, onUserClick)}
                              </p>
                            );
                          })()}

                  {/* Reply, Reaction, Menu */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: (msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com')) ? '8px' : '0', // Add spacing for images
                    marginBottom: (msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com')) ? '8px' : '0', // Add spacing for images
                    paddingLeft: (msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com')) ? '8px' : '0', // Add padding for images
                    paddingRight: (msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com')) ? '8px' : '0', // Add padding for images
                  }}>
                    {/* For self messages: 3 dots on left, reply+react on right */}
                    {/* For other messages: reply+react on left, 3 dots on right */}
                    
                    {isOwnMessage ? (
                      <>
                        {/* Left: 3 dots menu */}
                        {!isAI && (
                          <button 
                            onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              padding: 0, 
                              display: 'flex', 
                              alignItems: 'center', 
                              height: '16px', 
                              position: 'relative',
                              marginRight: '20px',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#A8A8A8">
                              <circle cx="5" cy="12" r="2"/>
                              <circle cx="12" cy="12" r="2"/>
                              <circle cx="19" cy="12" r="2"/>
                            </svg>
                            {showMessageMenu === msg._id && (
                              <div 
                                ref={messageMenuRef}
                                style={{
                                  position: 'absolute',
                                  bottom: '20px',
                                  left: '0',
                                  backgroundColor: '#19191A',
                                  border: '1px solid transparent',
                                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                                  backgroundOrigin: 'border-box',
                                  backgroundClip: 'padding-box, border-box',
                                  borderRadius: '15px',
                                  padding: '8px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                  minWidth: '120px',
                                  zIndex: 100,
                                  boxShadow: '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
                                }}
                              >
                                <div
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      console.log('Deleting message:', msg._id);
                                      
                                      setShowMessageMenu(null);
                                      
                                      // Send delete request to backend
                                      await websocketService.deleteMessage(msg._id);
                                      
                                      // The websocket event will handle updating the UI
                                    } catch (error) {
                                      console.error('Failed to delete message:', error);
                                    }
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#FF4444',
                                    cursor: 'pointer',
                                    padding: '6px 10px',
                                    textAlign: 'left',
                                    fontSize: '12px',
                                    borderRadius: '8px',
                                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  Delete
                                </div>
                              </div>
                            )}
                          </button>
                        )}
                        
                        {/* Right: Reply + Reaction */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '16px' }}>
                          {!isAI && (
                            <>
                              <button
                                onClick={() => {
                                  onReply(msg._id, senderName, msg.text);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', height: '16px' }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="2">
                                  <polyline points="9 17 4 12 9 7"/>
                                  <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                                </svg>
                              </button>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '16px' }}>
                                <button 
                                  onClick={() => setShowReactionPicker(showReactionPicker === msg._id ? null : msg._id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', height: '16px' }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                                  </svg>
                                </button>
                                {showReactionPicker === msg._id && (
                                  <div 
                                    ref={reactionPickerRef}
                                    style={{
                                      position: 'fixed',
                                      bottom: '80px',
                                      right: isOwnMessage ? '120px' : 'auto',
                                      left: isOwnMessage ? 'auto' : '120px',
                                      backgroundColor: '#19191A',
                                      border: '1px solid transparent',
                                      backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                                      backgroundOrigin: 'border-box',
                                      backgroundClip: 'padding-box, border-box',
                                      borderRadius: '20px',
                                      padding: '8px',
                                      display: 'flex',
                                      gap: '8px',
                                      zIndex: 1000,
                                      boxShadow: '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
                                    }}>
                                    {reactionEmojis.map(emoji => (
                                      <button
                                      key={emoji}
                                      onClick={() => onReact(msg._id, emoji)}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          fontSize: '18px',
                                          padding: '4px',
                                        }}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Left: Reply + Reaction */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '16px' }}>
                          {!isAI && (
                            <>
                              <button
                                onClick={() => {
                                  onReply(msg._id, senderName, msg.text);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', height: '16px' }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="2">
                                  <polyline points="9 17 4 12 9 7"/>
                                  <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                                </svg>
                              </button>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '16px' }}>
                                <button 
                                  onClick={() => setShowReactionPicker(showReactionPicker === msg._id ? null : msg._id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', height: '16px' }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                                  </svg>
                                </button>
                                {showReactionPicker === msg._id && (
                                  <div 
                                    ref={reactionPickerRef}
                                    style={{
                                      position: 'fixed',
                                      bottom: '80px',
                                      right: isOwnMessage ? 'auto' : '120px',
                                      left: isOwnMessage ? '120px' : 'auto',
                                      backgroundColor: '#19191A',
                                      border: '1px solid transparent',
                                      backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                                      backgroundOrigin: 'border-box',
                                      backgroundClip: 'padding-box, border-box',
                                      borderRadius: '20px',
                                      padding: '8px',
                                      display: 'flex',
                                      gap: '8px',
                                      zIndex: 1000,
                                      boxShadow: '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
                                    }}>
                                    {reactionEmojis.map(emoji => (
                                      <button
                                      key={emoji}
                                      onClick={() => onReact(msg._id, emoji)}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          fontSize: '18px',
                                          padding: '4px',
                                        }}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Right: 3 dots menu - positioned after curved corner */}
                        {!isAI && (
                          <button 
                            onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              padding: 0, 
                              display: 'flex', 
                              alignItems: 'center', 
                              height: '16px', 
                              position: 'relative',
                              marginLeft: '33px',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#A8A8A8">
                              <circle cx="5" cy="12" r="2"/>
                              <circle cx="12" cy="12" r="2"/>
                              <circle cx="19" cy="12" r="2"/>
                            </svg>
                            {showMessageMenu === msg._id && (
                              <div 
                                ref={messageMenuRef}
                                style={{
                                  position: 'absolute',
                                  bottom: '20px',
                                  right: '0',
                                  backgroundColor: '#19191A',
                                  border: '1px solid transparent',
                                  backgroundImage: 'linear-gradient(#19191A, #19191A), linear-gradient(135deg, #707070, #333333)',
                                  backgroundOrigin: 'border-box',
                                  backgroundClip: 'padding-box, border-box',
                                  borderRadius: '15px',
                                  padding: '8px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                  minWidth: '120px',
                                  zIndex: 100,
                                  boxShadow: '-2.5px -2.5px 5px rgba(255, 255, 255, 0.04), 10px 10px 20px rgba(0, 0, 0, 0.25)',
                                }}
                              >
                                {/* Delete button - for mods/admins or message owner */}
                                {(user && (
                                  msg.sender_id._id === user._id || 
                                  msg.sender_id._id === user.id ||
                                  ['admin', 'moderator', 'creator'].includes(user.rank)
                                )) && (
                                  <button
                                    onClick={async () => {
                                      if (window.confirm('Are you sure you want to delete this message?')) {
                                        onDeleteMessage(msg._id);
                                        setShowMessageMenu(null);
                                      }
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#FF6B6B',
                                      cursor: 'pointer',
                                      padding: '6px 10px',
                                      textAlign: 'left',
                                      fontSize: '12px',
                                      borderRadius: '8px',
                                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                                    }}
                                  >
                                    Delete Message
                                  </button>
                                )}

                                {/* Ban user button - for mods/admins only, not on own messages */}
                                {user && ['admin', 'moderator', 'creator'].includes(user.rank) && 
                                 msg.sender_id._id !== user._id && 
                                 msg.sender_id._id !== user.id && (
                                  <button
                                    onClick={async () => {
                                      const reason = prompt('Reason for ban:');
                                      if (reason && window.confirm(`Ban ${msg.sender_id.username}? This will immediately disconnect them.`)) {
                                        try {
                                          await userService.banUser(msg.sender_id._id || msg.sender_id.id, reason);
                                          addNotification({
                                            type: 'system',
                                            title: 'User Banned',
                                            message: `${msg.sender_id.username} has been banned.`,
                                          });
                                        } catch (error) {
                                          console.error('Failed to ban user:', error);
                                          addNotification({
                                            type: 'system',
                                            title: 'Ban Failed',
                                            message: 'Failed to ban user. Please try again.',
                                          });
                                        }
                                        setShowMessageMenu(null);
                                      }
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#FF4444',
                                      cursor: 'pointer',
                                      padding: '6px 10px',
                                      textAlign: 'left',
                                      fontSize: '12px',
                                      borderRadius: '8px',
                                      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                                    }}
                                  >
                                    Ban User
                                  </button>
                                )}

                                {/* Report button - for all users */}
                                <button
                                  onClick={async () => {
                                    try {
                                      const reason = prompt('Why are you reporting this message?');
                                      if (reason) {
                                        await messageService.reportMessage(msg._id, reason);
                                        addNotification({
                                          type: 'system',
                                          title: 'Report Submitted',
                                          message: 'Admins will review your report.',
                                        });
                                      }
                                    } catch (error) {
                                      console.error('Failed to report message:', error);
                                      addNotification({
                                        type: 'system',
                                          title: 'Report Failed',
                                        message: 'Failed to submit report. Please try again.',
                                      });
                                    }
                                    setShowMessageMenu(null);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#FFA500',
                                    cursor: 'pointer',
                                    padding: '6px 10px',
                                    textAlign: 'left',
                                    fontSize: '12px',
                                    borderRadius: '8px',
                                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                                  }}
                                >
                                  Report
                                </button>
                              </div>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Reactions Display - with full-width background and proper gap */}
                  {(() => {
                    // Filter out reactions with 0 count
                    const activeReactions = msg.reactions 
                      ? Object.entries(msg.reactions).filter(([emoji, userIds]) => {
                          const reactionCount = Array.isArray(userIds) ? userIds.length : 0;
                          return reactionCount > 0;
                        })
                      : [];
                    
                    // Only show reactions container if there are active reactions
                    if (activeReactions.length === 0) return null;
                    
                    // Check if this is an image message
                    const isImageMessage = msg.text.match(/\.(gif|jpe?g|png|webp)(\?|$)/i) || msg.text.startsWith('https://media.tenor.com') || msg.text.startsWith('https://res.cloudinary.com');
                    
                    return (
                      <div style={{ 
                        backgroundColor: '#19191A',
                        marginLeft: isImageMessage ? '0' : '-12px',
                        marginRight: isImageMessage ? '0' : '-12px',
                        marginTop: isImageMessage ? '6px' : '4px',
                        marginBottom: isImageMessage ? '0' : '-8px',
                        padding: isImageMessage ? '6px 8px' : '8px 12px',
                        borderBottomLeftRadius: isOwnMessage ? '32.5px' : '0',
                        borderBottomRightRadius: isOwnMessage ? '0' : '32.5px',
                        borderTopLeftRadius: '0',
                        borderTopRightRadius: '0',
                        display: 'flex',
                        gap: '4px', 
                        flexWrap: 'wrap',
                      }}>
                        {activeReactions.map(([emoji, userIds]) => {
                          const currentUserId = user?._id || user?.id || '';
                          const userHasReacted = Array.isArray(userIds) && userIds.includes(currentUserId);
                          const reactionCount = Array.isArray(userIds) ? userIds.length : 0;
                          
                          return (
                            <button
                                      key={emoji}
                                      onClick={() => onReact(msg._id, emoji)}
                              style={{
                                backgroundColor: userHasReacted ? '#3A3A3A' : '#242424',
                                border: `1px solid ${userHasReacted ? '#555' : '#333'}`,
                                borderRadius: '12px',
                                padding: '2px 6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <span>{emoji}</span>
                              <span style={{ fontSize: '10px', color: '#909090' }}>{reactionCount}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
      </div>
    </div>
  );
};
