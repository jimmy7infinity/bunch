/**
 * Orchestrator for computing user market status (⚡ position / 🐳 whale)
 * 
 * This is the main entry point for determining a user's status in a market
 * Only called when user explicitly requests it ("Show my position")
 */

import { Model } from 'mongoose';
import { getUserMarketPosition } from './fetchUserPositions';
import { isUserWhale } from './computeWhalePercentile';
import { MarketUserStatus, MarketUserStatusDocument, StatusType } from '../../modules/chat/schemas/market-user-status.schema';
import { cache, CacheKeys, CacheTTL } from '../utils/cache';

export interface ComputeStatusResult {
  status: StatusType | null; // 'position' | 'whale' | null
  positionSizeUSD: number;
  isWhale: boolean;
  hasPosition: boolean;
}

/**
 * Compute market status for a user
 * 
 * @param userId - User's MongoDB ObjectId
 * @param walletAddress - User's Polymarket wallet address
 * @param marketId - Market ID to check
 * @param marketUserStatusModel - Mongoose model for storing results
 */
export async function computeMarketStatus(
  userId: string,
  walletAddress: string,
  marketId: string,
  marketUserStatusModel: Model<MarketUserStatusDocument>
): Promise<ComputeStatusResult> {
  console.log(`Computing market status for user ${userId} in market ${marketId}...`);

  // Check cache first
  const cacheKey = CacheKeys.userMarketStatus(userId, marketId);
  const cached = cache.get<ComputeStatusResult>(cacheKey);
  if (cached) {
    console.log(`✓ Using cached market status`);
    return cached;
  }

  try {
    // Step 1: Check if user is a whale (this also checks if they have a position)
    const whaleResult = await isUserWhale(marketId, walletAddress);

    if (!whaleResult) {
      console.log(`✗ User has no position in market ${marketId}`);
      
      // Delete any existing status record
      await marketUserStatusModel.deleteOne({
        user_id: userId,
        market_id: marketId,
      });

      const result: ComputeStatusResult = {
        status: null,
        positionSizeUSD: 0,
        isWhale: false,
        hasPosition: false,
      };

      // Cache the result
      cache.set(cacheKey, result, CacheTTL.MARKET_STATUS);

      return result;
    }

    console.log(`✓ User has position: $${whaleResult.sizeUSD.toFixed(2)}`);

    // Step 2: Determine final status (whale overrides position)
    const status: StatusType = whaleResult.isWhale ? 'whale' : 'position';

    console.log(`✓ User status: ${status} (${whaleResult.isWhale ? '🐳' : '⚡'})`);
    console.log(`  Rank: ${whaleResult.rank}/${whaleResult.total}`);

    // Step 3: Store in database
    await marketUserStatusModel.findOneAndUpdate(
      {
        user_id: userId,
        market_id: marketId,
      },
      {
        user_id: userId,
        market_id: marketId,
        status,
        position_size_usd: whaleResult.sizeUSD,
        computed_at: new Date(),
        updated_at: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    const result: ComputeStatusResult = {
      status,
      positionSizeUSD: whaleResult.sizeUSD,
      isWhale: whaleResult.isWhale,
      hasPosition: true,
    };

    // Cache the result
    cache.set(cacheKey, result, CacheTTL.MARKET_STATUS);

    return result;
  } catch (error) {
    console.error('Error computing market status:', error);
    throw error;
  }
}

/**
 * Get cached market status (no computation)
 */
export async function getCachedMarketStatus(
  userId: string,
  marketId: string,
  marketUserStatusModel: Model<MarketUserStatusDocument>
): Promise<ComputeStatusResult | null> {
  // Check memory cache first
  const cacheKey = CacheKeys.userMarketStatus(userId, marketId);
  const cached = cache.get<ComputeStatusResult>(cacheKey);
  if (cached) {
    return cached;
  }

  // Check database
  const dbStatus = await marketUserStatusModel.findOne({
    user_id: userId,
    market_id: marketId,
  });

  if (!dbStatus) {
    return null;
  }

  const result: ComputeStatusResult = {
    status: dbStatus.status,
    positionSizeUSD: dbStatus.position_size_usd,
    isWhale: dbStatus.status === 'whale',
    hasPosition: true,
  };

  // Cache it
  cache.set(cacheKey, result, CacheTTL.MARKET_STATUS);

  return result;
}
