import { create } from 'zustand';
import api from '../services/api';
import { useAuthStore } from './authStore';

export type InventoryItemType = 'rank_accent' | 'pfp_effect' | 'chat_badge' | 'emoji_pack';

export interface InventoryItem {
  item_id: string;
  item_type: InventoryItemType;
  unlocked_at: string;
  unlock_method: string;
}

export interface InventoryState {
  items: InventoryItem[];
  equipped: Record<InventoryItemType, string | null>;
  specialRanks: string[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchInventory: () => Promise<void>;
  equipItem: (itemId: string | null, itemType: InventoryItemType) => Promise<void>;
  getItemsByType: (itemType: InventoryItemType) => InventoryItem[];
  
  // Legacy helpers for rank accents
  getUnlockedAccents: () => string[];
  getEquippedAccent: () => string | null;
  equipAccent: (accentName: string | null) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  equipped: {
    rank_accent: null,
    pfp_effect: null,
    chat_badge: null,
    emoji_pack: null,
  },
  specialRanks: [],
  loading: false,
  error: null,

  fetchInventory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/inventory');
      set({
        items: response.data.items || [],
        equipped: response.data.equipped || {
          rank_accent: null,
          pfp_effect: null,
          chat_badge: null,
          emoji_pack: null,
        },
        specialRanks: response.data.special_ranks || [],
        loading: false,
      });
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch inventory',
        loading: false,
      });
    }
  },

  equipItem: async (itemId: string | null, itemType: InventoryItemType) => {
    try {
      await api.post('/inventory/equip', { 
        item_id: itemId,
        item_type: itemType 
      });
      
      set(state => ({
        equipped: {
          ...state.equipped,
          [itemType]: itemId,
        },
      }));
      
      // Auto-refresh user data to update equipped_accent everywhere in the app
      const { refreshUser } = useAuthStore.getState();
      await refreshUser();
      
      // Log to verify the update
      const updatedUser = useAuthStore.getState().user;
      console.log(`✅ Equipped ${itemType}: ${itemId || 'none'}`);
      console.log('Updated user equipped_accent:', updatedUser?.equipped_accent);
      console.log('Full user object:', updatedUser);
    } catch (error: any) {
      console.error('Error equipping item:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to equip item',
      });
      throw error;
    }
  },

  getItemsByType: (itemType: InventoryItemType) => {
    const state = get();
    return state.items.filter(item => item.item_type === itemType);
  },

  // Legacy helpers for rank accents
  getUnlockedAccents: () => {
    const state = get();
    return state.items
      .filter(item => item.item_type === 'rank_accent')
      .map(item => item.item_id);
  },

  getEquippedAccent: () => {
    const state = get();
    return state.equipped.rank_accent;
  },

  equipAccent: async (accentName: string | null) => {
    return get().equipItem(accentName, 'rank_accent');
  },
}));
