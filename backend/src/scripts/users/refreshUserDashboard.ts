/**
 * Entry point for refreshing user dashboard
 * 
 * Handles rate limiting and triggers dashboard computation
 * Called from:
 * - User login
 * - Manual refresh button
 * - Scheduled background job
 */

import { Model } from 'mongoose';
import { computeUserDashboard, DashboardComputeResult } from './computeUserDashboard';
import { UserStatsSnapshot, UserStatsSnapshotDocument } from '../../modules/users/schemas/user-stats-snapshot.schema';
import { rateLimit, RateLimitWindows } from '../utils/rateLimit';

export interface RefreshResult {
  success: boolean;
  snapshot?: UserStatsSnapshot;
  error?: string;
  rateLimited?: boolean;
  timeUntilReset?: number;
}

/**
 * Refresh user dashboard with rate limiting
 */
export async function refreshUserDashboard(
  userId: string,
  walletAddress: string,
  userStatsModel: Model<UserStatsSnapshotDocument>,
  skipRateLimit: boolean = false
): Promise<RefreshResult> {
  console.log(`Refresh dashboard requested for user ${userId}`);

  try {
    // Check rate limit (unless skipped, e.g., for login or scheduled jobs)
    if (!skipRateLimit) {
      try {
        await rateLimit.checkRateLimit({
          userId,
          action: 'refresh_dashboard',
          windowMs: RateLimitWindows.REFRESH_DASHBOARD,
        });
      } catch (error) {
        console.log(`✗ Rate limit exceeded: ${error.message}`);
        
        const timeUntilReset = rateLimit.getTimeUntilReset({
          userId,
          action: 'refresh_dashboard',
        });

        return {
          success: false,
          rateLimited: true,
          timeUntilReset: timeUntilReset || 0,
          error: error.message,
        };
      }
    }

    // Compute dashboard
    const result = await computeUserDashboard(userId, walletAddress, userStatsModel);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      snapshot: result.snapshot,
    };
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Refresh dashboard on user login (skip rate limit)
 */
export async function refreshDashboardOnLogin(
  userId: string,
  walletAddress: string,
  userStatsModel: Model<UserStatsSnapshotDocument>
): Promise<RefreshResult> {
  console.log(`Refreshing dashboard on login for user ${userId}`);
  return refreshUserDashboard(userId, walletAddress, userStatsModel, true);
}

/**
 * Scheduled refresh for all users (background job)
 * This would be called by a cron job once per day
 */
export async function scheduledDashboardRefresh(
  userStatsModel: Model<UserStatsSnapshotDocument>,
  userModel: any // User model to get all verified users
): Promise<{ success: number; failed: number }> {
  console.log('🔄 Starting scheduled dashboard refresh for all users...');

  let success = 0;
  let failed = 0;

  try {
    // Get all verified Polymarket users
    const users = await userModel.find({
      'polymarket.verified': true,
      'polymarket.wallet_address': { $exists: true },
    });

    console.log(`Found ${users.length} verified users to refresh`);

    for (const user of users) {
      try {
        const result = await refreshUserDashboard(
          user._id.toString(),
          user.polymarket.wallet_address,
          userStatsModel,
          true // Skip rate limit for scheduled jobs
        );

        if (result.success) {
          success++;
          console.log(`✓ Refreshed dashboard for user ${user._id}`);
        } else {
          failed++;
          console.log(`✗ Failed to refresh dashboard for user ${user._id}: ${result.error}`);
        }

        // Add small delay to avoid overwhelming Polymarket API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        failed++;
        console.error(`✗ Error refreshing user ${user._id}:`, error);
      }
    }

    console.log(`✅ Scheduled refresh complete: ${success} success, ${failed} failed`);
  } catch (error) {
    console.error('❌ Scheduled refresh failed:', error);
  }

  return { success, failed };
}
