import React from 'react';

interface SearchPanelProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  searchResults: any[];
  onResultClick: (messageId: string) => void;
  searchPanelRef: React.RefObject<HTMLDivElement>;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  isOpen,
  searchQuery,
  onSearchChange,
  onClose,
  searchResults,
  onResultClick,
  searchPanelRef,
}) => {
  if (!isOpen) return null;
  
  return (
    <div 
      ref={searchPanelRef}
      style={{
        position: 'absolute',
        top: '75px',
        left: 0,
        right: 0,
        backgroundColor: '#19191A',
        padding: '10px 20px',
        borderBottom: '1px solid #333333',
        zIndex: 10,
        maxHeight: '300px',
        overflowY: 'auto',
      }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#242424',
        borderRadius: '20px',
        padding: '8px 15px',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search messages..."
          autoFocus
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#CBCBCB',
            fontSize: '13px',
            fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        />
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      {/* Search Results */}
      {searchQuery && (
              <div style={{ marginTop: '10px' }}>
                <div style={{
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '11px',
                  color: '#707070',
                  marginBottom: '8px',
                }}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </div>
                
                {searchResults.map((result: any) => {
                  const queryLower = searchQuery.toLowerCase();
                  const textLower = result.text.toLowerCase();
                  const matchIndex = textLower.indexOf(queryLower);
                  const contextStart = Math.max(0, matchIndex - 20);
                  const contextEnd = Math.min(result.text.length, matchIndex + searchQuery.length + 30);
                  const contextText = (contextStart > 0 ? '...' : '') + 
                    result.text.slice(contextStart, contextEnd) + 
                    (contextEnd < result.text.length ? '...' : '');
                  
                  const senderName = result.sender_id?.display_name || result.sender_id?.username || 'Unknown';
                  const isAI = result.is_ai === true;
                  const messageTime = new Date(result.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                  
                  return (
                    <button
                      key={result._id}
                      onClick={() => onResultClick(result._id)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: '#242424',
                        border: '1px solid #333333',
                        borderRadius: '10px',
                        marginBottom: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'block',
                      }}
                    >
                      <div style={{
                        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '11px',
                        color: isAI ? '#60F6AB' : '#909090',
                        marginBottom: '4px',
                      }}>
                        {senderName} • {messageTime}
                      </div>
                      <div style={{
                        fontFamily: 'Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '12px',
                        color: '#CBCBCB',
                      }}>
                        {contextText.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) => 
                          part.toLowerCase() === queryLower 
                            ? <span key={i} style={{ backgroundColor: '#5BC854', color: '#19191A', borderRadius: '2px', padding: '0 2px' }}>{part}</span>
                            : part
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
      
    </div>
  );
};
