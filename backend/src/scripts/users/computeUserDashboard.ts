/**
 * Compute user dashboard statistics
 * 
 * Fetches user's Polymarket data and aggregates into a snapshot
 * This is expensive - only run when explicitly triggered
 */

import { Model } from 'mongoose';
import { fetchUserPositions, UserPosition } from '../polymarket/fetchUserPositions';
import { UserStatsSnapshot, UserStatsSnapshotDocument } from '../../modules/users/schemas/user-stats-snapshot.schema';
import { getMonthString } from '../utils/time';

export interface DashboardComputeResult {
  success: boolean;
  snapshot?: UserStatsSnapshot;
  error?: string;
}

/**
 * Compute full dashboard for a user
 */
export async function computeUserDashboard(
  userId: string,
  walletAddress: string,
  userStatsModel: Model<UserStatsSnapshotDocument>
): Promise<DashboardComputeResult> {
  console.log(`Computing dashboard for user ${userId}...`);

  try {
    // Fetch all user positions from Polymarket
    const positions = await fetchUserPositions(walletAddress);

    if (positions.length === 0) {
      console.log(`✗ No positions found for wallet ${walletAddress}`);
      
      // Create empty snapshot
      const emptySnapshot = await userStatsModel.findOneAndUpdate(
        { user_id: userId },
        {
          user_id: userId,
          wallet_address: walletAddress,
          totals: {
            total_markets: 0,
            open_positions: 0,
            resolved_markets: 0,
            total_risked_usd: 0,
            total_pnl_usd: 0,
          },
          performance: {
            win_rate: 0,
            avg_position_size_usd: 0,
          },
          history: {
            pnl_by_month: [],
          },
          updated_at: new Date(),
        },
        { upsert: true, new: true }
      );

      return {
        success: true,
        snapshot: emptySnapshot.toObject(),
      };
    }

    console.log(`✓ Found ${positions.length} positions`);

    // Aggregate statistics
    const stats = aggregatePositions(positions);

    // Store snapshot
    const snapshot = await userStatsModel.findOneAndUpdate(
      { user_id: userId },
      {
        user_id: userId,
        wallet_address: walletAddress,
        totals: {
          total_markets: stats.totalMarkets,
          open_positions: stats.openPositions,
          resolved_markets: stats.resolvedMarkets,
          total_risked_usd: stats.totalRiskedUSD,
          total_pnl_usd: stats.totalPnLUSD,
        },
        performance: {
          win_rate: stats.winRate,
          avg_position_size_usd: stats.avgPositionSizeUSD,
        },
        history: {
          pnl_by_month: stats.pnlByMonth,
        },
        updated_at: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log(`✓ Dashboard computed successfully`);
    console.log(`   Total markets: ${stats.totalMarkets}`);
    console.log(`   Open positions: ${stats.openPositions}`);
    console.log(`   Total P&L: $${stats.totalPnLUSD.toFixed(2)}`);
    console.log(`   Win rate: ${(stats.winRate * 100).toFixed(1)}%`);

    return {
      success: true,
      snapshot: snapshot.toObject(),
    };
  } catch (error) {
    console.error('Error computing dashboard:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Aggregate position data into statistics
 */
function aggregatePositions(positions: UserPosition[]) {
  // Get unique markets
  const uniqueMarkets = new Set(positions.map(p => p.marketId));
  const totalMarkets = uniqueMarkets.size;

  // Count open positions (assuming all fetched positions are open)
  const openPositions = positions.length;

  // Calculate totals
  const totalRiskedUSD = positions.reduce((sum, p) => sum + p.sizeUSD, 0);
  const totalPnLUSD = positions.reduce((sum, p) => sum + p.pnl, 0);

  // Calculate average position size
  const avgPositionSizeUSD = openPositions > 0 ? totalRiskedUSD / openPositions : 0;

  // Calculate win rate (positions with positive PnL / total positions)
  const winningPositions = positions.filter(p => p.pnl > 0).length;
  const winRate = openPositions > 0 ? winningPositions / openPositions : 0;

  // Group PnL by month
  const pnlByMonth = groupPnLByMonth(positions);

  // Note: We can't determine resolved_markets from current positions
  // This would require historical data from Polymarket API
  const resolvedMarkets = 0;

  return {
    totalMarkets,
    openPositions,
    resolvedMarkets,
    totalRiskedUSD,
    totalPnLUSD,
    avgPositionSizeUSD,
    winRate,
    pnlByMonth,
  };
}

/**
 * Group PnL by month
 * Note: This is a simplified version - real implementation would need historical data
 */
function groupPnLByMonth(positions: UserPosition[]) {
  const monthlyPnL: { [month: string]: number } = {};

  // For now, just put all PnL in current month
  // In production, this would use historical trade data
  const currentMonth = getMonthString(new Date());
  monthlyPnL[currentMonth] = positions.reduce((sum, p) => sum + p.pnl, 0);

  return Object.entries(monthlyPnL).map(([month, pnl]) => ({
    month,
    pnl,
  }));
}

/**
 * Get cached dashboard (no computation)
 */
export async function getCachedDashboard(
  userId: string,
  userStatsModel: Model<UserStatsSnapshotDocument>
): Promise<UserStatsSnapshot | null> {
  const snapshot = await userStatsModel.findOne({ user_id: userId });
  return snapshot ? snapshot.toObject() : null;
}
