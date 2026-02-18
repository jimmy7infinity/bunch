import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Message, MessageDocument } from '../chat/schemas/message.schema';
import { SpecialRanksService } from '../users/special-ranks.service';
import { OpportunisticRankChecker } from './opportunistic-rank-checker.service';
import { PositionCacheService } from '../polymarket/position-cache.service';

@Injectable()
export class RanksCronService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private specialRanksService: SpecialRanksService,
    private opportunisticChecker: OpportunisticRankChecker,
    private positionCache: PositionCacheService,
  ) {}

  /**
   * Daily rank check at 3 AM - only active users
   */
  @Cron('0 3 * * *', {
    name: 'daily-rank-check',
    timeZone: 'America/New_York',
  })
  async handleDailyRankCheck(): Promise<void> {
    console.log('🎖️ [CRON] Starting daily rank checks...');
    
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const activeUsers = await this.userModel.find({
        'polymarket.verified': true,
        'polymarket.wallet_address': { $exists: true },
        last_active: { $gte: sevenDaysAgo },
      }).limit(1000);

      let checked = 0;
      for (const user of activeUsers) {
        try {
          if (!user.polymarket?.wallet_address) continue;
          
          const positions = await this.positionCache.getUserPositions(
            user.polymarket.wallet_address
          );
          await this.opportunisticChecker.checkRanksWithPositions(
            user._id.toString(),
            positions
          );
          checked++;
          await this.sleep(100); // Rate limit: 10 req/sec
        } catch (error) {
          console.error(`Failed to check ranks for ${user._id}:`, error);
        }
      }

      await this.checkDankRanks();

      console.log(`✅ [CRON] Checked ${checked} users`);
    } catch (error) {
      console.error('❌ [CRON] Error during rank checks:', error);
    }
  }

  /**
   * Expire old ranks every 6 hours
   */
  @Cron('0 */6 * * *', {
    name: 'expire-ranks',
  })
  async handleExpireRanks(): Promise<void> {
    console.log('⏰ [CRON] Expiring old ranks...');
    
    try {
      const count = await this.specialRanksService.expireOldRanks();
      console.log(`✅ [CRON] Expired ${count} ranks`);
    } catch (error) {
      console.error('❌ [CRON] Error expiring ranks:', error);
    }
  }

  private async checkDankRanks(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const LAUGH_EMOJIS = ['😂', '🤣', '💀', '😭', '😹', 'LAUGH'];
    const MIN_LAUGH_REACTIONS = 50;

    const activeUserIds = await this.messageModel.distinct('sender_id', {
      created_at: { $gte: thirtyDaysAgo },
      deleted_at: null,
    });

    for (const userId of activeUserIds) {
      try {
        const messages = await this.messageModel.find({
          sender_id: userId,
          created_at: { $gte: thirtyDaysAgo },
          deleted_at: null,
        });

        let laughCount = 0;
        for (const message of messages) {
          if (message.reactions && typeof message.reactions === 'object') {
            for (const [emoji, users] of Object.entries(message.reactions)) {
              if (LAUGH_EMOJIS.includes(emoji)) {
                laughCount += Array.isArray(users) ? users.length : 0;
              }
            }
          }
        }

        if (laughCount >= MIN_LAUGH_REACTIONS) {
          await this.specialRanksService.assignRank(
            userId.toString(),
            'DANK',
            { laugh_reactions: laughCount, messages_count: messages.length },
            30
          );
        } else if (await this.specialRanksService.hasRank(userId.toString(), 'DANK')) {
          await this.specialRanksService.removeRank(userId.toString(), 'DANK');
        }
      } catch (error) {
        console.error(`Failed to check DANK for ${userId}:`, error);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
