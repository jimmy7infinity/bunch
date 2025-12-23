import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createFromTwitter(twitterProfile: any): Promise<User> {
    const username = twitterProfile.username || `user_${twitterProfile.id}`;

    const user = new this.userModel({
      twitter_id: twitterProfile.id,
      twitter_username: twitterProfile.username,
      twitter_avatar: twitterProfile.profile_image_url,
      username,
      display_name: twitterProfile.name || username,
      avatar_url: twitterProfile.profile_image_url,
    });

    return user.save();
  }

  async findByTwitterId(twitter_id: string): Promise<User | null> {
    return this.userModel.findOne({ twitter_id }).exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOrCreateFromTwitter(twitterProfile: any): Promise<User> {
    let user = await this.findByTwitterId(twitterProfile.id);
    
    if (!user) {
      user = await this.createFromTwitter(twitterProfile);
    }

    return user;
  }

  async updateWalletAddress(userId: string, walletAddress: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { wallet_address: walletAddress.toLowerCase(), wallet_verified: true },
        { new: true }
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateLastSeen(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        last_seen_at: new Date(),
        is_online: true,
      })
      .exec();
  }

  async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        is_online: isOnline,
        ...(isOnline ? {} : { last_seen_at: new Date() }),
      })
      .exec();
  }

  async getOnlineCount(): Promise<number> {
    return this.userModel.countDocuments({ is_online: true }).exec();
  }

  async updateProfile(
    userId: string,
    updates: { display_name?: string; avatar_url?: string },
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updates, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}



