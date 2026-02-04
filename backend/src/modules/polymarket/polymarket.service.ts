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

    // Fetch and verify Polymarket profile with retry logic
    // Polymarket updates can take a few seconds to propagate
    const maxRetries = 5;
    const retryDelays = [0, 2000, 4000, 6000, 8000]; // 0s, 2s, 4s, 6s, 8s (total ~20s max)
    
    let profileData;
    let tokenFound = false;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${maxRetries - 1} - waiting ${retryDelays[attempt]}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
      }
      
      try {
        profileData = await this.fetchPolymarketProfile(polymarketUsername);
        
        console.log(`Attempt ${attempt + 1}: Looking for token:`, tokenToUse);
        
        // Extract what tokens ARE in the HTML
        const tokenRegex = /PB-VERIFY-[a-f0-9]{24}-[a-f0-9]{16}/g;
        const foundTokens = profileData.html?.match(tokenRegex);
        console.log(`Attempt ${attempt + 1}: Tokens found in HTML:`, foundTokens);
        
        // Check if the correct token exists
        if (profileData.html && profileData.html.includes(tokenToUse!)) {
          console.log(`✓ Token found on attempt ${attempt + 1}!`);
          tokenFound = true;
          break;
        }
        
        console.log(`✗ Token not found on attempt ${attempt + 1}`);
        
        // If this is the last attempt, we'll fail
        if (attempt === maxRetries - 1) {
          if (foundTokens && foundTokens.length > 0) {
            return {
              success: false,
              message: `Found an old verification token. Please update your Polymarket bio with the current token and try again.`,
            };
          } else {
            return {
              success: false,
              message: 'Verification token not found in Polymarket profile. Please add it to your bio and try again.',
            };
          }
        }
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        if (attempt === maxRetries - 1) {
          throw error;
        }
      }
    }
    
    if (!tokenFound) {
      return {
        success: false,
        message: 'Verification token not found after multiple attempts. Please ensure the token is in your bio.',
      };
    }

    // Mark as verified (profileData should be defined if we got here)
    if (!profileData) {
      throw new BadRequestException('Verification failed - no profile data');
    }
    
    // SECURITY CHECK: If user already has a wallet connected, ensure Polymarket wallet matches
    if (user.wallet_address && user.wallet_address !== profileData.walletAddress?.toLowerCase()) {
      console.log('⚠️ Wallet mismatch detected!');
      console.log('User wallet:', user.wallet_address);
      console.log('Polymarket wallet:', profileData.walletAddress);
      
      return {
        success: false,
        message: `This Polymarket account is linked to a different wallet address (${profileData.walletAddress?.slice(0, 6)}...${profileData.walletAddress?.slice(-4)}). Your connected wallet is ${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}. Please verify the Polymarket account that matches your connected wallet.`,
      };
    }
    
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
  }

  /**
   * Fetch user's positions from Polymarket Data API
   */
  async getUserPositions(walletAddress: string, marketId?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        user: walletAddress,
        sizeThreshold: '0.01', // Minimum position size
        limit: '100',
        sortBy: 'TOKENS',
        sortDirection: 'DESC',
      });

      // If specific market requested, add condition ID
      if (marketId) {
        params.append('market', marketId);
      }

      const response = await fetch(`https://data-api.polymarket.com/positions?${params.toString()}`);
      
      if (!response.ok) {
        console.error('Failed to fetch positions:', response.status);
        return [];
      }

      const positions = await response.json();
      console.log(`Found ${positions.length} positions for wallet ${walletAddress}`);
      
      return positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  /**
   * Get user's position for a specific market
   */
  async getMarketPosition(userId: string, marketId: string): Promise<{ outcome: string | null; size: number }> {
    try {
      console.log('🔍 Getting market position for user:', userId, 'marketId:', marketId);
      
      // Get user to find wallet address
      const user = await this.userModel.findById(userId);
      console.log('User found:', !!user, 'Has Polymarket wallet:', !!user?.polymarket?.wallet_address);
      
      if (!user || !user.polymarket?.wallet_address) {
        console.log('❌ No Polymarket wallet address found for user');
        return { outcome: null, size: 0 };
      }

      // Check if marketId is an event slug (doesn't start with 0x) vs a conditionId
      const isEventSlug = !marketId.startsWith('0x');
      
      if (isEventSlug) {
        console.log('📍 Detected event slug, fetching all markets within event:', marketId);
        
        try {
          // Fetch the event from Gamma API to get all constituent markets
          const eventResponse = await fetch(`https://gamma-api.polymarket.com/events?slug=${marketId}`);
          if (!eventResponse.ok) {
            console.error('❌ Failed to fetch event from Gamma API:', eventResponse.status);
            return { outcome: null, size: 0 };
          }
          
          const events = await eventResponse.json();
          if (!events || events.length === 0) {
            console.log('❌ Event not found:', marketId);
            return { outcome: null, size: 0 };
          }
          
          const event = events[0];
          const markets = event.markets || [];
          console.log(`📊 Found ${markets.length} markets within event`);
          
          // Check user's positions across all markets in this event
          let largestPosition: any = null;
          
          for (const market of markets) {
            const conditionId = market.conditionId;
            console.log(`  Checking market: ${market.question.slice(0, 50)}... (${conditionId.slice(0, 10)}...)`);
            
            const positions = await this.getUserPositions(user.polymarket.wallet_address, conditionId);
            
            if (positions.length > 0) {
              // Find largest position in this market
              const marketLargestPos = positions.reduce((max, pos) => 
                pos.size > max.size ? pos : max
              , positions[0]);
              
              // Update overall largest if this one is bigger
              if (!largestPosition || marketLargestPos.size > largestPosition.size) {
                largestPosition = marketLargestPos;
              }
            }
          }
          
          if (!largestPosition) {
            console.log('❌ No positions found in any market within this event');
            return { outcome: null, size: 0 };
          }
          
          console.log('✅ Largest position found:', {
            outcome: largestPosition.outcome,
            size: largestPosition.size,
            title: largestPosition.title
          });
          
          return {
            outcome: largestPosition.outcome,
            size: largestPosition.size,
          };
        } catch (fetchError) {
          console.error('❌ Error fetching event markets:', fetchError);
          return { outcome: null, size: 0 };
        }
      }

      // Direct conditionId - query normally
      console.log('📡 Fetching positions for wallet:', user.polymarket.wallet_address, 'conditionId:', marketId);
      const positions = await this.getUserPositions(user.polymarket.wallet_address, marketId);
      console.log('📊 Found positions:', positions.length);
      
      if (positions.length > 0) {
        console.log('Position details:', positions.map(p => ({
          outcome: p.outcome,
          size: p.size,
          title: p.title,
          conditionId: p.conditionId
        })));
      }
      
      // Find the position with the largest size for this market
      if (positions.length === 0) {
        console.log('❌ No positions found for this market');
        return { outcome: null, size: 0 };
      }

      // User might have positions on both outcomes, return the larger one
      const largestPosition = positions.reduce((max, pos) => 
        pos.size > max.size ? pos : max
      , positions[0]);

      console.log('✅ Largest position:', {
        outcome: largestPosition.outcome,
        size: largestPosition.size,
        title: largestPosition.title
      });

      return {
        outcome: largestPosition.outcome, // "Yes" or "No"
        size: largestPosition.size,
      };
    } catch (error) {
      console.error('❌ Error getting market position:', error);
      return { outcome: null, size: 0 };
    }
  }

  /**
   * Fetch Polymarket profile data (server-side)
   * Returns full HTML to search for verification token
   */
  private async fetchPolymarketProfile(
    username: string,
  ): Promise<{ html: string; bio?: string; walletAddress?: string }> {
    // TODO: Implement actual Polymarket profile fetching
    // Options:
    // 1. Use Polymarket API if available
    // 2. Scrape profile page (https://polymarket.com/@username)
    // 3. Use CLOB API to get user data
    
    // For now, using a mock implementation
    // In production, this would make an HTTP request to Polymarket
    
    try {
      // Strip @ prefix if user included it
      const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
      
      console.log('Fetching Polymarket profile for:', cleanUsername);
      
      // Fetch the profile page HTML with cache-busting and proper headers
      const response = await fetch(`https://polymarket.com/@${cleanUsername}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (compatible; Bunch/1.0)',
        },
        cache: 'no-store', // Disable caching
      });
      
      if (!response.ok) {
        console.log('Profile fetch failed:', response.status, response.statusText);
        throw new Error(`Profile not found for username: ${cleanUsername}`);
      }

      const html = await response.text();
      console.log('Fetched HTML length:', html.length);
      
      // Extract wallet address if visible in the HTML
      const walletMatch = html.match(/0x[a-fA-F0-9]{40}/);
      const walletAddress = walletMatch ? walletMatch[0] : undefined;
      
      if (walletAddress) {
        console.log('Found wallet address:', walletAddress);
      }

      // Return the full HTML for token verification
      // Token can be anywhere in the profile (bio, description, etc.)
      return { 
        html,
        walletAddress,
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw new Error(`Unable to fetch Polymarket profile for ${username}: ${error.message}`);
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

  /**
   * Fetch Polymarket profile data by wallet address
   * Used for auto-verification during wallet login
   */
  async fetchProfileByWallet(walletAddress: string): Promise<{
    username?: string;
    bio?: string;
    avatarUrl?: string;
    walletAddress: string;
    xUsername?: string;
  } | null> {
    try {
      console.log('🔍 Fetching Polymarket profile for wallet:', walletAddress);
      
      // Use Polymarket Gamma API to fetch user profile
      // Endpoint: GET https://gamma-api.polymarket.com/public-profile?address=<wallet>
      const url = `https://gamma-api.polymarket.com/public-profile?address=${walletAddress.toLowerCase()}`;
      console.log('📡 Fetching from Gamma API:', url);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Bunch/1.0)',
        },
      });
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        console.log('❌ Gamma API profile not found for wallet:', walletAddress, 'Status:', response.status);
        return null;
      }
      
      const data = await response.json();
      console.log('✅ Found Polymarket profile data:', JSON.stringify(data, null, 2));
      
      // Gamma API returns:
      // - name: user-chosen display name
      // - pseudonym: auto-generated pseudonym
      // - profileImage: URL to profile image
      // - bio: profile bio
      // - xUsername: Twitter username (if linked)
      const username = data.name || data.pseudonym;
      
      console.log('Profile summary:', {
        name: data.name,
        pseudonym: data.pseudonym,
        username: username,
        xUsername: data.xUsername,
        hasAvatar: !!data.profileImage,
        hasBio: !!data.bio,
        avatarUrl: data.profileImage,
        bio: data.bio,
      });
      
      return {
        username: username || undefined,
        bio: data.bio || undefined,
        avatarUrl: data.profileImage || undefined,
        xUsername: data.xUsername || undefined,
        walletAddress: walletAddress.toLowerCase(),
      };
    } catch (error) {
      console.error('❌ Error fetching Polymarket profile:', error);
      return null;
    }
  }

  /**
   * Auto-verify and populate user profile from Polymarket
   * Called during wallet login if user has a Polymarket account
   */
  async autoVerifyFromWallet(userId: string, walletAddress: string): Promise<boolean> {
    try {
      console.log('🔄 Auto-verifying Polymarket account for user:', userId);
      
      const profile = await this.fetchProfileByWallet(walletAddress);
      
      if (!profile || !profile.username) {
        console.log('❌ No Polymarket profile found for wallet');
        return false;
      }
      
      console.log('✅ Found Polymarket profile, updating user:', profile.username);
      
      // Update user with Polymarket data
      const updateData: any = {
        'polymarket.verified': true,
        'polymarket.username': profile.username,
        'polymarket.wallet_address': walletAddress.toLowerCase(),
        'polymarket.verified_at': new Date(),
        'polymarket.verification_token': null,
      };
      
      // Also update display info if user doesn't have it yet
      const user = await this.userModel.findById(userId);
      if (user) {
        // Update display_name if it's just the default wallet username (user_<hexchars>)
        if (!user.display_name || user.display_name.startsWith('user_')) {
          updateData.display_name = profile.username;
          console.log('Updating display_name to:', profile.username);
        }
        
        // Update username if it's just the default wallet username (user_<hexchars>)
        if (!user.username || user.username.startsWith('user_')) {
          const sanitizedUsername = profile.username.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          updateData.username = sanitizedUsername;
          console.log('Updating username to:', sanitizedUsername);
        }
        
        // Update avatar if they don't have one and Polymarket has one
        if (!user.avatar_url && profile.avatarUrl) {
          updateData.avatar_url = profile.avatarUrl;
          console.log('Updating avatar_url to:', profile.avatarUrl);
        }
        
        // Update bio if they don't have one
        if (!user.bio && profile.bio) {
          updateData.bio = profile.bio;
          console.log('Updating bio to:', profile.bio);
        }
      }
      
      await this.userModel.findByIdAndUpdate(userId, updateData);
      
      console.log('✅ User auto-verified and updated with Polymarket data');
      return true;
    } catch (error) {
      console.error('❌ Auto-verification failed:', error);
      return false;
    }
  }
}
