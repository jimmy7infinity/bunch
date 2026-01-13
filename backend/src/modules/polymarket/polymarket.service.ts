import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as crypto from 'crypto';

@Injectable()
export class PolymarketService {
  private readonly TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
  private readonly verificationTokens = new Map<string, { token: string; createdAt: Date }>();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Generate a unique verification token for a user
   */
  async startVerification(userId: string): Promise<{ token: string }> {
    // Generate unique token
    const randomPart = crypto.randomBytes(8).toString('hex');
    const token = `PB-VERIFY-${userId}-${randomPart}`;

    // Store token with expiry
    this.verificationTokens.set(userId, {
      token,
      createdAt: new Date(),
    });

    // Also store in user document
    await this.userModel.findByIdAndUpdate(userId, {
      'polymarket.verification_token': token,
    });

    return { token };
  }

  /**
   * Confirm verification by checking Polymarket profile bio
   */
  async confirmVerification(
    userId: string,
    polymarketUsername: string,
  ): Promise<{ success: boolean; message: string; username?: string; wallet_address?: string }> {
    console.log('=== confirmVerification Service ===');
    console.log('userId:', userId);
    console.log('polymarketUsername:', polymarketUsername);
    
    // Get user
    const user = await this.userModel.findById(userId);
    if (!user) {
      console.log('ERROR: User not found');
      throw new NotFoundException('User not found');
    }
    
    console.log('User found:', user._id);
    console.log('User polymarket data:', user.polymarket);

    // Check if already verified
    if (user.polymarket?.verified) {
      return {
        success: false,
        message: 'Already verified',
        username: user.polymarket.username,
      };
    }

    // Get token from database (primary source) or fallback to memory
    const dbToken = user.polymarket?.verification_token;
    const memoryToken = this.verificationTokens.get(userId);
    
    console.log('dbToken:', dbToken);
    console.log('memoryToken:', memoryToken);
    
    if (!dbToken && !memoryToken) {
      console.log('ERROR: No token found in DB or memory');
      throw new BadRequestException('No verification token found. Please start verification first.');
    }

    const tokenToUse = dbToken || memoryToken?.token;
    
    // For expiry check, we can't rely on memory after restart, so we skip expiry if only DB token exists
    if (memoryToken) {
      const now = new Date();
      const elapsed = now.getTime() - memoryToken.createdAt.getTime();
      if (elapsed > this.TOKEN_EXPIRY_MS) {
        this.verificationTokens.delete(userId);
        await this.userModel.findByIdAndUpdate(userId, {
          'polymarket.verification_token': null,
        });
        throw new BadRequestException('Verification token expired. Please start verification again.');
      }
    }

    // Fetch and verify Polymarket profile
    try {
      const profileData = await this.fetchPolymarketProfile(polymarketUsername);
      
      // Check if token exists in bio
      if (!profileData.bio || !profileData.bio.includes(tokenToUse!)) {
        return {
          success: false,
          message: 'Verification token not found in Polymarket bio. Please add it and try again.',
        };
      }

      // Mark as verified
      await this.userModel.findByIdAndUpdate(userId, {
        'polymarket.verified': true,
        'polymarket.username': polymarketUsername,
        'polymarket.wallet_address': profileData.walletAddress,
        'polymarket.verified_at': new Date(),
        'polymarket.verification_token': null, // Clear token
      });

      // Clear from memory
      this.verificationTokens.delete(userId);

      return {
        success: true,
        message: 'Polymarket account verified successfully!',
        username: polymarketUsername,
        wallet_address: profileData.walletAddress,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to verify Polymarket profile: ${error.message}`);
    }
  }

  /**
   * Fetch Polymarket profile data (server-side)
   * This is a placeholder - actual implementation depends on Polymarket's API/website structure
   */
  private async fetchPolymarketProfile(
    username: string,
  ): Promise<{ bio: string; walletAddress?: string }> {
    // TODO: Implement actual Polymarket profile fetching
    // Options:
    // 1. Use Polymarket API if available
    // 2. Scrape profile page (https://polymarket.com/profile/{username})
    // 3. Use CLOB API to get user data
    
    // For now, using a mock implementation
    // In production, this would make an HTTP request to Polymarket
    
    try {
      // Example: Using fetch to get profile page
      const response = await fetch(`https://polymarket.com/profile/${username}`);
      
      if (!response.ok) {
        throw new Error(`Profile not found: ${username}`);
      }

      const html = await response.text();
      
      // Parse bio from HTML (this is a simplified example)
      // In reality, you'd need proper HTML parsing or use Polymarket's API
      const bioMatch = html.match(/<meta name="description" content="([^"]*)"/) || 
                      html.match(/<div class="bio[^>]*>([^<]*)</);
      const bio = bioMatch ? bioMatch[1] : '';

      // Extract wallet address if publicly visible
      const walletMatch = html.match(/0x[a-fA-F0-9]{40}/);
      const walletAddress = walletMatch ? walletMatch[0] : undefined;

      return { bio, walletAddress };
    } catch (error) {
      // If fetch fails, throw error
      throw new Error(`Unable to fetch Polymarket profile for ${username}`);
    }
  }

  /**
   * Get verification status for a user
   */
  async getVerificationStatus(userId: string): Promise<{
    verified: boolean;
    username?: string;
    wallet_address?: string;
    has_pending_token: boolean;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      verified: user.polymarket?.verified || false,
      username: user.polymarket?.username,
      wallet_address: user.polymarket?.wallet_address,
      has_pending_token: !!user.polymarket?.verification_token,
    };
  }
}
