/**
 * Compute whale status based on percentile ranking
 * 
 * A user is a "whale" if they're in the top 10% of position holders for a market
 * This is computed from all market positions fetched from Polymarket Data API
 */

import { fetchMarketPositions } from './fetchMarketPositions';

/**
 * Check if a user has a position in a market (and their size)
 * Note: Whale detection is disabled because Polymarket API doesn't support fetching all positions
 * 
 * @param marketId - Market ID or event slug to check
 * @param userWallet - User's wallet address
 * @returns { isWhale: false, rank: 0, total: 0, sizeUSD: number } or null if no position
 */
export async function isUserWhale(
  marketId: string,
  userWallet: string
): Promise<{ isWhale: boolean; rank: number; total: number; sizeUSD: number } | null> {
  console.log(`Checking position for wallet ${userWallet.slice(0, 8)}... in market ${marketId.slice(0, 30)}...`);

  const normalizedWallet = userWallet.toLowerCase();
  
  // Check if marketId is an event slug (doesn't start with 0x) vs a conditionId
  const isEventSlug = !marketId.startsWith('0x');
  
  if (isEventSlug) {
    console.log(`📍 Detected event slug, checking all markets within event...`);
    
    try {
      // Fetch the event from Gamma API to get all constituent markets
      const eventResponse = await fetch(`https://gamma-api.polymarket.com/events?slug=${marketId}`);
      if (!eventResponse.ok) {
        console.error('❌ Failed to fetch event from Gamma API:', eventResponse.status);
        return null;
      }
      
      const events = await eventResponse.json();
      if (!events || events.length === 0) {
        console.log('❌ Event not found:', marketId);
        return null;
      }
      
      const event = events[0];
      const markets = event.markets || [];
      console.log(`📊 Found ${markets.length} markets within event`);
      
      // Check user's positions across all markets in this event
      let totalSizeUSD = 0;
      let hasAnyPosition = false;
      
      for (const market of markets) {
        const conditionId = market.conditionId;
        
        // Query user's position for this specific market
        const posUrl = `https://data-api.polymarket.com/positions?user=${normalizedWallet}&market=${conditionId}&sizeThreshold=0.01&limit=100&sortBy=TOKENS&sortDirection=DESC`;
        const posResponse = await fetch(posUrl);
        
        if (!posResponse.ok) {
          continue; // Skip this market if API call fails
        }
        
        const positions = await posResponse.json();
        
        if (positions.length > 0) {
          hasAnyPosition = true;
          // Sum up all positions in this market
          for (const pos of positions) {
            totalSizeUSD += pos.currentValue || 0;
          }
        }
      }
      
      if (!hasAnyPosition) {
        console.log('❌ No positions found in any market within this event');
        return null;
      }
      
      console.log(`✅ User has position(s) worth $${totalSizeUSD.toFixed(2)} across event markets`);
      
      return {
        isWhale: false, // Whale detection disabled
        rank: 0,
        total: 0,
        sizeUSD: totalSizeUSD,
      };
    } catch (error) {
      console.error('❌ Error checking event positions:', error);
      return null;
    }
  }

  // Direct conditionId - query normally
  try {
    const posUrl = `https://data-api.polymarket.com/positions?user=${normalizedWallet}&market=${marketId}&sizeThreshold=0.01&limit=100&sortBy=TOKENS&sortDirection=DESC`;
    const posResponse = await fetch(posUrl);
    
    if (!posResponse.ok) {
      console.error('❌ Failed to fetch positions:', posResponse.status);
      return null;
    }
    
    const positions = await posResponse.json();
    
    if (positions.length === 0) {
      console.log('❌ No position found for this market');
      return null;
    }
    
    // Sum up all positions
    let totalSizeUSD = 0;
    for (const pos of positions) {
      totalSizeUSD += pos.currentValue || 0;
    }
    
    console.log(`✅ User has position worth $${totalSizeUSD.toFixed(2)}`);
    
    return {
      isWhale: false, // Whale detection disabled
      rank: 0,
      total: 0,
      sizeUSD: totalSizeUSD,
    };
  } catch (error) {
    console.error('❌ Error checking position:', error);
    return null;
  }
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
