import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

/**
 * Whale Detection Service
 * 
 * Identifies users in the top 10% by position size per market.
 * 
 * MVP Implementation:
 * - Relies on verified Polymarket accounts
 * - Fetches position data from Polymarket (placeholder for now)
 * - Caches results with TTL
 * - Returns boolean map of whale status per market
 */

interface PositionData {
  userId: string;
  walletAddress: string;
  positionSize: number; // in USD or equivalent
}

@Injectable()
export class WhaleDetectionService {
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MIN_USERS_FOR_WHALE = 10; // Need at least 10 users
  private whaleCache = new Map<string, { whales: Record<string, boolean>; timestamp: number }>();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Get whale status for all active users in a market
   */
  async getMarketWhales(marketId: string, activeUserIds: string[]): Promise<Record<string, boolean>> {
    // Check cache first
    const cached = this.whaleCache.get(marketId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.whales;
    }

    try {
      // Get verified users from the active user list
      const verifiedUsers = await this.userModel
        .find({
          _id: { $in: activeUserIds },
          'polymarket.verified': true,
        })
        .select('_id polymarket')
        .exec();

      if (verifiedUsers.length < this.MIN_USERS_FOR_WHALE) {
        // Not enough users for whale designation
        return {};
      }

      // Fetch position data for verified users
      const positionData = await this.fetchMarketPositions(marketId, verifiedUsers);

      // Calculate 90th percentile
      const whales = this.calculateWhales(positionData);

      // Cache results
      this.whaleCache.set(marketId, {
        whales,
        timestamp: Date.now(),
      });

      return whales;
    } catch (error) {
      console.error('Failed to calculate whales:', error);
      return {};
    }
  }

  /**
   * Fetch position data from Polymarket
   * TODO: Implement actual Polymarket API integration
   */
  private async fetchMarketPositions(
    marketId: string,
    verifiedUsers: UserDocument[],
  ): Promise<PositionData[]> {
    // PLACEHOLDER: In production, this would call Polymarket CLOB API
    // For now, return empty array
    // 
    // Example implementation:
    // const positions = await Promise.all(
    //   verifiedUsers.map(async (user) => {
    //     const wallet = user.polymarket.wallet_address;
    //     const position = await polymarketAPI.getPosition(wallet, marketId);
    //     return {
    //       userId: user._id.toString(),
    //       walletAddress: wallet,
    //       positionSize: position.size_usd,
    //     };
    //   })
    // );

    return verifiedUsers.map((user) => ({
      userId: user._id.toString(),
      walletAddress: user.polymarket?.wallet_address || '',
      positionSize: 0, // Placeholder - would be actual position size
    }));
  }

  /**
   * Calculate whale status based on 90th percentile
   */
  private calculateWhales(positionData: PositionData[]): Record<string, boolean> {
    if (positionData.length < this.MIN_USERS_FOR_WHALE) {
      return {};
    }

    // Filter out zero positions
    const withPositions = positionData.filter((p) => p.positionSize > 0);

    if (withPositions.length < this.MIN_USERS_FOR_WHALE) {
      return {};
    }

    // Sort by position size descending
    const sorted = [...withPositions].sort((a, b) => b.positionSize - a.positionSize);

    // Calculate 90th percentile cutoff
    const percentileIndex = Math.floor(sorted.length * 0.1); // Top 10%
    const cutoff = sorted[percentileIndex]?.positionSize || 0;

    // Mark whales
    const whales: Record<string, boolean> = {};
    sorted.forEach((position) => {
      if (position.positionSize >= cutoff) {
        whales[position.userId] = true;
      }
    });

    return whales;
  }

  /**
   * Clear cache for a specific market
   */
  clearMarketCache(marketId: string): void {
    this.whaleCache.delete(marketId);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.whaleCache.clear();
  }
}
