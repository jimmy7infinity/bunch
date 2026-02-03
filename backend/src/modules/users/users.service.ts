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
    
    // Get high quality Twitter avatar by replacing _normal with _400x400
    const highQualityAvatar = twitterProfile.profile_image_url
      ?.replace('_normal', '_400x400');

    const user = new this.userModel({
      twitter_id: twitterProfile.id,
      twitter_username: twitterProfile.username,
      twitter_avatar: highQualityAvatar,
      username,
      display_name: twitterProfile.name || username,
      avatar_url: highQualityAvatar,
      bio: twitterProfile.description || undefined,
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

  async getUsersByRole(roles: string[]): Promise<User[]> {
    return this.userModel.find({ role: { $in: roles } }).exec();
  }

  async findOrCreateFromTwitter(twitterProfile: any): Promise<User> {
    let user = await this.findByTwitterId(twitterProfile.id);
    
    // If user exists and is deleted, restore their account
    if (user && user.status === 'deleted') {
      console.log('🔄 Restoring deleted Twitter account:', (user as any)._id);
      const highQualityAvatar = twitterProfile.profile_image_url?.replace('_normal', '_400x400');
      
      await this.userModel.findByIdAndUpdate((user as any)._id, {
        status: 'active',
        deleted_at: null,
        display_name: twitterProfile.name || user.username,
        twitter_avatar: highQualityAvatar,
        avatar_url: highQualityAvatar,
        bio: twitterProfile.description || user.bio,
        is_online: true,
        last_seen_at: new Date(),
      }).exec();
      
      console.log('✅ Account restored successfully');
      // Refetch to get updated data
      user = await this.findByTwitterId(twitterProfile.id);
    }
    
    if (!user) {
      // No existing Twitter account found - create new Twitter account
      // Note: We don't try to auto-link to Polymarket accounts here
      // Users should manually verify Polymarket or use wallet connect
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
    updates: { 
      username?: string; 
      display_name?: string; 
      avatar_url?: string; 
      bio?: string;
      settings?: { autoPredictionChat?: boolean };
    },
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

    // If updating settings, merge with existing settings
    if (updates.settings) {
      const user = await this.userModel.findById(userId).exec();
      if (user) {
        updates.settings = { ...user.settings, ...updates.settings };
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

  async findOrCreateByWallet(wallet_address: string): Promise<User> {
    const walletLower = wallet_address.toLowerCase();
    
    // First check if wallet is already linked to an existing account (including deleted)
    let user = await this.userModel.findOne({ 
      wallet_address: walletLower 
    }).exec();
    
    // If user exists and is deleted, restore their account
    if (user && user.status === 'deleted') {
      console.log('🔄 Restoring deleted wallet account:', (user as any)._id);
      
      await this.userModel.findByIdAndUpdate((user as any)._id, {
        status: 'active',
        deleted_at: null,
        is_online: true,
        last_seen_at: new Date(),
        // Don't restore display_name/avatar/bio - let Polymarket auto-verification handle it
      }).exec();
      
      console.log('✅ Account restored successfully');
      // Refetch to get updated data
      user = await this.userModel.findOne({ wallet_address: walletLower }).exec();
      return user!;
    }
    
    if (user) {
      return user;
    }
    
    // Wallet not found - check if this wallet matches a verified Polymarket account
    // This handles the case where user:
    // 1. Logged in with Twitter
    // 2. Verified Polymarket account (which has this wallet)
    // 3. Now trying to log in with wallet
    const polymarketUser = await this.userModel.findOne({
      'polymarket.verified': true,
      'polymarket.wallet_address': walletLower
    }).exec();
    
    if (polymarketUser) {
      // Link the wallet to the existing account, preserving Twitter data
      console.log(`🔗 Linking wallet ${walletLower} to existing account with Polymarket verification`);
      polymarketUser.wallet_address = walletLower;
      polymarketUser.wallet_verified = true;
      // Keep all existing profile data (Twitter username, avatar, bio, etc.)
      await polymarketUser.save();
      return polymarketUser;
    }
    
    // No existing account found - create new wallet-only account
    const username = `user_${wallet_address.slice(2, 10)}`; // Skip 0x prefix
    
    console.log(`🆕 Creating new wallet-only account for ${walletLower}`);
    
    user = new this.userModel({
      wallet_address: walletLower,
      username,
      display_name: username,
      wallet_verified: true,
      is_online: true,
      rank: 'RECRUIT',
      status: 'active',
      role: 'user',
    });
    
    const savedUser = await user.save();
    console.log(`✅ Wallet user created:`, savedUser._id);
    
    return savedUser;
  }

  async linkWalletToAccount(userId: string, walletAddress: string, autoMerge: boolean = false): Promise<User> {
    const walletLower = walletAddress.toLowerCase();
    
    // Check if wallet is already linked to another account
    const existingWalletUser = await this.userModel.findOne({
      wallet_address: walletLower,
      _id: { $ne: userId }
    }).exec();
    
    if (existingWalletUser) {
      if (autoMerge) {
        // Merge accounts: Keep current account, add wallet from other account
        console.log(`🔀 Auto-merging wallet account ${existingWalletUser._id} into ${userId}`);
        
        const currentUser = await this.userModel.findById(userId).exec();
        if (!currentUser) {
          throw new NotFoundException('Current user not found');
        }
        
        // Transfer wallet to current account
        currentUser.wallet_address = walletLower;
        currentUser.wallet_verified = true;
        
        // If current account doesn't have Polymarket but wallet account does, transfer it
        if (existingWalletUser.polymarket?.verified && !currentUser.polymarket?.verified) {
          currentUser.polymarket = existingWalletUser.polymarket;
        }
        
        await currentUser.save();
        
        // TODO: Transfer other data (messages, friends, etc.) from old account to new one
        // For now, just delete the old account
        await this.userModel.findByIdAndDelete(existingWalletUser._id).exec();
        
        console.log('✅ Accounts merged successfully');
        return currentUser;
      } else {
        throw new ConflictException('This wallet is already linked to another account. Set autoMerge=true to merge accounts.');
      }
    }
    
    // Link wallet to current account
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        wallet_address: walletLower,
        wallet_verified: true
      },
      { new: true }
    ).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async linkTwitterToAccount(userId: string, twitterId: string, twitterUsername: string, twitterAvatar: string): Promise<User> {
    // Check if Twitter account is already linked to another user
    const existingTwitterUser = await this.userModel.findOne({
      twitter_id: twitterId,
      _id: { $ne: userId }
    }).exec();
    
    if (existingTwitterUser) {
      throw new ConflictException('This Twitter account is already linked to another account');
    }
    
    // Link Twitter to current account
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        twitter_id: twitterId,
        twitter_username: twitterUsername,
        twitter_avatar: twitterAvatar,
        // Only update avatar if user doesn't have one
        $setOnInsert: { avatar_url: twitterAvatar }
      },
      { new: true }
    ).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async unlinkWalletFromAccount(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Don't allow unlinking if it's the only auth method
    if (!user.twitter_id) {
      throw new BadRequestException('Cannot unlink wallet - it is your only authentication method');
    }
    
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $unset: { wallet_address: 1 },
        wallet_verified: false
      },
      { new: true }
    ).exec();
    
    if (!updatedUser) {
      throw new NotFoundException('Failed to update user');
    }
    
    return updatedUser;
  }

  async unlinkTwitterFromAccount(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Don't allow unlinking if it's the only auth method
    if (!user.wallet_address) {
      throw new BadRequestException('Cannot unlink Twitter - it is your only authentication method');
    }
    
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $unset: {
          twitter_id: 1,
          twitter_username: 1,
          twitter_avatar: 1
        }
      },
      { new: true }
    ).exec();
    
    if (!updatedUser) {
      throw new NotFoundException('Failed to update user');
    }
    
    return updatedUser;
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
        { from_user_id: senderId, to_user_id: receiverId, status: 'pending' },
        { from_user_id: receiverId, to_user_id: senderId, status: 'pending' },
      ],
    }).exec();

    if (existingRequest) {
      throw new ConflictException('Friend request already exists');
    }

    const request = new this.friendRequestModel({
      from_user_id: senderId,
      to_user_id: receiverId,
      status: 'pending',
    });

    const savedRequest = await request.save();

    // Send notification via WebSocket
    try {
      const socketServer = (global as any).socketServer;
      if (socketServer) {
        const sender = await this.findById(senderId);
        socketServer.to(`user:${receiverId}`).emit('notification', {
          type: 'friend_request',
          message: `${sender.display_name || sender.username} sent you a friend request`,
          senderId,
          senderName: sender.display_name || sender.username,
          senderAvatar: sender.avatar_url,
          requestId: savedRequest._id,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to send friend request notification:', error);
    }

    return savedRequest;
  }

  async acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    const request: any = await this.friendRequestModel.findById(requestId).exec();

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.to_user_id.toString() !== userId) {
      throw new BadRequestException('Not authorized to accept this request');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Request already processed');
    }

    // Update request status
    request.status = 'accepted';
    request.responded_at = new Date();
    await request.save();

    // Create friendship (store in sorted order for easy querying)
    const [user1, user2] = [request.from_user_id.toString(), request.to_user_id.toString()].sort();
    await this.friendshipModel.create({
      user1_id: user1,
      user2_id: user2,
    });

    // Send notification to the original sender
    try {
      const socketServer = (global as any).socketServer;
      if (socketServer) {
        const accepter = await this.findById(userId);
        socketServer.to(`user:${request.from_user_id.toString()}`).emit('notification', {
          type: 'friend_request_accepted',
          message: `${accepter.display_name || accepter.username} accepted your friend request`,
          userId: userId,
          userName: accepter.display_name || accepter.username,
          userAvatar: accepter.avatar_url,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to send friend request accepted notification:', error);
    }
  }

  async rejectFriendRequest(requestId: string, userId: string): Promise<void> {
    const request: any = await this.friendRequestModel.findById(requestId).exec();

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.to_user_id.toString() !== userId) {
      throw new BadRequestException('Not authorized to reject this request');
    }

    request.status = 'rejected';
    request.responded_at = new Date();
    await request.save();
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    return this.friendRequestModel
      .find({ to_user_id: userId, status: 'pending' })
      .populate('from_user_id', 'username display_name avatar_url rank')
      .exec();
  }

  async getFriends(userId: string, offset: number = 0, limit: number = 0): Promise<User[] | { friends: User[], totalCount: number, hasMore: boolean }> {
    const friendships = await this.friendshipModel
      .find({
        $or: [{ user1_id: userId }, { user2_id: userId }],
      })
      .exec();

    const friendIds = friendships.map((f) =>
      f.user1_id.toString() === userId ? f.user2_id : f.user1_id,
    );

    // If limit is 0, return all (backward compatibility)
    if (limit === 0) {
      return this.userModel.find({ _id: { $in: friendIds } }).exec();
    }

    // Paginated response
    const friends = await this.userModel
      .find({ _id: { $in: friendIds } })
      .skip(offset)
      .limit(limit)
      .exec();

    const totalCount = friendIds.length;

    return {
      friends,
      totalCount,
      hasMore: offset + friends.length < totalCount,
    };
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const [user1, user2] = [userId, friendId].sort();
    await this.friendshipModel.deleteOne({ user1_id: user1, user2_id: user2 }).exec();
  }

  async deleteAccount(userId: string): Promise<void> {
    console.log('🗑️ Soft deleting account:', userId);
    
    // Soft delete: Mark user as deleted but keep in database
    await this.userModel.findByIdAndUpdate(userId, {
      status: 'deleted',
      deleted_at: new Date(),
      is_online: false,
      // Clear sensitive data but keep for admin reference
      display_name: 'Deleted Account',
      bio: null,
      avatar_url: null,
      // Keep username for message history but mark it
      // Messages will show as from "Deleted Account" in the UI
    }).exec();
    
    // Clean up relationships (friendships, requests, blocks)
    await Promise.all([
      // Delete friendships where user is involved
      this.friendshipModel.deleteMany({
        $or: [{ user1_id: userId }, { user2_id: userId }]
      }).exec(),
      // Delete friend requests
      this.friendRequestModel.deleteMany({
        $or: [{ from_user_id: userId }, { to_user_id: userId }]
      }).exec(),
      // Delete blocks
      this.blockModel.deleteMany({
        $or: [{ blocker_id: userId }, { blocked_id: userId }]
      }).exec(),
    ]);
    
    console.log('✅ Account soft deleted successfully');
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
      .findOne({ from_user_id: otherUserId, to_user_id: userId, status: 'pending' })
      .exec();
    if (receivedRequest) {
      return 'pending';
    }

    const sentRequest = await this.friendRequestModel
      .findOne({ from_user_id: userId, to_user_id: otherUserId, status: 'pending' })
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

  /**
   * Ban a user (admin/mod/creator only)
   */
  async banUser(userId: string, reason: string, permanent: boolean = false): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      status: 'banned',
      banned_reason: reason,
      banned_at: new Date(),
      banned_until: permanent ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days if not permanent
    }).exec();
  }

  /**
   * Unban a user (admin/mod/creator only)
   */
  async unbanUser(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      status: 'active',
      banned_reason: null,
      banned_at: null,
      banned_until: null,
    }).exec();
  }

  /**
   * Grant beta access to a user
   */
  async grantBetaAccess(userId: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { betaAccess: true },
      { new: true }
    ).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}



