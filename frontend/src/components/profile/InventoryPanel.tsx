import React, { useEffect, useState } from 'react';
import { useInventoryStore } from '../../stores/inventoryStore';
import { RANKS, getRankColors } from '../../utils/ranks';
import { RankedPFP } from '../common/RankedPFP';

const InventoryPanel: React.FC = () => {
  const {
    unlockedAccents,
    equippedAccent,
    specialRanks,
    loading,
    error,
    fetchInventory,
    equipAccent,
  } = useInventoryStore();

  const [selectedAccent, setSelectedAccent] = useState<string | null>(null);
  const [equipLoading, setEquipLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (equippedAccent) {
      setSelectedAccent(equippedAccent);
    }
  }, [equippedAccent]);

  const handleEquip = async (accentName: string | null) => {
    setEquipLoading(true);
    try {
      await equipAccent(accentName);
      setSelectedAccent(accentName);
    } catch (error) {
      console.error('Failed to equip accent:', error);
    } finally {
      setEquipLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  // Group accents by category
  const groupedAccents: Record<string, string[]> = {
    special: [],
    performance: [],
    'user+': [],
    staff: [],
  };

  unlockedAccents.forEach(accentName => {
    const rank = RANKS[accentName];
    if (rank) {
      if (rank.category === 'special') {
        groupedAccents.special.push(accentName);
      } else if (rank.category === 'performance') {
        groupedAccents.performance.push(accentName);
      } else if (accentName.endsWith('+')) {
        groupedAccents['user+'].push(accentName);
      } else if (rank.category === 'staff') {
        groupedAccents.staff.push(accentName);
      }
    }
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Rank Accents</h2>
          <p className="text-gray-400 text-sm mt-1">
            {unlockedAccents.length} accent{unlockedAccents.length !== 1 ? 's' : ''} unlocked
          </p>
        </div>
      </div>

      {/* Special Ranks Badge */}
      {specialRanks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-300 mb-2">Active Special Ranks</h3>
          <div className="flex flex-wrap gap-2">
            {specialRanks.map(rankName => (
              <span
                key={rankName}
                className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs font-medium"
              >
                {rankName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Currently Equipped */}
      {equippedAccent && (
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Currently Equipped</h3>
          <div className="flex items-center gap-4">
            <RankedPFP
              pfpUrl="https://via.placeholder.com/150"
              rank={equippedAccent}
              size={80}
            />
            <div>
              <p className="text-white font-semibold">{equippedAccent}</p>
              <button
                onClick={() => handleEquip(null)}
                disabled={equipLoading}
                className="mt-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors disabled:opacity-50"
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

        const categoryLabels: Record<string, string> = {
          special: '🎭 Special Ranks',
          performance: '⚡ Performance Ranks',
          'user+': '✨ Plus Ranks',
          staff: '👑 Staff Ranks',
        };

        return (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              {categoryLabels[category]}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {accents.map(accentName => {
                const isEquipped = equippedAccent === accentName;
                const isSelected = selectedAccent === accentName;

                return (
                  <div
                    key={accentName}
                    onClick={() => !isEquipped && handleEquip(accentName)}
                    className={`
                      relative p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isEquipped 
                        ? 'border-green-500 bg-green-500/10' 
                        : isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50'
                      }
                      ${equipLoading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RankedPFP
                        pfpUrl="https://via.placeholder.com/150"
                        rank={accentName}
                        size={60}
                      />
                      <p className="text-xs text-center text-gray-300 font-medium">
                        {accentName}
                      </p>
                      {isEquipped && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
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
      {unlockedAccents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No accents unlocked yet</div>
          <p className="text-gray-600 text-sm">
            Earn special ranks and level up to unlock new rank accents!
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
