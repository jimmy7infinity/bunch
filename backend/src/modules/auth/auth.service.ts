import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
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
        id: (user as any)._id.toString(),
        wallet_address: user.wallet_address,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
      },
    };
  }

  async validateUser(userId: string): Promise<any> {
    return this.usersService.findById(userId);
  }

  // DEV ONLY: Find or create user by username
  async findOrCreateByUsername(username: string): Promise<any> {
    let user = await this.usersService.findByUsername(username);
    
    if (!user) {
      // Create new user with fake wallet address for dev
      const fakeWallet = `0x${username.toLowerCase().padEnd(40, '0')}`;
      user = await this.usersService.findOrCreate(fakeWallet);
      // Update username via service
      user = await this.usersService.updateProfile(
        (user as any)._id.toString(), 
        { display_name: username }
      );
    }
    
    return user;
  }
}

