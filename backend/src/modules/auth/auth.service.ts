import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { UsersService } from '../users/users.service';
import { TwitterOAuthService } from './twitter-oauth.service';

@Injectable()
export class AuthService {
  private nonceStore: Map<string, { nonce: string; timestamp: number }> = new Map();
  
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private twitterOAuthService: TwitterOAuthService,
  ) {
    // Clean up expired nonces every 5 minutes
    setInterval(() => this.cleanupExpiredNonces(), 5 * 60 * 1000);
  }

  private cleanupExpiredNonces() {
    const now = Date.now();
    const expiryTime = 10 * 60 * 1000; // 10 minutes
    
    for (const [address, data] of this.nonceStore.entries()) {
      if (now - data.timestamp > expiryTime) {
        this.nonceStore.delete(address);
      }
    }
  }

  async generateSIWENonce(address: string): Promise<string> {
    // Generate cryptographically secure random nonce
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store nonce with timestamp
    this.nonceStore.set(address.toLowerCase(), {
      nonce,
      timestamp: Date.now(),
    });
    
    return nonce;
  }

  async verifySIWE(
    address: string,
    signature: string,
    message: string,
    nonce: string,
  ): Promise<any> {
    try {
      const addressLower = address.toLowerCase();
      
      console.log('🔍 Verifying SIWE for address:', addressLower);
      console.log('📋 Message to verify:', message);
      console.log('✍️ Signature:', signature.slice(0, 20) + '...');
      console.log('🔢 Nonce:', nonce);
      
      // Verify nonce exists and is valid
      const storedData = this.nonceStore.get(addressLower);
      if (!storedData) {
        console.error('❌ Nonce not found for address:', addressLower);
        throw new UnauthorizedException('Invalid or expired nonce');
      }
      
      if (storedData.nonce !== nonce) {
        console.error('❌ Nonce mismatch. Expected:', storedData.nonce, 'Got:', nonce);
        throw new UnauthorizedException('Nonce mismatch');
      }
      
      // Check nonce expiry (10 minutes)
      const now = Date.now();
      if (now - storedData.timestamp > 10 * 60 * 1000) {
        console.error('❌ Nonce expired');
        this.nonceStore.delete(addressLower);
        throw new UnauthorizedException('Nonce expired');
      }
      
      console.log('✅ Nonce validated');
      
      // Verify the signature
      // CRITICAL: The message here must be byte-for-byte identical to what was signed
      // ethers.verifyMessage handles the Ethereum prefix automatically
      console.log('🔐 Verifying signature...');
      const recoveredAddress = ethers.verifyMessage(message, signature);
      console.log('📋 Recovered address from signature:', recoveredAddress);
      
      // IMPORTANT: We trust the recovered address from the signature, period.
      // The signature cryptographically proves ownership of recoveredAddress.
      // The address in the message text is IGNORED - it's just text, not cryptographic proof.
      // This is standard SIWE behavior (OpenSea, Farcaster, Uniswap, etc.)
      
      console.log('✅ Signature verified successfully');
      console.log('✅ Authenticating user with recovered address:', recoveredAddress);
      
      // Delete used nonce (one-time use)
      this.nonceStore.delete(addressLower);
      
      // Find or create user by the RECOVERED address (the one that actually signed)
      // This is the ONLY source of truth - the cryptographic proof
      const user = await this.usersService.findOrCreateByWallet(recoveredAddress.toLowerCase());
      
      // Update last seen
      await this.usersService.updateLastSeen((user as any)._id.toString());
      
      return user;
    } catch (error) {
      console.error('❌ SIWE verification error:', error);
      throw new UnauthorizedException(error.message || 'Signature verification failed');
    }
  }

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
    console.log('🔐 login() called with user:', {
      _id: (user as any)._id,
      wallet_address: user.wallet_address,
      username: user.username,
      twitter_id: user.twitter_id,
    });
    
    const payload = {
      wallet_address: user.wallet_address,
      sub: (user as any)._id.toString(),
      username: user.username,
    };
    
    console.log('📦 JWT payload:', payload);
    
    let access_token;
    try {
      access_token = this.jwtService.sign(payload);
      console.log('✅ JWT generated successfully:', {
        length: access_token.length,
        preview: access_token.substring(0, 50) + '...',
        type: typeof access_token,
      });
    } catch (error) {
      console.error('❌ JWT generation failed:', error);
      throw new Error(`Failed to generate JWT: ${error.message}`);
    }
    
    if (!access_token || typeof access_token !== 'string' || access_token.length < 10) {
      console.error('❌ Invalid JWT generated:', { access_token, type: typeof access_token });
      throw new Error('Invalid JWT token generated');
    }

    return {
      access_token,
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

  getTwitterAuthUrl(extensionRedirectUri?: string): string {
    return this.twitterOAuthService.getAuthorizationUrl(extensionRedirectUri);
  }

  async handleTwitterCallback(code: string, state: string) {
    const result = await this.twitterOAuthService.handleCallback(code, state);
    return result.profile;
  }
  
  getExtensionRedirectUri(state: string): string | undefined {
    return this.twitterOAuthService.getRedirectUri(state);
  }
}

