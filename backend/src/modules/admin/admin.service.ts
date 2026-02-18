import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Message, MessageDocument } from '../chat/schemas/message.schema';
import { Conversation, ConversationDocument } from '../chat/schemas/conversation.schema';
import { Report, ReportDocument } from '../chat/schemas/report.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getStats() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalUsers, messages24h, reportsCount, bannedUsersCount] = await Promise.all([
      this.userModel.countDocuments(),
      this.messageModel.countDocuments({ created_at: { $gte: yesterday } }),
      this.reportModel.countDocuments({ status: 'pending' }),
      this.userModel.countDocuments({ status: 'banned' }),
    ]);

    return {
      totalUsers,
      messages24h,
      reportsCount,
      bannedUsersCount,
    };
  }

  /**
   * Get all conversations for admin view
   */
  async getAllConversations(limit: number = 100): Promise<any[]> {
    const conversations = await this.conversationModel
      .find({})
      .sort({ last_message_at: -1, created_at: -1 })
      .limit(limit)
      .lean()
      .exec();

    // Get all unique participant IDs from DMs and groups
    const conversationIds = conversations.map(c => c._id);
    const participants = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'conversationparticipants',
          localField: '_id',
          foreignField: 'user_id',
          as: 'participations'
        }
      },
      {
        $unwind: '$participations'
      },
      {
        $match: {
          'participations.conversation_id': { $in: conversationIds }
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          display_name: 1,
          conversation_id: '$participations.conversation_id'
        }
      }
    ]);

    // Group participants by conversation
    const participantsByConv = participants.reduce((acc, p) => {
      const convId = p.conversation_id.toString();
      if (!acc[convId]) acc[convId] = [];
      acc[convId].push(p);
      return acc;
    }, {});

    // Enhance conversations with proper display titles
    return conversations.map(conv => {
      let displayTitle = conv.title;
      const convParticipants = participantsByConv[conv._id.toString()] || [];
      
      // For DMs, show participant names
      if (conv.type === 'dm' && convParticipants.length >= 2) {
        displayTitle = convParticipants
          .map((p: any) => p.display_name || p.username)
          .join(' & ');
      }
      
      // For group chats without title, show participant names
      if (conv.type === 'group' && !displayTitle && convParticipants.length > 0) {
        const names = convParticipants.slice(0, 3).map((p: any) => p.display_name || p.username);
        displayTitle = names.join(', ');
        if (convParticipants.length > 3) {
          displayTitle += ` +${convParticipants.length - 3}`;
        }
      }
      
      // For market chats, use question from metadata if title is missing
      if (conv.type === 'market' && !displayTitle && conv.metadata?.question) {
        displayTitle = conv.metadata.question;
      }
      
      // For global chats without title, use a formatted slug
      if (conv.type === 'global' && !displayTitle && conv.slug) {
        displayTitle = conv.slug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      
      return {
        ...conv,
        displayTitle: displayTitle || conv.slug || `${conv.type} chat`,
        participants: convParticipants
      };
    });
  }

  /**
   * Get recent messages with filters
   */
  async getMessages(filters: {
    limit?: number;
    userId?: string;
    conversationId?: string;
    before?: Date;
  }) {
    const { limit = 50, userId, conversationId, before } = filters;

    const query: any = { deleted: false };
    if (userId) query.sender_id = new Types.ObjectId(userId);
    if (conversationId) query.conversation_id = new Types.ObjectId(conversationId);
    if (before) query.created_at = { $lt: before };

    const messages = await this.messageModel
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .populate('sender_id', 'username display_name avatar_url rank role')
      .populate('conversation_id', 'type title slug market_id')
      .exec();

    return messages;
  }

  /**
   * Get message by ID with full context
   */
  async getMessageById(messageId: string) {
    const message = await this.messageModel
      .findById(messageId)
      .populate('sender_id', 'username display_name avatar_url rank role status')
      .populate('conversation_id', 'type title slug market_id participant_count')
      .exec();

    if (!message) {
      return null;
    }

    // Get surrounding messages for context (5 before and 5 after)
    const messagesBefore = await this.messageModel
      .find({
        conversation_id: message.conversation_id,
        created_at: { $lt: message.created_at },
      })
      .sort({ created_at: -1 })
      .limit(5)
      .populate('sender_id', 'username display_name avatar_url rank role')
      .exec();

    const messagesAfter = await this.messageModel
      .find({
        conversation_id: message.conversation_id,
        created_at: { $gt: message.created_at },
      })
      .sort({ created_at: 1 })
      .limit(5)
      .populate('sender_id', 'username display_name avatar_url rank role')
      .exec();

    const contextMessages = [
      ...messagesBefore.reverse(),
      message,
      ...messagesAfter,
    ];

    return {
      message,
      context: contextMessages,
    };
  }

  /**
   * Get recent media (images and gifs)
   */
  async getMedia(limit = 50) {
    const messages = await this.messageModel
      .find({
        deleted: false,
        $or: [
          { text: { $regex: /\.(jpg|jpeg|png|gif|webp)/i } },
          { text: { $regex: /tenor\.com|giphy\.com/i } },
        ],
      })
      .sort({ created_at: -1 })
      .limit(limit)
      .populate('sender_id', 'username display_name avatar_url')
      .populate('conversation_id', 'type title slug')
      .exec();

    return messages;
  }

  /**
   * Search users
   */
  async searchUsers(query: string, limit = 20) {
    // If no query provided, return all users sorted by creation date
    const filter = query
      ? {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { display_name: { $regex: query, $options: 'i' } },
            { twitter_username: { $regex: query, $options: 'i' } },
          ],
        }
      : {}; // Empty filter returns all users

    const users = await this.userModel
      .find(filter)
      .sort({ created_at: -1 }) // Newest first
      .limit(limit)
      .select('username display_name avatar_url rank role status created_at last_seen_at')
      .exec();

    return users;
  }

  /**
   * Get user details with message count
   */
  async getUserDetails(userId: string, limit: number = 100) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      return null;
    }

    const messageCount = await this.messageModel.countDocuments({
      sender_id: new Types.ObjectId(userId),
      deleted: false,
    });

    const recentMessages = await this.messageModel
      .find({ sender_id: new Types.ObjectId(userId), deleted: false })
      .sort({ created_at: -1 })
      .limit(limit)
      .populate('conversation_id', 'type title slug')
      .exec();

    return {
      user,
      messageCount,
      recentMessages,
    };
  }

  /**
   * Ban user
   */
  async banUser(userId: string, reason: string, permanent: boolean = true) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        status: 'banned',
        banned_at: new Date(),
        banned_reason: reason,
      },
      { new: true }
    ).exec();

    return user;
  }

  /**
   * Mute user (temporary suspension)
   */
  async muteUser(userId: string, durationHours: number) {
    const suspendedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        status: 'suspended',
        suspended_until: suspendedUntil,
      },
      { new: true }
    ).exec();

    return user;
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string) {
    const message = await this.messageModel.findByIdAndUpdate(
      messageId,
      { deleted: true },
      { new: true }
    ).exec();

    return message;
  }

  /**
   * Delete all messages from a user
   */
  async deleteAllUserMessages(userId: string) {
    const result = await this.messageModel.updateMany(
      { sender_id: new Types.ObjectId(userId) },
      { deleted: true }
    ).exec();

    return { deletedCount: result.modifiedCount };
  }

  /**
   * Get all reports
   */
  async getReports(status?: 'pending' | 'reviewed' | 'dismissed' | 'actioned', limit = 50) {
    const query: any = {};
    if (status) query.status = status;

    const reports = await this.reportModel
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .populate('reporter_id', 'username display_name avatar_url')
      .populate('reported_user_id', 'username display_name avatar_url rank role status')
      .populate('message_id')
      .populate('conversation_id', 'type title slug')
      .exec();

    return reports;
  }

  /**
   * Send global announcement to all users
   */
  async sendGlobalAnnouncement(text: string, adminUserId: string) {
    // Find or create the General global chat
    let generalChat = await this.conversationModel.findOne({
      type: 'global',
      slug: 'general',
    }).exec();

    if (!generalChat) {
      generalChat = await this.conversationModel.create({
        type: 'global',
        slug: 'general',
        title: 'General',
      });
    }

    // Create system message
    const message = await this.messageModel.create({
      conversation_id: generalChat._id,
      sender_id: new Types.ObjectId(adminUserId),
      text: `📢 **ANNOUNCEMENT**: ${text}`,
      created_at: new Date(),
    });

    return message;
  }

  /**
   * Send system message to a specific chat room
   */
  async sendSystemMessage(conversationId: string, text: string, adminUserId: string) {
    const message = await this.messageModel.create({
      conversation_id: new Types.ObjectId(conversationId),
      sender_id: new Types.ObjectId(adminUserId),
      text: `🔔 **SYSTEM**: ${text}`,
      created_at: new Date(),
    });

    return message;
  }
}
