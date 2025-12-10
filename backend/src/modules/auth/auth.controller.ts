import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class WalletLoginDto {
  wallet_address: string;
  signature: string;
  message: string;
}

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
  async getMe(@Request() req) {
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
}

