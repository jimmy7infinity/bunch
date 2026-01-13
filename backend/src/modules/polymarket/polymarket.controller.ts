import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { PolymarketService } from './polymarket.service';
import { WhaleDetectionService } from './whale-detection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('polymarket')
@UseGuards(JwtAuthGuard)
export class PolymarketController {
  constructor(
    private readonly polymarketService: PolymarketService,
    private readonly whaleDetectionService: WhaleDetectionService,
  ) {}

  /**
   * Start Polymarket verification process
   * POST /polymarket/verification/start
   */
  @Post('verification/start')
  async startVerification(@Request() req: any) {
    const userId = req.user.userId;
    return this.polymarketService.startVerification(userId);
  }

  /**
   * Confirm Polymarket verification
   * POST /polymarket/verification/confirm
   */
  @Post('verification/confirm')
  async confirmVerification(
    @Request() req: any,
    @Body('polymarketUsername') polymarketUsername: string,
  ) {
    if (!polymarketUsername) {
      return {
        success: false,
        message: 'Polymarket username is required',
      };
    }

    const userId = req.user.userId;
    return this.polymarketService.confirmVerification(userId, polymarketUsername);
  }

  /**
   * Get verification status
   * GET /polymarket/verification/status
   */
  @Get('verification/status')
  async getVerificationStatus(@Request() req: any) {
    const userId = req.user.userId;
    return this.polymarketService.getVerificationStatus(userId);
  }

  /**
   * Get whale status for a market
   * GET /polymarket/markets/:marketId/whales
   * Body: { activeUserIds: string[] }
   */
  @Post('markets/:marketId/whales')
  async getMarketWhales(
    @Param('marketId') marketId: string,
    @Body('activeUserIds') activeUserIds: string[],
  ) {
    const whales = await this.whaleDetectionService.getMarketWhales(marketId, activeUserIds || []);
    return { whales };
  }
}
