import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException, Req, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WalletLoginDto } from './dto/wallet-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('wallet')
  async walletLogin(@Body() loginDto: WalletLoginDto) {
    const user = await this.authService.validateWalletSignature(
      loginDto.wallet_address,
      loginDto.signature,
      loginDto.message,
    );

    return this.authService.login(user);
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
}

