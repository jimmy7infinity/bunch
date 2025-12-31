import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException, Req, Res } from '@nestjs/common';
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
    const message = `Sign this message to authenticate with PolyBanter.\n\nNonce: ${nonce}`;
    
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

  // Twitter OAuth
  @Get('twitter')
  @UseGuards(AuthGuard('twitter'))
  async twitterLogin() {
    // Initiates Twitter OAuth flow
  }

  @Get('twitter/callback')
  @UseGuards(AuthGuard('twitter'))
  async twitterCallback(@Req() req: any, @Res() res: Response) {
    console.log('🔍 Twitter callback received:', {
      hasUser: !!req.user,
      user: req.user,
      query: req.query,
    });
    
    // Twitter returns here after authentication
    const user = await this.authService.findOrCreateFromTwitter(req.user);
    const authResult = await this.authService.login(user);
    
    console.log('✅ User authenticated:', { userId: user._id, username: user.username });
    
    // Redirect to frontend with token
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'chrome-extension://YOUR_EXTENSION_ID' // Will update this later
      : 'http://localhost:5173';
    
    res.redirect(`${frontendUrl}/auth/callback?token=${authResult.access_token}`);
  }
}

