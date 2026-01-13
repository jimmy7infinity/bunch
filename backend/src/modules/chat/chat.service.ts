import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash } from 'crypto';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument, ConversationType } from './schemas/conversation.schema';
import { Participant, ParticipantDocument } from './schemas/participant.schema';
import { UserMarketPosition, UserMarketPositionDocument, PositionType } from './schemas/user-market-position.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Participant.name) private participantModel: Model<ParticipantDocument>,
    @InjectModel(UserMarketPosition.name) private userMarketPositionModel: Model<UserMarketPositionDocument>,
  ) {}

  // ==================== CONVERSATION MANAGEMENT ====================

  /**
   * Find or create a market chat for a Polymarket market
   */
  async findOrCreateMarketChat(marketId: string, title: string, metadata?: Record<string, any>) {
    let conversation = await this.conversationModel.findOne({
      type: 'market',
      market_id: marketId,
    }).exec();

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
    }).exec();

    if (!conversation) {
      conversation = new this.conversationModel({
        type: 'dm',
        dm_hash: dmHash,
        is_private: true,
        participant_count: 2,
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
      participant_count: memberIds.length + 1,
    });
    await conversation.save();

    // Add creator as owner
    await this.joinConversation(conversation._id.toString(), creatorId, 'owner');

    // Add members
    for (const memberId of memberIds) {
      await this.joinConversation(conversation._id.toString(), memberId, 'member');
    }

    return conversation;
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

    return participants.map(p => ({
      conversation: p.conversation_id,
      role: p.role,
      last_read_at: p.last_read_at,
      muted: p.muted,
      has_notifications: p.has_notifications,
      is_favorite: p.is_favorite,
    }));
  }

  /**
   * Get all global chats
   */
  async getGlobalChats() {
    return this.conversationModel
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
  }

  /**
   * Get all market chats
   */
  async getMarketChats() {
    return this.conversationModel
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
      .limit(limit)
      .sort({ last_message_at: -1 })
      .exec();
  }

  // ==================== PARTICIPANT MANAGEMENT ====================

  /**
   * Join a conversation
   */
  async joinConversation(conversationId: string, userId: string, role: 'owner' | 'admin' | 'member' = 'member') {
    // Check if already a participant
    const existing = await this.participantModel.findOne({
      conversation_id: new Types.ObjectId(conversationId),
      user_id: new Types.ObjectId(userId),
    }).exec();

    if (existing) {
      return existing;
    }

    const participant = new this.participantModel({
      conversation_id: new Types.ObjectId(conversationId),
      user_id: new Types.ObjectId(userId),
      role,
    });
    await participant.save();

    // Update participant count
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      $inc: { participant_count: 1 },
    }).exec();

    return participant;
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
  async getParticipants(conversationId: string) {
    return this.participantModel
      .find({ conversation_id: new Types.ObjectId(conversationId) })
      .populate('user_id', 'username display_name avatar_url is_online')
      .exec();
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
      .populate('sender_id', 'username display_name avatar_url rank')
      .populate('reply_to', 'text sender_id')
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
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string): Promise<any> {
    const message = await this.messageModel
      .findOneAndUpdate(
        { _id: messageId, sender_id: new Types.ObjectId(userId) }, // Convert userId to ObjectId
        { deleted: true },
        { new: true }
      )
      .exec();
    
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
}
