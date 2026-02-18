import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SpecialRank, SpecialRankDocument } from './schemas/special-rank.schema';
import { User, UserDocument } from './schemas/user.schema';
import { InventoryService } from './inventory.service';

@Injectable()
export class SpecialRanksService {
  constructor(
    @InjectModel(SpecialRank.name) private specialRankModel: Model<SpecialRankDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private inventoryService: InventoryService,
  ) {}

  /**
   * Assign a special rank to a user
   */
  async assignRank(
    userId: string,
    rankName: string,
    criteriaMet: Record<string, any>,
    expiresInDays?: number
  ): Promise<void> {
    const userIdObj = new Types.ObjectId(userId);

    // Check if already has this active rank
    const existing = await this.specialRankModel.findOne({
      user_id: userIdObj,
      rank_name: rankName,
      is_active: true,
    });

    if (existing) {
      // Update last checked time and criteria
      existing.last_checked_at = new Date();
      existing.criteria_met = criteriaMet;
      
      if (expiresInDays) {
        existing.expires_at = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
      }
      
      await existing.save();
      console.log(`✅ Updated existing ${rankName} for user ${userId}`);
      return;
    }

    // Create new special rank assignment
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    await this.specialRankModel.create({
      user_id: userIdObj,
      rank_name: rankName,
      assigned_at: new Date(),
      expires_at: expiresAt,
      is_active: true,
      criteria_met: criteriaMet,
      last_checked_at: new Date(),
    });

    // Update User model
    await this.updateUserSpecialRanks(userId);

    // Unlock accent in inventory
    await this.inventoryService.unlockAccent(userId, rankName, 'special_rank');

    console.log(`✅ Assigned ${rankName} to user ${userId}`);
  }

  /**
   * Remove a special rank from a user
   */
  async removeRank(userId: string, rankName: string): Promise<void> {
    const userIdObj = new Types.ObjectId(userId);

    await this.specialRankModel.updateMany(
      {
        user_id: userIdObj,
        rank_name: rankName,
        is_active: true,
      },
      {
        is_active: false,
      }
    );

    // Update User model
    await this.updateUserSpecialRanks(userId);

    console.log(`✅ Removed ${rankName} from user ${userId}`);
  }

  /**
   * Get all active special ranks for a user
   */
  async getActiveRanks(userId: string): Promise<string[]> {
    const userIdObj = new Types.ObjectId(userId);

    const ranks = await this.specialRankModel.find({
      user_id: userIdObj,
      is_active: true,
    });

    return ranks.map(r => r.rank_name);
  }

  /**
   * Update User model's special_ranks array
   */
  private async updateUserSpecialRanks(userId: string): Promise<void> {
    const activeRanks = await this.getActiveRanks(userId);

    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { special_ranks: activeRanks }
    );
  }

  /**
   * Expire old ranks (called by cron)
   */
  async expireOldRanks(): Promise<number> {
    const now = new Date();

    const result = await this.specialRankModel.updateMany(
      {
        is_active: true,
        expires_at: { $lt: now },
      },
      {
        is_active: false,
      }
    );

    // Update affected users
    const expiredRanks = await this.specialRankModel.find({
      is_active: false,
      expires_at: { $lt: now },
    }).distinct('user_id');

    for (const userId of expiredRanks) {
      await this.updateUserSpecialRanks(userId.toString());
    }

    console.log(`✅ Expired ${result.modifiedCount} special ranks`);
    return result.modifiedCount;
  }

  /**
   * Check if user currently has a specific rank
   */
  async hasRank(userId: string, rankName: string): Promise<boolean> {
    const activeRanks = await this.getActiveRanks(userId);
    return activeRanks.includes(rankName);
  }

  /**
   * Get rank details with criteria
   */
  async getRankDetails(userId: string, rankName: string): Promise<SpecialRankDocument | null> {
    return this.specialRankModel.findOne({
      user_id: new Types.ObjectId(userId),
      rank_name: rankName,
      is_active: true,
    });
  }
}
