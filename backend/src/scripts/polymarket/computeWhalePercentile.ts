/**
 * Compute whale status based on percentile ranking
 * 
 * A user is a "whale" if they're in the top 10% of position holders for a market
 * This is computed from all market positions fetched from Polymarket Data API
 */

import { fetchMarketPositions } from './fetchMarketPositions';

/**
 * Check if a user's wallet is a whale in a specific market
 * 
 * @param marketId - Market ID to check
 * @param userWallet - User's wallet address
 * @returns { isWhale: boolean, rank: number, total: number, sizeUSD: number } or null if no position
 */
export async function isUserWhale(
  marketId: string,
  userWallet: string
): Promise<{ isWhale: boolean; rank: number; total: number; sizeUSD: number } | null> {
  console.log(`Checking whale status for wallet ${userWallet.slice(0, 8)}...`);

  // Fetch all positions for this market (sorted descending by size)
  const allPositions = await fetchMarketPositions(marketId);

  if (allPositions.length === 0) {
    console.log(`✗ No positions found for market`);
    return null;
  }

  // Find user's position in the sorted list
  const normalizedWallet = userWallet.toLowerCase();
  const userIndex = allPositions.findIndex(p => p.wallet === normalizedWallet);

  if (userIndex === -1) {
    console.log(`✗ User has no position in this market`);
    return null;
  }

  const userPosition = allPositions[userIndex];
  const rank = userIndex + 1; // 1-indexed rank
  const total = allPositions.length;

  // Calculate whale threshold (top 10%)
  const whaleThreshold = Math.max(1, Math.floor(total * 0.1));
  const isWhale = userIndex < whaleThreshold;

  console.log(`✓ User rank: ${rank}/${total} (${isWhale ? '🐳 WHALE' : '⚡ position'})`);
  console.log(`  Position size: $${userPosition.sizeUSD.toFixed(2)}`);
  console.log(`  Whale threshold: top ${whaleThreshold} positions`);

  return {
    isWhale,
    rank,
    total,
    sizeUSD: userPosition.sizeUSD,
  };
}

/**
 * Get whale threshold for a market (for debugging/display)
 */
export async function getWhaleThreshold(marketId: string): Promise<{ threshold: number; totalPositions: number; minWhaleSize: number } | null> {
  const allPositions = await fetchMarketPositions(marketId);

  if (allPositions.length === 0) {
    return null;
  }

  const whaleThreshold = Math.max(1, Math.floor(allPositions.length * 0.1));
  const minWhaleSize = allPositions[whaleThreshold - 1]?.sizeUSD || 0;

  return {
    threshold: whaleThreshold,
    totalPositions: allPositions.length,
    minWhaleSize,
  };
}
