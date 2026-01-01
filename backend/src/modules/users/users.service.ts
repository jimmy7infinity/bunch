import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { FriendRequest, FriendRequestDocument } from './schemas/friend-request.schema';
import { Friendship, FriendshipDocument } from './schemas/friendship.schema';
import { Block, BlockDocument } from './schemas/block.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequestDocument>,
    @InjectModel(Friendship.name) private friendshipModel: Model<FriendshipDocument>,
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
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
      is_online: true,
      last_seen_at: new Date(),
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
    updates: { username?: string; display_name?: string; avatar_url?: string; bio?: string },
  ): Promise<User> {
    // If username is being updated, check if it's already taken
    if (updates.username) {
      const existingUser = await this.userModel.findOne({ 
        username: updates.username,
        _id: { $ne: userId } // Exclude current user
      }).exec();
      
      if (existingUser) {
        throw new Error('Username already taken');
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, updates, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async checkUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const query: any = { username };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    const user = await this.userModel.findOne(query).exec();
    return !user; // true if available, false if taken
  }

  async findOrCreate(wallet_address: string): Promise<User> {
    let user = await this.userModel.findOne({ 
      wallet_address: wallet_address.toLowerCase() 
    }).exec();
    
    if (!user) {
      const username = `user_${wallet_address.slice(0, 8)}`;
      user = new this.userModel({
        wallet_address: wallet_address.toLowerCase(),
        username,
        display_name: username,
        wallet_verified: true,
      });
      await user.save();
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async createDevUser(username: string, walletAddress: string): Promise<User> {
    const user = new this.userModel({
      wallet_address: walletAddress.toLowerCase(),
      username: username,
      display_name: username,
      wallet_verified: true,
      is_online: true,
      twitter_id: `dev_${username}_${Date.now()}`, // Unique twitter_id for dev users
    });
    
    return user.save();
  }

  // ============= FRIEND REQUEST METHODS =============

  async sendFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest> {
    // Check if users are already friends
    const existingFriendship = await this.areFriends(senderId, receiverId);
    if (existingFriendship) {
      throw new ConflictException('Already friends');
    }

    // Check if there's already a pending request
    const existingRequest = await this.friendRequestModel.findOne({
      $or: [
        { sender_id: senderId, receiver_id: receiverId, status: 'pending' },
        { sender_id: receiverId, receiver_id: senderId, status: 'pending' },
      ],
    }).exec();

    if (existingRequest) {
      throw new ConflictException('Friend request already exists');
    }

    const request = new this.friendRequestModel({
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
    });

    return request.save();
  }

  async acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    const request: any = await this.friendRequestModel.findById(requestId).exec();
    
    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.receiver_id.toString() !== userId) {
      throw new BadRequestException('Not authorized to accept this request');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Request already processed');
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Create friendship (store in sorted order for easy querying)
    const [user1, user2] = [request.sender_id.toString(), request.receiver_id.toString()].sort();
    await this.friendshipModel.create({
      user1_id: user1,
      user2_id: user2,
    });
  }

  async rejectFriendRequest(requestId: string, userId: string): Promise<void> {
    const request: any = await this.friendRequestModel.findById(requestId).exec();
    
    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.receiver_id.toString() !== userId) {
      throw new BadRequestException('Not authorized to reject this request');
    }

    request.status = 'rejected';
    await request.save();
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    return this.friendRequestModel
      .find({ receiver_id: userId, status: 'pending' })
      .populate('sender_id', 'username display_name avatar_url rank')
      .exec();
  }

  async getFriends(userId: string): Promise<User[]> {
    const friendships = await this.friendshipModel
      .find({
        $or: [{ user1_id: userId }, { user2_id: userId }],
      })
      .exec();

    const friendIds = friendships.map((f) =>
      f.user1_id.toString() === userId ? f.user2_id : f.user1_id,
    );

    return this.userModel.find({ _id: { $in: friendIds } }).exec();
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const [user1, user2] = [userId, friendId].sort();
    await this.friendshipModel.deleteOne({ user1_id: user1, user2_id: user2 }).exec();
  }

  async areFriends(user1Id: string, user2Id: string): Promise<boolean> {
    const [user1, user2] = [user1Id, user2Id].sort();
    const friendship = await this.friendshipModel
      .findOne({ user1_id: user1, user2_id: user2 })
      .exec();
    return !!friendship;
  }

  async getFriendshipStatus(
    userId: string,
    otherUserId: string,
  ): Promise<'friends' | 'pending' | 'request_sent' | 'not_friends' | 'blocked'> {
    // Check if blocked
    const blocked = await this.isBlocked(userId, otherUserId);
    if (blocked) {
      return 'blocked';
    }

    // Check if friends
    const friends = await this.areFriends(userId, otherUserId);
    if (friends) {
      return 'friends';
    }

    // Check for pending request
    const receivedRequest = await this.friendRequestModel
      .findOne({ sender_id: otherUserId, receiver_id: userId, status: 'pending' })
      .exec();
    if (receivedRequest) {
      return 'pending';
    }

    const sentRequest = await this.friendRequestModel
      .findOne({ sender_id: userId, receiver_id: otherUserId, status: 'pending' })
      .exec();
    if (sentRequest) {
      return 'request_sent';
    }

    return 'not_friends';
  }

  // ============= BLOCK METHODS =============

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    // Remove friendship if exists
    await this.removeFriend(blockerId, blockedId);

    // Create block
    try {
      await this.blockModel.create({
        blocker_id: blockerId,
        blocked_id: blockedId,
      });
    } catch (error) {
      // Ignore if already blocked (duplicate key error)
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await this.blockModel.deleteOne({ blocker_id: blockerId, blocked_id: blockedId }).exec();
  }

  async getBlockedUsers(userId: string): Promise<User[]> {
    const blocks = await this.blockModel.find({ blocker_id: userId }).exec();
    const blockedIds = blocks.map((b) => b.blocked_id);
    return this.userModel.find({ _id: { $in: blockedIds } }).exec();
  }

  async isBlocked(user1Id: string, user2Id: string): Promise<boolean> {
    const block = await this.blockModel
      .findOne({
        $or: [
          { blocker_id: user1Id, blocked_id: user2Id },
          { blocker_id: user2Id, blocked_id: user1Id },
        ],
      })
      .exec();
    return !!block;
  }
}



