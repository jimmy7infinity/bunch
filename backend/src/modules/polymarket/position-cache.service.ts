import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

interface Position {
  marketId: string;
  sizeUSD: number;
  pnl: number;
  size: number;
}

interface CachedPositions {
  positions: Position[];
  timestamp: number;
  lastCheckedForRanks?: number;
}

/**
 * Position Cache Service
 * Caches Polymarket position data to minimize API calls
 * Shared between whale detection and rank checking
 */
@Injectable()
export class PositionCacheService {
  private cache = new Map<string, CachedPositions>();
  private readonly POSITION_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly RANK_CHECK_COOLDOWN = 15 * 60 * 1000; // 15 minutes between rank checks

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Get user positions with caching
   */
  async getUserPositions(walletAddress: string): Promise<Position[]> {
    const cached = this.cache.get(walletAddress);
    
    if (cached && Date.now() - cached.timestamp < this.POSITION_TTL) {
      return cached.positions;
    }

    // Fetch from Polymarket API
    const positions = await this.fetchFromPolymarket(walletAddress);
    
    this.cache.set(walletAddress, {
      positions,
      timestamp: Date.now(),
      lastCheckedForRanks: cached?.lastCheckedForRanks,
    });

    return positions;
  }

  /**
   * Should we check ranks for this wallet?
   * Returns true if cooldown period has passed
   */
  shouldCheckRanks(walletAddress: string): boolean {
    const cached = this.cache.get(walletAddress);
    
    if (!cached || !cached.lastCheckedForRanks) {
      return true;
    }

    return Date.now() - cached.lastCheckedForRanks > this.RANK_CHECK_COOLDOWN;
  }

  /**
   * Mark that we checked ranks for this wallet
   */
  markRanksChecked(walletAddress: string): void {
    const cached = this.cache.get(walletAddress);
    if (cached) {
      cached.lastCheckedForRanks = Date.now();
    }
  }

  /**
   * Fetch positions from Polymarket Data API
   */
  private async fetchFromPolymarket(walletAddress: string): Promise<Position[]> {
    try {
      const params = new URLSearchParams({
        user: walletAddress,
        limit: '100',
        sortBy: 'TOKENS',
        sortDirection: 'DESC',
      });

      const response = await fetch(
        `https://data-api.polymarket.com/positions?${params.toString()}`,
        { timeout: 10000 }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch positions for ${walletAddress}: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      return (data || []).map((p: any) => ({
        marketId: p.market || p.condition_id || '',
        sizeUSD: parseFloat(p.value || p.size_usd || 0),
        pnl: parseFloat(p.pnl || p.unrealized_pnl || 0),
        size: parseFloat(p.size || 0),
      }));
    } catch (error) {
      console.error(`Error fetching positions for ${walletAddress}:`, error);
      return [];
    }
  }

  clearCache(walletAddress?: string): void {
    if (walletAddress) {
      this.cache.delete(walletAddress);
    } else {
      this.cache.clear();
    }
  }
}
