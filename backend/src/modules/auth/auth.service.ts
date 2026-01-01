import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { UsersService } from '../users/users.service';
import { TwitterOAuthService } from './twitter-oauth.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private twitterOAuthService: TwitterOAuthService,
  ) {}

  async validateWalletSignature(
    wallet_address: string,
    signature: string,
    message: string,
  ): Promise<any> {
    try {
      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      // Check if recovered address matches provided address
      if (recoveredAddress.toLowerCase() !== wallet_address.toLowerCase()) {
        throw new UnauthorizedException('Invalid signature');
      }

      // Find or create user
      const user = await this.usersService.findOrCreate(wallet_address);

      // Update last seen
      await this.usersService.updateLastSeen((user as any)._id.toString());

      return user;
    } catch (error) {
      throw new UnauthorizedException('Signature verification failed');
    }
  }

  async login(user: any) {
    const payload = {
      wallet_address: user.wallet_address,
      sub: (user as any)._id.toString(),
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: (user as any)._id.toString(),
        id: (user as any)._id.toString(),
        wallet_address: user.wallet_address,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        rank: user.rank || 'RECRUIT',
        is_online: user.is_online,
      },
    };
  }

  async validateUser(userId: string): Promise<any> {
    return this.usersService.findById(userId);
  }

  // DEV ONLY: Find or create user by username
  async findOrCreateByUsername(username: string): Promise<any> {
    try {
    let user = await this.usersService.findByUsername(username);
    
    if (!user) {
      // Create new user with fake wallet address for dev
      const fakeWallet = `0x${username.toLowerCase().padEnd(40, '0')}`;
        user = await this.usersService.createDevUser(username, fakeWallet);
    }
    
    return user;
    } catch (error) {
      console.error('Error in findOrCreateByUsername:', error);
      throw error;
    }
  }

  // Twitter OAuth: Find or create user from Twitter profile
  async findOrCreateFromTwitter(twitterProfile: any): Promise<any> {
    return this.usersService.findOrCreateFromTwitter(twitterProfile);
  }

  getTwitterAuthUrl(): string {
    return this.twitterOAuthService.getAuthorizationUrl();
  }

  async handleTwitterCallback(code: string, state: string) {
    const result = await this.twitterOAuthService.handleCallback(code, state);
    return result.profile;
  }
}

