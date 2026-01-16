import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatScheduler {
  private readonly logger = new Logger(ChatScheduler.name);

  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Clean up inactive chats
   * Runs daily at 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleChatCleanup() {
    this.logger.log('Starting automated chat cleanup...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find inactive group chats (no messages in 30 days, less than 3 participants)
      const inactiveChats = await this.conversationModel.find({
        type: { $in: ['group', 'dm'] },
        updated_at: { $lt: thirtyDaysAgo },
        participant_count: { $lt: 3 },
      }).exec();

      this.logger.log(`Found ${inactiveChats.length} inactive chats`);

      let deletedCount = 0;

      for (const chat of inactiveChats) {
        // Delete messages
        await this.messageModel.deleteMany({ conversation_id: chat._id });
        
        // Delete conversation
        await this.conversationModel.deleteOne({ _id: chat._id });
        
        deletedCount++;
      }

      this.logger.log(`✓ Cleaned up ${deletedCount} inactive chats`);
    } catch (error) {
      this.logger.error('Failed to clean up chats:', error);
    }
  }

  /**
   * Clean up old deleted messages
   * Runs weekly on Sunday at 4 AM
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleDeletedMessagesCleanup() {
    this.logger.log('Starting deleted messages cleanup...');

    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Permanently delete messages that were soft-deleted more than 90 days ago
      const result = await this.messageModel.deleteMany({
        deleted: true,
        updated_at: { $lt: ninetyDaysAgo },
      });

      this.logger.log(`✓ Permanently deleted ${result.deletedCount} old messages`);
    } catch (error) {
      this.logger.error('Failed to clean up deleted messages:', error);
    }
  }
}
