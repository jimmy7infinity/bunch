/**
 * Legacy fetchUserPositions helpers
 * Used by computeMarketStatus and computeUserDashboard scripts
 */

import axios from 'axios';

export interface UserPosition {
  marketId: string;
  sizeUSD: number;
  pnl: number;
  size: number;
  outcome?: string;
}

const POLYMARKET_DATA_API = 'https://data-api.polymarket.com';

/**
 * Fetch all positions for a user
 */
export async function fetchUserPositions(walletAddress: string): Promise<UserPosition[]> {
  try {
    const params = new URLSearchParams({
      user: walletAddress,
      limit: '100',
      sortBy: 'TOKENS',
      sortDirection: 'DESC',
    });

    const response = await axios.get(`${POLYMARKET_DATA_API}/positions?${params.toString()}`, {
      timeout: 10000,
    });

    if (!response.data) {
      return [];
    }

    return (response.data || []).map((p: any) => ({
      marketId: p.market || p.condition_id || '',
      sizeUSD: parseFloat(p.value || p.size_usd || 0),
      pnl: parseFloat(p.pnl || p.unrealized_pnl || 0),
      size: parseFloat(p.size || 0),
      outcome: p.outcome,
    }));
  } catch (error) {
    console.error(`Error fetching positions for ${walletAddress}:`, error);
    return [];
  }
}

/**
 * Get user's position in a specific market
 */
export async function getUserMarketPosition(
  walletAddress: string,
  marketId: string
): Promise<UserPosition | null> {
  try {
    const positions = await fetchUserPositions(walletAddress);
    return positions.find(p => p.marketId === marketId) || null;
  } catch (error) {
    console.error(`Error getting market position:`, error);
    return null;
  }
}
