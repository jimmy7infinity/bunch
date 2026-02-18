import { Injectable } from '@nestjs/common';
import { SpecialRanksService } from '../users/special-ranks.service';

interface Position {
  marketId: string;
  sizeUSD: number;
  pnl: number;
  size: number;
}

const DIAMOND_HOLD_DAYS = 30;
const MIN_POSITION_SIZE = 100;
const MIN_STREAK = 5;
const MIN_PROFIT_PER_TRADE = 10;
const WHALE_POSITION_SIZE = 1000;
const MIN_WHALE_MARKETS = 3;

/**
 * Opportunistic Rank Checker
 * Checks ranks when we already have position data
 * Runs asynchronously without blocking main request
 */
@Injectable()
export class OpportunisticRankChecker {
  constructor(private specialRanksService: SpecialRanksService) {}

  /**
   * Check all position-based ranks opportunistically
   * Non-blocking - runs in background
   */
  async checkRanksWithPositions(userId: string, positions: Position[]): Promise<void> {
    setImmediate(async () => {
      try {
        await Promise.all([
          this.checkDiamond(userId, positions),
          this.checkOnFire(userId, positions),
          this.checkSize(userId, positions),
        ]);
      } catch (error) {
        console.error(`Opportunistic rank check failed for ${userId}:`, error);
      }
    });
  }

  private async checkDiamond(userId: string, positions: Position[]): Promise<void> {
    const largePositions = positions.filter(p => p.sizeUSD >= MIN_POSITION_SIZE);
    const estimatedHoldDays = largePositions.length >= 3 ? DIAMOND_HOLD_DAYS : 0;

    if (estimatedHoldDays >= DIAMOND_HOLD_DAYS) {
      const totalSize = largePositions.reduce((sum, p) => sum + p.sizeUSD, 0);
      await this.specialRanksService.assignRank(userId, 'DIAMOND', {
        hold_days: estimatedHoldDays,
        position_count: largePositions.length,
        total_size: totalSize,
        checked_at: new Date(),
      });
    } else {
      if (await this.specialRanksService.hasRank(userId, 'DIAMOND')) {
        await this.specialRanksService.removeRank(userId, 'DIAMOND');
      }
    }
  }

  private async checkOnFire(userId: string, positions: Position[]): Promise<void> {
    const profitablePositions = positions.filter(p => p.pnl >= MIN_PROFIT_PER_TRADE);
    const currentStreak = profitablePositions.length;

    if (currentStreak >= MIN_STREAK) {
      const totalProfit = profitablePositions.reduce((sum, p) => sum + p.pnl, 0);
      await this.specialRanksService.assignRank(
        userId,
        'ON FIRE',
        {
          win_streak: currentStreak,
          total_profit: totalProfit,
          checked_at: new Date(),
        },
        7
      );
    } else {
      if (await this.specialRanksService.hasRank(userId, 'ON FIRE')) {
        await this.specialRanksService.removeRank(userId, 'ON FIRE');
      }
    }
  }

  private async checkSize(userId: string, positions: Position[]): Promise<void> {
    const positionsByMarket = new Map<string, number>();

    for (const position of positions) {
      const current = positionsByMarket.get(position.marketId) || 0;
      positionsByMarket.set(position.marketId, current + position.sizeUSD);
    }

    let whaleMarkets = 0;
    let totalPositionSize = 0;

    for (const [, size] of positionsByMarket) {
      totalPositionSize += size;
      if (size >= WHALE_POSITION_SIZE) {
        whaleMarkets++;
      }
    }

    if (whaleMarkets >= MIN_WHALE_MARKETS) {
      await this.specialRanksService.assignRank(
        userId,
        'SIZE',
        {
          whale_markets: whaleMarkets,
          total_position_size: totalPositionSize,
          total_markets: positionsByMarket.size,
          checked_at: new Date(),
        },
        7
      );
    } else {
      if (await this.specialRanksService.hasRank(userId, 'SIZE')) {
        await this.specialRanksService.removeRank(userId, 'SIZE');
      }
    }
  }
}
