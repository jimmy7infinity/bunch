import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash } from 'crypto';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument, ConversationType } from './schemas/conversation.schema';
import { Participant, ParticipantDocument } from './schemas/participant.schema';
import { UserMarketPosition, UserMarketPositionDocument, PositionType } from './schemas/user-market-position.schema';
import { MarketUserStatus, MarketUserStatusDocument } from './schemas/market-user-status.schema';
import { Report, ReportDocument } from './schemas/report.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Participant.name) private participantModel: Model<ParticipantDocument>,
    @InjectModel(UserMarketPosition.name) private userMarketPositionModel: Model<UserMarketPositionDocument>,
    @InjectModel(MarketUserStatus.name) private marketUserStatusModel: Model<MarketUserStatusDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  // ==================== CONVERSATION MANAGEMENT ====================

  /**
   * Find or create a market chat for a Polymarket market
   */
  async findOrCreateMarketChat(marketId: string, title: string, metadata?: Record<string, any>) {
    let conversation = await this.conversationModel.findOne({
      type: 'market',
      market_id: marketId,
    })
    .populate({
      path: 'last_message_id',
      populate: {
        path: 'sender_id',
        select: 'username display_name avatar_url rank',
      },
    })
    .exec();

    if (!conversation) {
      conversation = new this.conversationModel({
        type: 'market',
        market_id: marketId,
        title,
        is_private: false,
        metadata: metadata || {},
      });
      await conversation.save();
    }

    return conversation;
  }

  /**
   * Find or create a DM between two users
   */
  async findOrCreateDM(user1Id: string, user2Id: string) {
    // Create deterministic hash from sorted user IDs
    const dmHash = createHash('md5')
      .update([user1Id, user2Id].sort().join(':'))
      .digest('hex');

    let conversation = await this.conversationModel.findOne({
      type: 'dm',
      dm_hash: dmHash,
    })
    .populate({
      path: 'last_message_id',
      populate: {
        path: 'sender_id',
        select: 'username display_name avatar_url rank',
      },
    })
    .exec();

    if (!conversation) {
      conversation = new this.conversationModel({
        type: 'dm',
        dm_hash: dmHash,
        is_private: true,
        participant_count: 0, // Start at 0, joinConversation will increment
      });
      await conversation.save();

      // Add both users as participants
      await this.joinConversation(conversation._id.toString(), user1Id, 'member');
      await this.joinConversation(conversation._id.toString(), user2Id, 'member');
    }

    return conversation;
  }

  /**
   * Create a group chat
   */
  async createGroupChat(title: string, creatorId: string, memberIds: string[]) {
    const conversation = new this.conversationModel({
      type: 'group',
      title,
      is_private: true,
      created_by: new Types.ObjectId(creatorId),
      participant_count: 0, // Start at 0, joinConversation will increment
    });
    await conversation.save();

    // Add creator as owner
    await this.joinConversation(conversation._id.toString(), creatorId, 'owner');

    // Add members
    for (const memberId of memberIds) {
      await this.joinConversation(conversation._id.toString(), memberId, 'member');
    }

    // Populate before returning
    return this.conversationModel.findById(conversation._id)
      .populate({
        path: 'last_message_id',
        populate: {
          path: 'sender_id',
          select: 'username display_name avatar_url rank',
        },
      })
      .exec();
  }

  /**
   * Get or create a global chat by slug
   */
  async findOrCreateGlobalChat(slug: string, title: string) {
    let conversation = await this.conversationModel.findOne({
      type: 'global',
      slug,
    }).exec();

    if (!conversation) {
      conversation = new this.conversationModel({
        type: 'global',
        slug,
        title,
        is_private: false,
      });
      await conversation.save();
    }

    return conversation;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string) {
    const conversation = await this.conversationModel.findById(conversationId).exec();
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  async findConversationByMarketId(marketId: string) {
    return this.conversationModel.findOne({ type: 'market', market_id: marketId }).exec();
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string) {
    const participants = await this.participantModel
      .find({ user_id: new Types.ObjectId(userId) })
      .populate({
        path: 'conversation_id',
        populate: {
          path: 'last_message_id',
          populate: {
            path: 'sender_id',
            select: 'username display_name avatar_url rank',
          },
        },
      })
      .sort({ last_read_at: -1 })
      .exec();

    // For DM conversations, populate the other user's info
    const enrichedParticipants = await Promise.all(
      participants.map(async (p) => {
        const conv: any = p.conversation_id;
        
        // If it's a DM, fetch the other participant's info
        if (conv && conv.type === 'dm') {
          const otherParticipant = await this.participantModel
            .findOne({
              conversation_id: conv._id,
              user_id: { $ne: new Types.ObjectId(userId) },
            })
            .populate('user_id', 'username display_name avatar_url rank')
            .exec();

          if (otherParticipant) {
            const otherUser: any = otherParticipant.user_id;
            // Set the title to the other user's display name or username
            conv.title = otherUser.display_name || otherUser.username;
            // Store the other user's info in metadata for easy access
            conv.dm_user = {
              _id: otherUser._id,
              username: otherUser.username,
              display_name: otherUser.display_name,
              avatar_url: otherUser.avatar_url,
              rank: otherUser.rank,
            };
          }
        }

        return {
          conversation: conv,
          role: p.role,
          last_read_at: p.last_read_at,
          muted: p.muted,
          has_notifications: p.has_notifications,
          is_favorite: p.is_favorite,
        };
      })
    );

    return enrichedParticipants;
  }

  /**
   * Get all global chats (with user's participant data if provided)
   */
  async getGlobalChats(userId?: string) {
    const conversations = await this.conversationModel
      .find({ type: 'global' })
      .populate({
        path: 'last_message_id',
        populate: {
          path: 'sender_id',
          select: 'username display_name avatar_url rank',
        },
      })
      .sort({ last_message_at: -1 })
      .exec();

    // If userId provided, attach participant data
    if (userId) {
      const conversationIds = conversations.map(c => c._id);
      const participants = await this.participantModel
        .find({
          conversation_id: { $in: conversationIds },
          user_id: new Types.ObjectId(userId),
        })
        .exec();

      const participantMap = new Map();
      participants.forEach(p => {
        participantMap.set(p.conversation_id.toString(), {
          is_favorite: p.is_favorite,
          has_notifications: p.has_notifications,
          muted: p.muted,
        });
      });

      return conversations.map(c => {
        const participantData = participantMap.get(c._id.toString());
        return {
          ...c.toObject(),
          is_favorite: participantData?.is_favorite || false,
          has_notifications: participantData?.has_notifications || true,
          muted: participantData?.muted || false,
        };
      });
    }

    return conversations;
  }

  /**
   * Create or get a global chat
   */
  async createOrGetGlobalChat(title: string, slug: string) {
    const existing = await this.conversationModel.findOne({
      type: 'global',
      slug,
    }).exec();

    if (existing) {
      return { chat: existing, created: false };
    }

    const newChat = await this.conversationModel.create({
      type: 'global',
      title,
      slug,
      is_private: false,
      participant_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { chat: newChat, created: true };
  }

  /**
   * Get all market chats (with user's participant data if provided)
   */
  async getMarketChats(userId?: string) {
    const conversations = await this.conversationModel
      .find({ type: 'market' })
      .populate({
        path: 'last_message_id',
        populate: {
          path: 'sender_id',
          select: 'username display_name avatar_url rank',
        },
      })
      .sort({ last_message_at: -1 })
      .exec();

    // If userId provided, attach participant data
    if (userId) {
      const conversationIds = conversations.map(c => c._id);
      const participants = await this.participantModel
        .find({
          conversation_id: { $in: conversationIds },
          user_id: new Types.ObjectId(userId),
        })
        .exec();

      const participantMap = new Map();
      participants.forEach(p => {
        participantMap.set(p.conversation_id.toString(), {
          is_favorite: p.is_favorite,
          has_notifications: p.has_notifications,
          muted: p.muted,
        });
      });

      return conversations.map(c => {
        const participantData = participantMap.get(c._id.toString());
        return {
          ...c.toObject(),
          is_favorite: participantData?.is_favorite || false,
          has_notifications: participantData?.has_notifications || true,
          muted: participantData?.muted || false,
        };
      });
    }

    return conversations;
  }

  /**
   * Search market chats
   */
  async searchMarketChats(query: string, limit = 20) {
    return this.conversationModel
      .find({
        type: 'market',
        title: { $regex: query, $options: 'i' },
      })
      .populate({
        path: 'last_message_id',
        populate: {
          path: 'sender_id',
          select: 'username display_name avatar_url rank',
        },
      })
      .limit(limit)
      .sort({ last_message_at: -1 })
      .exec();
  }

  // ==================== PARTICIPANT MANAGEMENT ====================

  /**
   * Join a conversation
   */
  async joinConversation(conversationId: string, userId: string, role: 'owner' | 'admin' | 'member' = 'member') {
    try {
      // First check if participant already exists
      const existingParticipant = await this.participantModel.findOne({
        conversation_id: new Types.ObjectId(conversationId),
        user_id: new Types.ObjectId(userId),
      }).exec();

      // If already a participant, just return it
      if (existingParticipant) {
        return existingParticipant;
      }

      // Create new participant
      const participant = await this.participantModel.create({
        conversation_id: new Types.ObjectId(conversationId),
        user_id: new Types.ObjectId(userId),
        role,
        joined_at: new Date(),
      });

      // Increment participant count (only runs for new participants)
      await this.conversationModel.findByIdAndUpdate(conversationId, {
        $inc: { participant_count: 1 },
      }).exec();

      return participant;
    } catch (error) {
      // If duplicate key error (race condition), fetch and return existing
      if (error.code === 11000) {
        return await this.participantModel.findOne({
          conversation_id: new Types.ObjectId(conversationId),
          user_id: new Types.ObjectId(userId),
        }).exec();
      }
      throw error;
    }
  }

  /**
   * Leave a conversation
   */
  async leaveConversation(conversationId: string, userId: string) {
    const result = await this.participantModel.deleteOne({
      conversation_id: new Types.ObjectId(conversationId),
      user_id: new Types.ObjectId(userId),
    }).exec();

    if (result.deletedCount > 0) {
      // Update participant count
      await this.conversationModel.findByIdAndUpdate(conversationId, {
        $inc: { participant_count: -1 },
      }).exec();
    }

    return result.deletedCount > 0;
  }

  /**
   * Get participants of a conversation
   */
  async getParticipants(conversationId: string, offset: number = 0, limit: number = 0) {
    const query = this.participantModel
      .find({ conversation_id: new Types.ObjectId(conversationId) })
      .populate('user_id', 'username display_name avatar_url is_online rank')
      .sort({ joined_at: -1 });

    // If limit is 0, return all (backward compatibility)
    if (limit > 0) {
      query.skip(offset).limit(limit);
    }

    const participants = await query.exec();

    // If pagination is used, also return total count and hasMore
    if (limit > 0) {
      const totalCount = await this.participantModel
        .countDocuments({ conversation_id: new Types.ObjectId(conversationId) });
      
      return {
        participants,
        totalCount,
        hasMore: offset + participants.length < totalCount,
      };
    }

    // Backward compatibility: return just the array
    return participants;
  }

  /**
   * Check if user is participant
   */
  async isParticipant(conversationId: string, userId: string) {
    const participant = await this.participantModel.findOne({
      conversation_id: new Types.ObjectId(conversationId),
      user_id: new Types.ObjectId(userId),
    }).exec();

    return !!participant;
  }

  /**
   * Update last read time
   */
  async updateLastRead(conversationId: string, userId: string) {
    await this.participantModel.findOneAndUpdate(
      {
        conversation_id: new Types.ObjectId(conversationId),
        user_id: new Types.ObjectId(userId),
      },
      { last_read_at: new Date() },
    ).exec();
  }

  /**
   * Toggle mute
   */
  async toggleMute(conversationId: string, userId: string) {
    const participant = await this.participantModel.findOne({
      conversation_id: new Types.ObjectId(conversationId),
      user_id: new Types.ObjectId(userId),
    }).exec();

    if (!participant) {
      throw new NotFoundException('Not a participant');
    }

    participant.muted = !participant.muted;
    await participant.save();

    return participant.muted;
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite(conversationId: string, userId: string) {
    const participant = await this.participantModel.findOne({
      conversation_id: new Types.ObjectId(conversationId),
      user_id: new Types.ObjectId(userId),
    }).exec();

    if (!participant) {
      throw new NotFoundException('Not a participant');
    }

    participant.is_favorite = !participant.is_favorite;
    await participant.save();

    return participant.is_favorite;
  }

  /**
   * Toggle notifications
   */
  async toggleNotifications(conversationId: string, userId: string) {
    const participant = await this.participantModel.findOne({
      conversation_id: new Types.ObjectId(conversationId),
      user_id: new Types.ObjectId(userId),
    }).exec();

    if (!participant) {
      throw new NotFoundException('Not a participant');
    }

    participant.has_notifications = !participant.has_notifications;
    await participant.save();

    return participant.has_notifications;
  }

  // ==================== MESSAGE MANAGEMENT ====================

  /**
   * Create a message in a conversation
   */
  async createMessage(
    conversationId: string,
    senderId: string,
    text: string,
    replyTo?: string,
    mentions?: string[],
    metadata?: any,
  ): Promise<Message> {
    // Verify sender is participant (except for global and market chats)
    const conversation = await this.getConversation(conversationId);
    
    if (conversation.type === 'dm' || conversation.type === 'group') {
      const isParticipant = await this.isParticipant(conversationId, senderId);
      if (!isParticipant) {
        throw new BadRequestException('You are not a participant of this conversation');
      }
    }

    // For global and market chats, auto-join user if not already
    if (conversation.type === 'global' || conversation.type === 'market') {
      await this.joinConversation(conversationId, senderId, 'member');
    }

    const message = new this.messageModel({
      conversation_id: new Types.ObjectId(conversationId),
      sender_id: new Types.ObjectId(senderId),
      text,
      reply_to: replyTo ? new Types.ObjectId(replyTo) : undefined,
      mentions: mentions?.map(id => new Types.ObjectId(id)),
      metadata,
    });

    await message.save();

    // Update conversation's last_message_at and last_message_id
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      last_message_at: new Date(),
      last_message_id: message._id,
    }).exec();

    return message;
  }

  /**
   * Get messages from a conversation
   */
  async getMessages(conversationId: string, limit: number = 50, before?: Date): Promise<Message[]> {
    const query: any = { 
      conversation_id: new Types.ObjectId(conversationId),
      deleted: false,
    };

    if (before) {
      query.created_at = { $lt: before };
    }

    return this.messageModel
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .populate('sender_id', 'username display_name avatar_url rank equipped_accent polymarket')
      .populate({
        path: 'reply_to',
        select: 'text sender_id',
        populate: {
          path: 'sender_id',
          select: 'username display_name avatar_url',
        },
      })
      .exec();
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: string, userId: string, emoji: string): Promise<Message> {
    const message = await this.messageModel.findById(messageId).exec();

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const reactions = message.reactions || new Map();
    const userObjectId = new Types.ObjectId(userId);
    
    if (!reactions.has(emoji)) {
      reactions.set(emoji, []);
    }

    const emojiReactions = reactions.get(emoji) || [];
    const userIndex = emojiReactions.findIndex(
      (id) => id.toString() === userId,
    );

    if (userIndex === -1) {
      // Add reaction
      emojiReactions.push(userObjectId);
    } else {
      // Remove reaction (toggle)
      emojiReactions.splice(userIndex, 1);
    }

    reactions.set(emoji, emojiReactions);
    message.reactions = reactions;

    return message.save();
  }

  /**
   * Delete a message (user can delete own, mods/admins can delete any)
   */
  async deleteMessage(messageId: string, userId: string, userRole?: string): Promise<any> {
    // Check if user is mod/admin/creator - they can delete any message
    const canDeleteAny = ['admin', 'moderator', 'creator'].includes(userRole || '');
    
    const query = canDeleteAny 
      ? { _id: messageId } // Admins can delete any message
      : { _id: messageId, sender_id: new Types.ObjectId(userId) }; // Users can only delete their own
    
    const message = await this.messageModel
      .findOneAndUpdate(
        query,
        { deleted: true },
        { new: true }
      )
      .exec();
    
    if (!message) {
      return null;
    }

    // Check if this was the last message in the conversation
    const conversation = await this.conversationModel.findOne({
      last_message_id: new Types.ObjectId(messageId),
    }).exec();

    if (conversation) {
      // Find the next most recent non-deleted message
      const newLastMessage = await this.messageModel
        .findOne({
          conversation_id: conversation._id,
          deleted: false,
        })
        .sort({ created_at: -1 })
        .exec();

      // Update conversation's last_message_id
      await this.conversationModel.findByIdAndUpdate(conversation._id, {
        last_message_id: newLastMessage ? newLastMessage._id : null,
      }).exec();
    }
    
    return message;
  }

  /**
   * Get unread count for a user in a conversation
   */
  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const participant = await this.participantModel.findOne({
      conversation_id: new Types.ObjectId(conversationId),
      user_id: new Types.ObjectId(userId),
    }).exec();

    if (!participant || !participant.last_read_at) {
      // If never read, count all messages
      return this.messageModel.countDocuments({
        conversation_id: new Types.ObjectId(conversationId),
        deleted: false,
      }).exec();
    }

    return this.messageModel.countDocuments({
      conversation_id: new Types.ObjectId(conversationId),
      created_at: { $gt: participant.last_read_at },
      deleted: false,
    }).exec();
  }

  // ==================== USER MARKET POSITIONS ====================

  /**
   * Set a user's position for a market
   */
  async setUserPosition(userId: string, marketId: string, position: PositionType) {
    const result = await this.userMarketPositionModel.findOneAndUpdate(
      { 
        user_id: new Types.ObjectId(userId), 
        market_id: marketId 
      },
      { 
        position,
        updated_at: new Date(),
      },
      { 
        upsert: true, 
        new: true 
      }
    ).exec();

    return result;
  }

  /**
   * Get a user's position for a market
   */
  async getUserPosition(userId: string, marketId: string) {
    const position = await this.userMarketPositionModel.findOne({
      user_id: new Types.ObjectId(userId),
      market_id: marketId,
    }).exec();

    return position;
  }

  /**
   * Get all positions for a market
   */
  async getMarketPositions(marketId: string) {
    const positions = await this.userMarketPositionModel
      .find({ market_id: marketId })
      .populate('user_id', 'username display_name avatar_url rank')
      .exec();

    return positions;
  }

  /**
   * Clear a user's position for a market
   */
  async clearUserPosition(userId: string, marketId: string) {
    await this.userMarketPositionModel.deleteOne({
      user_id: new Types.ObjectId(userId),
      market_id: marketId,
    }).exec();

    return { success: true };
  }

  // ==================== MARKET STATUS (⚡ / 🐳) ====================

  /**
   * Compute market status for a user (⚡ position / 🐳 whale)
   * This is the entry point that calls the computeMarketStatus script
   */
  async computeUserMarketStatus(userId: string, walletAddress: string, marketId: string) {
    // Import the script dynamically to avoid circular dependencies
    const { computeMarketStatus } = await import('../../scripts/polymarket/computeMarketStatus');
    
    return computeMarketStatus(
      userId,
      walletAddress,
      marketId,
      this.marketUserStatusModel
    );
  }

  /**
   * Get cached market status (no computation)
   */
  async getCachedMarketStatus(userId: string, marketId: string) {
    const { getCachedMarketStatus } = await import('../../scripts/polymarket/computeMarketStatus');
    
    return getCachedMarketStatus(
      userId,
      marketId,
      this.marketUserStatusModel
    );
  }

  // ==================== REPORTS ====================

  /**
   * Create a report
   */
  async createReport(
    reporterId: string,
    type: 'message' | 'user' | 'chat',
    data: {
      messageId?: string;
      reportedUserId?: string;
      conversationId?: string;
      reason: string;
      additionalContext?: string;
    }
  ) {
    const report = await this.reportModel.create({
      reporter_id: new Types.ObjectId(reporterId),
      type,
      message_id: data.messageId ? new Types.ObjectId(data.messageId) : undefined,
      reported_user_id: data.reportedUserId ? new Types.ObjectId(data.reportedUserId) : undefined,
      conversation_id: data.conversationId ? new Types.ObjectId(data.conversationId) : undefined,
      reason: data.reason,
      additional_context: data.additionalContext,
      status: 'pending',
      created_at: new Date(),
    });

    return report;
  }

  /**
   * Get all pending reports (for admins)
   */
  async getPendingReports() {
    return this.reportModel
      .find({ status: 'pending' })
      .populate('reporter_id', 'username display_name avatar_url')
      .populate('reported_user_id', 'username display_name avatar_url')
      .populate('message_id')
      .sort({ created_at: -1 })
      .exec();
  }

  /**
   * Update report status
   */
  async updateReportStatus(
    reportId: string,
    reviewerId: string,
    status: 'reviewed' | 'dismissed' | 'actioned',
    notes?: string
  ) {
    return this.reportModel.findByIdAndUpdate(
      reportId,
      {
        status,
        reviewed_by: new Types.ObjectId(reviewerId),
        reviewed_at: new Date(),
        review_notes: notes,
      },
      { new: true }
    ).exec();
  }
}
