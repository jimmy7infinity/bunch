import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException, Req, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WalletLoginDto } from './dto/wallet-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { join } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
      const user = await this.authService.verifySIWE(body.address, body.signature, body.message, body.nonce);
      const authResult = await this.authService.login(user);
      
      console.log('✅ SIWE verification successful');
      
      // Check if redirect_uri is provided (for extension flow)
      if (redirectUri && redirectUri.includes('.chromiumapp.org')) {
        const redirectUrl = `${redirectUri}?token=${authResult.access_token}`;
        console.log('📦 Extension flow, redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
      } else {
        // Fallback: use auth-success.html page with postMessage
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
}

