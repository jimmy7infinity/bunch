import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException, Req, Res, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WalletLoginDto } from './dto/wallet-login.dto';
import { ActivateBetaDto } from '../invite-codes/dto/activate-beta.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { join } from 'path';
import { InviteCodesService } from '../invite-codes/invite-codes.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private inviteCodesService: InviteCodesService,
    private usersService: UsersService,
  ) {}

  // Wallet auth page (opens in browser window)
  @Get('wallet')
  async walletAuthPage(@Res() res: Response) {
    // Serve the wallet auth HTML page
    res.sendFile(join(process.cwd(), 'public', 'wallet-auth.html'));
  }

  // SIWE nonce generation
  @Post('siwe/nonce')
  async getSIWENonce(@Body() body: { address: string }) {
    const nonce = await this.authService.generateSIWENonce(body.address);
    return { nonce };
  }

  // SIWE signature verification
  @Post('siwe/verify')
  async verifySIWE(
    @Body() body: { address: string; signature: string; message: string; nonce: string },
    @Query('redirect_uri') redirectUri: string,
    @Res() res: Response
  ) {
    try {
      console.log('📥 Received body:');
      console.log('  Address:', body.address);
      console.log('  Signature length:', body.signature?.length);
      console.log('  Message length:', body.message?.length);
      console.log('  Nonce:', body.nonce);
      console.log('  Redirect URI:', redirectUri);
      
      const user = await this.authService.verifySIWE(body.address, body.signature, body.message, body.nonce);
      const authResult = await this.authService.login(user);
      
      console.log('✅ SIWE verification successful');
      console.log('🔑 User object:', {
        _id: (user as any)._id,
        wallet_address: user.wallet_address,
        username: user.username,
      });
      console.log('🔑 Auth result:', {
        access_token_length: authResult.access_token?.length,
        access_token_preview: authResult.access_token?.substring(0, 50) + '...',
        user_id: authResult.user?.id,
      });
      
      // Check if redirect_uri is provided (for extension flow)
      // chrome.identity.getRedirectURL() returns: https://[extension-id].chromiumapp.org/[path]
      if (redirectUri && redirectUri.includes('.chromiumapp.org')) {
        // Extension flow: Return JSON (fetch can't handle chrome-extension:// redirects)
        const token = authResult.access_token;
        console.log('📦 Extension flow, returning JSON with token');
        console.log('🔐 Token being sent (length):', token.length);
        console.log('🔐 Token preview:', token.substring(0, 30) + '...');
        
        res.json({
          success: true,
          access_token: token,
          redirect_uri: redirectUri,
          user: authResult.user,
        });
      } else {
        // Web flow: Use server-side redirect
        const backendUrl = process.env.NODE_ENV === 'production' 
          ? 'https://bunch.up.railway.app'
          : 'http://localhost:3000';
        
        console.log('🌐 Web flow, redirecting to auth-success page');
        res.redirect(`${backendUrl}/auth-success.html?token=${authResult.access_token}`);
      }
    } catch (error) {
      console.error('❌ SIWE verification failed:', error);
      res.status(401).json({ error: 'Verification failed', message: error.message });
    }
  }

  // Debug endpoint to test JWT generation
  @Get('debug/test-jwt')
  async testJWT() {
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Debug endpoint disabled in production' };
    }
    
    const testPayload = {
      wallet_address: '0x1234567890123456789012345678901234567890',
      sub: '507f1f77bcf86cd799439011',
      username: 'test_user',
    };
    
    try {
      const token = this.authService['jwtService'].sign(testPayload);
      return {
        success: true,
        token_length: token.length,
        token_preview: token.substring(0, 50) + '...',
        jwt_secret_set: !!process.env.JWT_SECRET,
        jwt_secret_length: process.env.JWT_SECRET?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return {
      id: req.user.userId,
      wallet_address: req.user.wallet_address,
      username: req.user.username,
    };
  }

  @Get('nonce')
  async getNonce() {
    // Generate a random nonce for the user to sign
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const message = `Sign this message to authenticate with Bunch.\n\nNonce: ${nonce}`;
    
    return {
      message,
      nonce,
    };
  }

  // DEV ONLY: Simple Twitter-style login for testing
  @Post('dev-login')
  async devLogin(@Body() body: { username: string }) {
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Dev login not available in production');
    }
    
    const user = await this.authService.findOrCreateByUsername(body.username);
    return this.authService.login(user);
  }

  // Twitter OAuth with chrome.identity support
  @Get('twitter')
  async twitterLogin(@Query('redirect_uri') redirectUri: string, @Res() res: Response) {
    console.log('🔐 Twitter OAuth initiated, redirect_uri:', redirectUri);
    
    // Get auth URL (will store redirect_uri internally using state parameter)
    const authUrl = this.authService.getTwitterAuthUrl(redirectUri);
    res.redirect(authUrl);
  }

  @Get('twitter/callback')
  async twitterCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      console.log('🔍 Twitter callback received:', { code: !!code, state });
      
      const twitterUser = await this.authService.handleTwitterCallback(code, state);
      const user = await this.authService.findOrCreateFromTwitter(twitterUser);
      const authResult = await this.authService.login(user);
      
      console.log('✅ User authenticated:', { userId: user._id, username: user.username });
      
      // Get redirect_uri from state parameter (stored in TwitterOAuthService)
      const redirectUri = this.authService.getExtensionRedirectUri(state);
      console.log('🔗 Redirect URI from state:', redirectUri);
      
      if (redirectUri && redirectUri.startsWith('https://') && redirectUri.includes('.chromiumapp.org')) {
        // Extension OAuth flow - redirect back to extension
        console.log('📦 Extension OAuth detected, redirecting to:', redirectUri);
        res.redirect(`${redirectUri}?token=${authResult.access_token}`);
      } else if (redirectUri && (redirectUri.includes('/login') || redirectUri.includes('admin'))) {
        // Admin panel OAuth flow - redirect back to admin panel login with token
        console.log('🔐 Admin panel OAuth detected, redirecting to:', redirectUri);
        res.redirect(`${redirectUri}?token=${authResult.access_token}`);
      } else {
        // Web app flow - redirect to auth success page
        console.log('🌐 Web OAuth (no extension redirect_uri), redirecting to auth-success');
        const backendUrl = process.env.NODE_ENV === 'production' 
          ? 'https://bunch.up.railway.app'
          : 'http://localhost:3000';
        
        res.redirect(`${backendUrl}/auth-success.html?token=${authResult.access_token}`);
      }
    } catch (error) {
      console.error('❌ Twitter callback error:', error);
      res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
  }

  // Beta activation endpoint
  @Post('activate-beta')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 attempts per hour
  async activateBeta(@Body() dto: ActivateBetaDto, @Request() req: any) {
    try {
      // Validate and use the invite code
      const inviteCode = await this.inviteCodesService.validateAndUse(
        dto.code,
        req.user.userId,
      );

      // Grant beta access to the user
      await this.usersService.grantBetaAccess(req.user.userId);

      return {
        success: true,
        message: 'Beta access activated! Welcome to Bunch 🚀',
        betaAccess: true,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid invite code');
    }
  }

  // Check beta status
  @Get('beta-status')
  @UseGuards(JwtAuthGuard)
  async getBetaStatus(@Request() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    
    return {
      betaAccess: user.betaAccess || false,
      requiresActivation: !user.betaAccess,
    };
  }
}

