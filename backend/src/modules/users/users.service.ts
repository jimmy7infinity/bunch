import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(wallet_address: string): Promise<User> {
    // Generate username from wallet address
    const username = `user_${wallet_address.slice(2, 10).toLowerCase()}`;

    const user = new this.userModel({
      wallet_address: wallet_address.toLowerCase(),
      username,
      display_name: username,
    });

    return user.save();
  }

  async findByWalletAddress(wallet_address: string): Promise<User | null> {
    return this.userModel
      .findOne({ wallet_address: wallet_address.toLowerCase() })
      .exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOrCreate(wallet_address: string): Promise<User> {
    let user = await this.findByWalletAddress(wallet_address);
    
    if (!user) {
      user = await this.create(wallet_address);
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

