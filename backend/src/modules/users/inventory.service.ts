import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserInventory, UserInventoryDocument, InventoryItemType, InventoryItem } from './schemas/user-inventory.schema';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(UserInventory.name) private inventoryModel: Model<UserInventoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Get or create user's inventory
   */
  async getInventory(userId: string): Promise<UserInventoryDocument> {
    let inventory = await this.inventoryModel.findOne({ 
      user_id: new Types.ObjectId(userId) 
    });

    if (!inventory) {
      inventory = await this.inventoryModel.create({
        user_id: new Types.ObjectId(userId),
        items: [],
        equipped: {
          rank_accent: null,
          pfp_effect: null,
          chat_badge: null,
          emoji_pack: null,
        },
      });
    }

    return inventory;
  }

  /**
   * Unlock an item for a user
   */
  async unlockItem(
    userId: string,
    itemId: string,
    itemType: InventoryItemType,
    method: string = 'achievement'
  ): Promise<void> {
    const inventory = await this.getInventory(userId);

    // Check if already unlocked
    const existingItem = inventory.items.find(
      item => item.item_id === itemId && item.item_type === itemType
    );

    if (existingItem) {
      console.log(`User ${userId} already has ${itemType}:${itemId} unlocked`);
      return;
    }

    // Add to items array
    inventory.items.push({
      item_id: itemId,
      item_type: itemType,
      unlocked_at: new Date(),
      unlock_method: method,
    });

    inventory.updated_at = new Date();
    await inventory.save();

    console.log(`✅ Unlocked ${itemType}:${itemId} for user ${userId} via ${method}`);
  }

  /**
   * Legacy method for rank accents (backward compatibility)
   */
  async unlockAccent(userId: string, accentName: string, method: string = 'achievement'): Promise<void> {
    return this.unlockItem(userId, accentName, 'rank_accent', method);
  }

  /**
   * Equip an item (only one item per type can be equipped)
   */
  async equipItem(
    userId: string,
    itemId: string | null,
    itemType: InventoryItemType
  ): Promise<void> {
    const inventory = await this.getInventory(userId);

    // If itemId is null, unequip
    if (itemId === null) {
      inventory.equipped[itemType] = null;
      await inventory.save();

      // Update User model if it's a rank accent
      if (itemType === 'rank_accent') {
        await this.userModel.updateOne(
          { _id: new Types.ObjectId(userId) },
          { $unset: { equipped_accent: '' } }
        );
      }
      return;
    }

    // Check if user has unlocked this item
    const hasItem = inventory.items.some(
      item => item.item_id === itemId && item.item_type === itemType
    );

    if (!hasItem) {
      throw new BadRequestException(`${itemType} not unlocked`);
    }

    // Equip item (automatically unequips previous item of same type)
    inventory.equipped[itemType] = itemId;
    inventory.updated_at = new Date();
    await inventory.save();

    // Update User model if it's a rank accent
    if (itemType === 'rank_accent') {
      await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { equipped_accent: itemId }
      );
    }

    console.log(`✅ User ${userId} equipped ${itemType}:${itemId}`);
  }

  /**
   * Legacy method for rank accents (backward compatibility)
   */
  async equipAccent(userId: string, accentName: string | null): Promise<void> {
    return this.equipItem(userId, accentName, 'rank_accent');
  }

  /**
   * Get equipped item of a specific type
   */
  async getEquippedItem(userId: string, itemType: InventoryItemType): Promise<string | null> {
    const inventory = await this.getInventory(userId);
    return inventory.equipped[itemType] || null;
  }

  /**
   * Get all items of a specific type
   */
  async getItemsByType(userId: string, itemType: InventoryItemType): Promise<InventoryItem[]> {
    const inventory = await this.getInventory(userId);
    return inventory.items.filter(item => item.item_type === itemType);
  }

  /**
   * Legacy method for rank accents (backward compatibility)
   */
  async getUnlockedAccents(userId: string): Promise<string[]> {
    const items = await this.getItemsByType(userId, 'rank_accent');
    return items.map(item => item.item_id);
  }

  /**
   * Get display accent (equipped or default)
   */
  async getDisplayAccent(userId: string, currentRank: string): Promise<string> {
    const equippedAccent = await this.getEquippedItem(userId, 'rank_accent');
    return equippedAccent || currentRank;
  }

  /**
   * Auto-unlock when user ranks up
   */
  async onRankUp(userId: string, newRank: string): Promise<void> {
    if (newRank.endsWith('+')) {
      await this.unlockAccent(userId, newRank, 'rank_progression');
    }
  }
}
