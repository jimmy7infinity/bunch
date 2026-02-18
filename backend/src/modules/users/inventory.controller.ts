import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryService } from '../users/inventory.service';
import { SpecialRanksService } from '../users/special-ranks.service';
import { InventoryItemType } from './schemas/user-inventory.schema';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    private inventoryService: InventoryService,
    private specialRanksService: SpecialRanksService,
  ) {}

  /**
   * Get user's full inventory
   * GET /inventory
   */
  @Get()
  async getInventory(@Request() req: any) {
    const inventory = await this.inventoryService.getInventory(req.user.userId);
    const specialRanks = await this.specialRanksService.getActiveRanks(req.user.userId);

    return {
      items: inventory.items,
      equipped: inventory.equipped,
      special_ranks: specialRanks,
    };
  }

  /**
   * Get items by type
   * GET /inventory/items?type=rank_accent
   */
  @Get('items')
  async getItemsByType(
    @Request() req: any,
    @Query('type') type: InventoryItemType = 'rank_accent'
  ) {
    const items = await this.inventoryService.getItemsByType(req.user.userId, type);
    return { items };
  }

  /**
   * Legacy: Get unlocked rank accents
   * GET /inventory/accents
   */
  @Get('accents')
  async getUnlockedAccents(@Request() req: any) {
    const accents = await this.inventoryService.getUnlockedAccents(req.user.userId);
    return { accents };
  }

  /**
   * Equip an item (automatically unequips previous item of same type)
   * POST /inventory/equip
   * Body: { item_id: string | null, item_type: InventoryItemType }
   */
  @Post('equip')
  @HttpCode(HttpStatus.OK)
  async equipItem(
    @Request() req: any,
    @Body('item_id') itemId: string | null,
    @Body('item_type') itemType: InventoryItemType = 'rank_accent'
  ) {
    await this.inventoryService.equipItem(req.user.userId, itemId, itemType);
    
    return {
      success: true,
      equipped: {
        [itemType]: itemId,
      },
      message: itemId ? `Equipped ${itemType}: ${itemId}` : `Unequipped ${itemType}`,
    };
  }

  /**
   * Get active special ranks with details
   * GET /inventory/special-ranks
   */
  @Get('special-ranks')
  async getSpecialRanks(@Request() req: any) {
    const ranks = await this.specialRanksService.getActiveRanks(req.user.userId);
    
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
   * Manual unlock (admin only)
   * POST /inventory/unlock
   * Body: { user_id: string, item_id: string, item_type: InventoryItemType }
   */
  @Post('unlock')
  @HttpCode(HttpStatus.OK)
  async unlockItem(
    @Body('user_id') userId: string,
    @Body('item_id') itemId: string,
    @Body('item_type') itemType: InventoryItemType = 'rank_accent'
  ) {
    await this.inventoryService.unlockItem(userId, itemId, itemType, 'manual');
    
    return {
      success: true,
      message: `Unlocked ${itemType}:${itemId} for user ${userId}`,
    };
  }
}
