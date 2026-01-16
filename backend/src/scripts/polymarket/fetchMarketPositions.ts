/**
 * Fetch all positions for a specific market from Polymarket Data API
 * 
 * This script fetches ALL positions for a market to compute whale thresholds
 * Results are cached aggressively (5-15 min TTL)
 */

import { cache, CacheKeys, CacheTTL } from '../utils/cache';

export interface MarketPosition {
  walletAddress: string;
  outcome: string;
  sizeUSD: number;
}

/**
 * Fetch all positions for a market (with caching)
 */
export async function fetchMarketPositions(
  marketId: string,
  useCache: boolean = true
): Promise<MarketPosition[]> {
  // Check cache first
  if (useCache) {
    const cached = cache.get<MarketPosition[]>(CacheKeys.marketPositions(marketId));
    if (cached) {
      console.log(`✓ Using cached positions for market ${marketId}`);
      return cached;
    }
  }

  try {
    console.log(`Fetching positions for market ${marketId}...`);

    // Fetch from Polymarket Data API
    // Note: This endpoint might require pagination for very popular markets
    const params = new URLSearchParams({
      market: marketId,
      sizeThreshold: '0.01',
      limit: '1000', // Get as many as possible
      sortBy: 'TOKENS',
      sortDirection: 'DESC',
    });

    const response = await fetch(
      `https://data-api.polymarket.com/positions?${params.toString()}`
    );

    if (!response.ok) {
      console.error('Failed to fetch market positions:', response.status);
      return [];
    }

    const positions: any[] = await response.json();

    // Transform to our format
    const marketPositions: MarketPosition[] = positions.map(pos => ({
      walletAddress: pos.user || pos.wallet,
      outcome: pos.outcome,
      sizeUSD: pos.value || 0,
    }));

    console.log(`✓ Fetched ${marketPositions.length} positions for market ${marketId}`);

    // Cache the results
    cache.set(
      CacheKeys.marketPositions(marketId),
      marketPositions,
      CacheTTL.MARKET_POSITIONS
    );

    return marketPositions;
  } catch (error) {
    console.error('Error fetching market positions:', error);
    return [];
  }
}

/**
 * Get total position count for a market
 */
export async function getMarketPositionCount(marketId: string): Promise<number> {
  const positions = await fetchMarketPositions(marketId);
  return positions.length;
}

/**
 * Get total volume (sum of all position sizes) for a market
 */
export async function getMarketVolume(marketId: string): Promise<number> {
  const positions = await fetchMarketPositions(marketId);
  return positions.reduce((sum, pos) => sum + pos.sizeUSD, 0);
}
