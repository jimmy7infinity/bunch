import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Body, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from '../users/inventory.service';
import { SpecialRanksService } from '../users/special-ranks.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    private inventoryService: InventoryService,
    private specialRanksService: SpecialRanksService,
  ) {}

  /**
   * Get user's inventory
   * GET /inventory
   */
  @Get()
  async getInventory(@Request() req: any) {
    const inventory = await this.inventoryService.getInventory(req.user.userId);
    const specialRanks = await this.specialRanksService.getActiveRanks(req.user.userId);

    return {
      unlocked_accents: inventory.unlocked_accents,
      equipped_accent: inventory.equipped_accent,
      unlock_dates: inventory.unlock_dates,
      unlock_methods: inventory.unlock_methods,
      special_ranks: specialRanks,
    };
  }

  /**
   * Get unlocked accents list
   * GET /inventory/accents
   */
  @Get('accents')
  async getUnlockedAccents(@Request() req: any) {
    const accents = await this.inventoryService.getUnlockedAccents(req.user.userId);
    return { accents };
  }

  /**
   * Equip a rank accent
   * POST /inventory/equip
   * Body: { accent_name: string | null }
   */
  @Post('equip')
  @HttpCode(HttpStatus.OK)
  async equipAccent(
    @Request() req: any,
    @Body('accent_name') accentName: string | null,
  ) {
    await this.inventoryService.equipAccent(req.user.userId, accentName);
    
    return {
      success: true,
      equipped_accent: accentName,
      message: accentName ? `Equipped ${accentName}` : 'Unequipped accent',
    };
  }

  /**
   * Get active special ranks
   * GET /inventory/special-ranks
   */
  @Get('special-ranks')
  async getSpecialRanks(@Request() req: any) {
    const ranks = await this.specialRanksService.getActiveRanks(req.user.userId);
    
    // Get details for each rank
    const details = await Promise.all(
      ranks.map(async (rankName) => {
        const detail = await this.specialRanksService.getRankDetails(req.user.userId, rankName);
        return {
          name: rankName,
          assigned_at: detail?.assigned_at,
          expires_at: detail?.expires_at,
          criteria_met: detail?.criteria_met,
        };
      })
    );

    return { ranks: details };
  }

  /**
   * Manual unlock (admin only - you'd add admin guard here)
   * POST /inventory/unlock
   * Body: { user_id: string, accent_name: string }
   */
  @Post('unlock')
  @HttpCode(HttpStatus.OK)
  async unlockAccent(
    @Body('user_id') userId: string,
    @Body('accent_name') accentName: string,
  ) {
    await this.inventoryService.unlockAccent(userId, accentName, 'manual');
    
    return {
      success: true,
      message: `Unlocked ${accentName} for user ${userId}`,
    };
  }
}
