import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(senderId: string, text: string): Promise<Message> {
    const message = new this.messageModel({
      sender_id: new Types.ObjectId(senderId),
      text,
    });

    return message.save();
  }

  async getMessages(limit: number = 50, before?: Date): Promise<Message[]> {
    const query = before ? { created_at: { $lt: before } } : {};

    return this.messageModel
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .populate('sender_id', 'username display_name avatar_url')
      .exec();
  }

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<Message> {
    const message = await this.messageModel.findById(messageId).exec();

    if (!message) {
      throw new Error('Message not found');
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

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    await this.messageModel
      .findOneAndUpdate(
        { _id: messageId, sender_id: userId },
        { deleted: true },
      )
      .exec();
  }
}



