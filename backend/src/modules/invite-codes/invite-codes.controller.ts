import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InviteCodesService } from './invite-codes.service';
import { GenerateCodesDto } from './dto/generate-codes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/invites')
@UseGuards(JwtAuthGuard)
export class InviteCodesController {
  constructor(private readonly inviteCodesService: InviteCodesService) {}

  /**
   * Generate invite codes (admin, mod, creator only)
   */
  @Post('generate')
  @UseGuards(AdminGuard)
  async generate(@Body() dto: GenerateCodesDto, @Request() req: any) {
    const codes = await this.inviteCodesService.generateCodes(
      dto.count,
      dto.maxUses,
      req.user.userId,
      dto.expiresAt,
    );

    return {
      success: true,
      count: codes.length,
      codes: codes.map(c => ({
        code: c.code,
        maxUses: c.maxUses,
        expiresAt: c.expiresAt,
      })),
    };
  }

  /**
   * Get all invite codes (admin, mod, creator only)
   */
  @Get()
  @UseGuards(AdminGuard)
  async findAll() {
    const codes = await this.inviteCodesService.findAll();
    return {
      success: true,
      codes,
    };
  }

  /**
   * Get invite code stats (admin, mod, creator only)
   */
  @Get('stats')
  @UseGuards(AdminGuard)
  async getStats() {
    const stats = await this.inviteCodesService.getStats();
    return {
      success: true,
      stats,
    };
  }

  /**
   * Delete an invite code (admin only)
   */
  @Delete(':code')
  @UseGuards(AdminGuard)
  async deleteCode(@Param('code') code: string) {
    await this.inviteCodesService.deleteCode(code);
    return {
      success: true,
      message: 'Invite code deleted',
    };
  }
}
