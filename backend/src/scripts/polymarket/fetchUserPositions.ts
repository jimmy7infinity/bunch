/**
 * Fetch user positions from Polymarket Data API
 * 
 * This script fetches only the specified user's positions
 * Can be filtered by marketId for targeted queries
 */

interface PolymarketPosition {
  market: string; // Market ID
  outcome: string; // "Yes" or "No"
  size: number; // Position size in tokens
  value: number; // Current value in USD
  pnl: number; // Profit/Loss
  // ... other fields from Polymarket API
}

export interface UserPosition {
  marketId: string;
  outcome: string;
  sizeUSD: number;
  pnl: number;
}

/**
 * Fetch positions for a specific user
 */
export async function fetchUserPositions(
  walletAddress: string,
  marketId?: string
): Promise<UserPosition[]> {
  try {
    const params = new URLSearchParams({
      user: walletAddress,
      sizeThreshold: '0.01', // Minimum position size
      limit: '100',
      sortBy: 'TOKENS',
      sortDirection: 'DESC',
    });

    // If specific market requested, add condition ID
    if (marketId) {
      params.append('market', marketId);
    }

    const response = await fetch(
      `https://data-api.polymarket.com/positions?${params.toString()}`
    );

    if (!response.ok) {
      console.error('Failed to fetch user positions:', response.status);
      return [];
    }

    const positions: PolymarketPosition[] = await response.json();

    // Transform to our format
    return positions.map(pos => ({
      marketId: pos.market,
      outcome: pos.outcome,
      sizeUSD: pos.value || 0,
      pnl: pos.pnl || 0,
    }));
  } catch (error) {
    console.error('Error fetching user positions:', error);
    return [];
  }
}

/**
 * Get user's largest position for a specific market
 */
export async function getUserMarketPosition(
  walletAddress: string,
  marketId: string
): Promise<UserPosition | null> {
  const positions = await fetchUserPositions(walletAddress, marketId);

  if (positions.length === 0) {
    return null;
  }

  // Return the largest position (user might have positions on both outcomes)
  return positions.reduce((max, pos) => 
    pos.sizeUSD > max.sizeUSD ? pos : max
  );
}
