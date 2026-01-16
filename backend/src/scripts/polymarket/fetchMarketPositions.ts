/**
 * Fetch all positions for a market from Polymarket Data API
 * 
 * This is the foundation for whale detection.
 * We fetch all open positions, aggregate by wallet, and cache the results.
 */

import axios from 'axios';
import { cache, CacheKeys, CacheTTL } from '../utils/cache';

const POLYMARKET_DATA_API = 'https://data-api.polymarket.com';

export interface MarketPosition {
  wallet: string;
  sizeUSD: number;
}

export interface PolymarketPosition {
  market: string;
  asset_id: string;
  user: string; // wallet address
  size: string; // position size as string
  outcome: string; // YES or NO
  // Add other fields as needed
}

/**
 * Fetch all open positions for a market
 * Returns aggregated positions by wallet address
 */
export async function fetchMarketPositions(marketId: string): Promise<MarketPosition[]> {
  console.log(`Fetching market positions for ${marketId}...`);

  // Check cache first
  const cacheKey = CacheKeys.marketPositions(marketId);
  const cached = cache.get<MarketPosition[]>(cacheKey);
  if (cached) {
    console.log(`✓ Using cached market positions (${cached.length} wallets)`);
    return cached;
  }

  try {
    // Fetch positions from Polymarket Data API
    const response = await axios.get(`${POLYMARKET_DATA_API}/positions`, {
      params: {
        market: marketId,
        // Add any other filters needed
      },
      timeout: 10000, // 10 second timeout
    });

    const positions: PolymarketPosition[] = response.data;

    if (!positions || positions.length === 0) {
      console.log(`✗ No positions found for market ${marketId}`);
      return [];
    }

    console.log(`✓ Fetched ${positions.length} position entries`);

    // Aggregate positions by wallet
    // A wallet may have multiple fills/positions, we need to sum them
    const walletMap = new Map<string, number>();

    for (const position of positions) {
      const wallet = position.user.toLowerCase();
      const size = parseFloat(position.size);

      // Skip invalid or zero positions
      if (isNaN(size) || size <= 0) {
        continue;
      }

      // Sum positions for this wallet
      const currentSize = walletMap.get(wallet) || 0;
      walletMap.set(wallet, currentSize + size);
    }

    // Convert to array and filter out dust (< $1)
    const aggregated: MarketPosition[] = Array.from(walletMap.entries())
      .map(([wallet, sizeUSD]) => ({ wallet, sizeUSD }))
      .filter(p => p.sizeUSD >= 1); // Filter out dust

    console.log(`✓ Aggregated to ${aggregated.length} unique wallets`);

    // Sort by size (descending) - this makes whale detection easier
    aggregated.sort((a, b) => b.sizeUSD - a.sizeUSD);

    // Cache for 10 minutes
    cache.set(cacheKey, aggregated, CacheTTL.MARKET_POSITIONS);

    return aggregated;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to fetch market positions: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
      }
    } else {
      console.error('Error fetching market positions:', error);
    }
    
    // Return empty array on error (fail gracefully)
    return [];
  }
}

/**
 * Get cached market positions (no API call)
 */
export function getCachedMarketPositions(marketId: string): MarketPosition[] | null {
  const cacheKey = CacheKeys.marketPositions(marketId);
  return cache.get<MarketPosition[]>(cacheKey) || null;
}

/**
 * Invalidate market positions cache (for manual refresh)
 */
export function invalidateMarketPositionsCache(marketId: string): void {
  const cacheKey = CacheKeys.marketPositions(marketId);
  cache.delete(cacheKey);
  console.log(`✓ Invalidated cache for market ${marketId}`);
}
