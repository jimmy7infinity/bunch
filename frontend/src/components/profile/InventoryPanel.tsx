import React, { useEffect, useState } from 'react';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useAuthStore } from '../../stores/authStore';
import { RANKS } from '../../utils/ranks';
import { RankedPFP } from '../common/RankedPFP';

const InventoryPanel: React.FC = () => {
  const {
    getItemsByType,
    equipped,
    specialRanks,
    loading,
    error,
    fetchInventory,
    equipItem,
  } = useInventoryStore();

  const { user } = useAuthStore();
  const [equipLoading, setEquipLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleEquip = async (accentName: string | null) => {
    setEquipLoading(true);
    try {
      await equipItem(accentName, 'rank_accent');
    } catch (error) {
      console.error('Failed to equip accent:', error);
    } finally {
      setEquipLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '12px',
        color: '#707070',
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#2E1A1A',
        border: '1px solid #5C2E2E',
        borderRadius: '10px',
        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '11px',
        color: '#C85454',
      }}>
        {error}
      </div>
    );
  }

  // Get all rank accent items
  const rankAccents = getItemsByType('rank_accent');
  const equippedAccent = equipped.rank_accent;
  const userPfp = user?.avatar_url || 'https://via.placeholder.com/150';

  // Group accents by category
  const groupedAccents: Record<string, string[]> = {
    performance: [],
    special: [],
    plus: [],
    staff: [],
  };

  rankAccents.forEach(item => {
    const accentName = item.item_id;
    const rank = RANKS[accentName];
    if (rank) {
      if (rank.category === 'performance') {
        groupedAccents.performance.push(accentName);
      } else if (rank.category === 'special') {
        groupedAccents.special.push(accentName);
      } else if (accentName.endsWith('+')) {
        groupedAccents.plus.push(accentName);
      } else if (rank.category === 'staff') {
        groupedAccents.staff.push(accentName);
      }
    }
  });

  const categoryLabels: Record<string, string> = {
    performance: '⚡ Performance',
    special: '🎭 Special',
    plus: '✨ Plus',
    staff: '👑 Staff',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Active Special Ranks Badge */}
      {specialRanks.length > 0 && (
        <div style={{
          padding: '12px',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(219, 39, 119, 0.1))',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '10px',
        }}>
          <div style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '11px',
            color: '#A78BFA',
            marginBottom: '8px',
            fontWeight: 600,
          }}>
            Active Ranks
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {specialRanks.map(rankName => (
              <span
                key={rankName}
                style={{
                  padding: '4px 10px',
                  backgroundColor: 'rgba(124, 58, 237, 0.2)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '12px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '10px',
                  color: '#C4B5FD',
                  fontWeight: 500,
                }}
              >
                {rankName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Currently Equipped */}
      {equippedAccent && (
        <div style={{
          padding: '12px',
          backgroundColor: '#242424',
          border: '1px solid rgba(91, 200, 84, 0.3)',
          borderRadius: '10px',
        }}>
          <div style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '11px',
            color: '#5BC854',
            marginBottom: '10px',
            fontWeight: 600,
          }}>
            Equipped Accent
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Simple preview matching grid items */}
            <div style={{
              position: 'relative',
              width: '45px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {(() => {
                const rankData = RANKS[equippedAccent];
                const hasAccent = rankData?.hasAccent && rankData?.accentFile;
                
                if (hasAccent) {
                  return (
                    <img
                      src={`/rank_accent/${rankData.accentFile}`}
                      alt={equippedAccent}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  );
                } else {
                  return (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${rankData?.pfpBorder.topLeft || '#707070'}, ${rankData?.pfpBorder.bottomRight || '#333333'})`,
                    }} />
                  );
                }
              })()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '11px',
                color: '#E5E5E5',
                marginBottom: '6px',
                fontWeight: 500,
              }}>
                {equippedAccent}
              </div>
              <button
                onClick={() => handleEquip(null)}
                disabled={equipLoading}
                style={{
                  padding: '4px 10px',
                  backgroundColor: '#333333',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '10px',
                  color: '#B9B7B7',
                  cursor: equipLoading ? 'not-allowed' : 'pointer',
                  opacity: equipLoading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!equipLoading) e.currentTarget.style.backgroundColor = '#444444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#333333';
                }}
              >
                Unequip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accent Categories */}
      {Object.entries(groupedAccents).map(([category, accents]) => {
        if (accents.length === 0) return null;

        return (
          <div key={category}>
            <div style={{
              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '11px',
              color: '#707070',
              marginBottom: '8px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {categoryLabels[category]}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}>
              {accents.map(accentName => {
                const isEquipped = equippedAccent === accentName;
                const rankData = RANKS[accentName];
                const hasAccent = rankData?.hasAccent && rankData?.accentFile;

                return (
                  <div
                    key={accentName}
                    onClick={() => !isEquipped && !equipLoading && handleEquip(accentName)}
                    style={{
                      position: 'relative',
                      padding: '15px',
                      backgroundColor: isEquipped ? 'rgba(91, 200, 84, 0.1)' : '#242424',
                      border: isEquipped ? '1px solid #5BC854' : '1px solid #333333',
                      borderRadius: '10px',
                      cursor: isEquipped || equipLoading ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: equipLoading ? 0.5 : 1,
                      minHeight: '100px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isEquipped && !equipLoading) {
                        e.currentTarget.style.backgroundColor = '#2A2A2A';
                        e.currentTarget.style.borderColor = '#444444';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isEquipped) {
                        e.currentTarget.style.backgroundColor = '#242424';
                        e.currentTarget.style.borderColor = '#333333';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      {/* Simple accent preview */}
                      <div style={{
                        position: 'relative',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {hasAccent ? (
                          <img
                            src={`/rank_accent/${rankData.accentFile}`}
                            alt={accentName}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${rankData.pfpBorder.topLeft}, ${rankData.pfpBorder.bottomRight})`,
                          }} />
                        )}
                      </div>
                      
                      <div style={{
                        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '10px',
                        color: isEquipped ? '#5BC854' : '#B9B7B7',
                        textAlign: 'center',
                        fontWeight: 600,
                        lineHeight: '1.2',
                      }}>
                        {accentName}
                      </div>
                      {isEquipped && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#5BC854',
                          borderRadius: '50%',
                          boxShadow: '0 0 0 2px rgba(91, 200, 84, 0.2)',
                        }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {rankAccents.length === 0 && (
        <div style={{
          padding: '30px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '13px',
            color: '#707070',
            marginBottom: '6px',
          }}>
            No accents unlocked yet
          </div>
          <div style={{
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '11px',
            color: '#505050',
          }}>
            Earn special ranks to unlock accents
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
