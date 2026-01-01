import React, { useState, useEffect } from 'react';
import { tenorService, type TenorGif } from '../../services/tenor';

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({ isOpen, onClose, onSelectGif }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingTerms, setTrendingTerms] = useState<string[]>([]);

  // Load featured/trending GIFs on mount
  useEffect(() => {
    if (isOpen) {
      loadFeaturedGifs();
      loadTrendingTerms();
    }
  }, [isOpen]);

  const loadFeaturedGifs = async () => {
    setIsLoading(true);
    const featured = await tenorService.getFeaturedGifs(30);
    setGifs(featured);
    setIsLoading(false);
  };

  const loadTrendingTerms = async () => {
    const terms = await tenorService.getTrendingSearchTerms();
    setTrendingTerms(terms.slice(0, 10));
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadFeaturedGifs();
      return;
    }
    setIsLoading(true);
    const results = await tenorService.searchGifs(query, 30);
    setGifs(results);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '600px',
          height: '80vh',
          backgroundColor: '#19191A',
          borderRadius: '20px',
          border: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
          }}>
            <h3 style={{
              margin: 0,
              fontFamily: 'SF Compact Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '18px',
              color: '#D3D3D3',
            }}>
              Search GIFs
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#909090" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search for GIFs..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#242424',
              border: '1px solid #333',
              borderRadius: '10px',
              color: '#D3D3D3',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          {/* Trending Terms */}
          {!searchQuery && trendingTerms.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '10px',
              flexWrap: 'wrap',
            }}>
              {trendingTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#242424',
                    border: '1px solid #5BC854',
                    borderRadius: '15px',
                    color: '#5BC854',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#242424'}
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GIF Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '15px',
        }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: '#909090',
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              Loading GIFs...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '10px',
            }}>
              {gifs.map((gif) => (
                <div
                  key={gif.id}
                  onClick={() => {
                    onSelectGif(gif.media_formats.gif.url);
                    onClose();
                  }}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#242424',
                    border: '2px solid transparent',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5BC854'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <img
                    src={gif.media_formats.tinygif.url}
                    alt={gif.title}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

