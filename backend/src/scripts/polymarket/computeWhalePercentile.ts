/**
 * Compute whale threshold for a market
 * 
 * A user is a "whale" if they're in the top 10% by position size
 * This script computes the threshold and checks if a user qualifies
 */

import { fetchMarketPositions, MarketPosition } from './fetchMarketPositions';
import { cache, CacheKeys, CacheTTL } from '../utils/cache';

export interface WhaleThreshold {
  marketId: string;
  thresholdUSD: number;
  totalPositions: number;
  computedAt: Date;
}

/**
 * Compute the whale threshold (top 10%) for a market
 */
export async function computeWhaleThreshold(
  marketId: string
): Promise<WhaleThreshold> {
  // Check cache first
  const cached = cache.get<WhaleThreshold>(CacheKeys.whaleThreshold(marketId));
  if (cached) {
    console.log(`✓ Using cached whale threshold for market ${marketId}`);
    return cached;
  }

  console.log(`Computing whale threshold for market ${marketId}...`);

  // Fetch all positions for this market
  const positions = await fetchMarketPositions(marketId);

  if (positions.length === 0) {
    return {
      marketId,
      thresholdUSD: 0,
      totalPositions: 0,
      computedAt: new Date(),
    };
  }

  // Sort by position size (descending)
  const sortedPositions = [...positions].sort((a, b) => b.sizeUSD - a.sizeUSD);

  // Calculate top 10% index
  const top10PercentIndex = Math.floor(sortedPositions.length * 0.1);

  // The threshold is the position size at the 10% mark
  const thresholdUSD = sortedPositions[top10PercentIndex]?.sizeUSD || 0;

  const result: WhaleThreshold = {
    marketId,
    thresholdUSD,
    totalPositions: positions.length,
    computedAt: new Date(),
  };

  console.log(`✓ Whale threshold for market ${marketId}: $${thresholdUSD.toFixed(2)} (${positions.length} positions)`);

  // Cache the result
  cache.set(
    CacheKeys.whaleThreshold(marketId),
    result,
    CacheTTL.WHALE_THRESHOLD
  );

  return result;
}

/**
 * Check if a user is a whale in a specific market
 */
export async function isUserWhale(
  marketId: string,
  userPositionSizeUSD: number
): Promise<boolean> {
  if (userPositionSizeUSD <= 0) {
    return false;
  }

  const threshold = await computeWhaleThreshold(marketId);
  
  return userPositionSizeUSD >= threshold.thresholdUSD;
}

/**
 * Get user's percentile rank in a market
 * Returns 0-100 (100 = top 1%, 50 = median, 0 = bottom)
 */
export async function getUserPercentile(
  marketId: string,
  userPositionSizeUSD: number
): Promise<number> {
  if (userPositionSizeUSD <= 0) {
    return 0;
  }

  const positions = await fetchMarketPositions(marketId);
  
  if (positions.length === 0) {
    return 0;
  }

  // Count how many positions are smaller than the user's
  const smallerPositions = positions.filter(
    pos => pos.sizeUSD < userPositionSizeUSD
  ).length;

  // Calculate percentile
  const percentile = (smallerPositions / positions.length) * 100;

  return Math.round(percentile);
}
