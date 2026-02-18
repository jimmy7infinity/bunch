import { create } from 'zustand';
import api from '../config/api';

export interface InventoryState {
  unlockedAccents: string[];
  equippedAccent: string | null;
  unlockDates: Record<string, string>;
  unlockMethods: Record<string, string>;
  specialRanks: string[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchInventory: () => Promise<void>;
  equipAccent: (accentName: string | null) => Promise<void>;
  getUnlockedAccents: () => Promise<string[]>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  unlockedAccents: [],
  equippedAccent: null,
  unlockDates: {},
  unlockMethods: {},
  specialRanks: [],
  loading: false,
  error: null,

  fetchInventory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/inventory');
      set({
        unlockedAccents: response.data.unlocked_accents || [],
        equippedAccent: response.data.equipped_accent || null,
        unlockDates: response.data.unlock_dates || {},
        unlockMethods: response.data.unlock_methods || {},
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

  equipAccent: async (accentName: string | null) => {
    try {
      await api.post('/inventory/equip', { accent_name: accentName });
      set({ equippedAccent: accentName });
      
      // Show success feedback
      console.log(`✅ ${accentName ? `Equipped ${accentName}` : 'Unequipped accent'}`);
    } catch (error: any) {
      console.error('Error equipping accent:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to equip accent',
      });
      throw error;
    }
  },

  getUnlockedAccents: async () => {
    try {
      const response = await api.get('/inventory/accents');
      return response.data.accents || [];
    } catch (error: any) {
      console.error('Error fetching unlocked accents:', error);
      return [];
    }
  },
}));
