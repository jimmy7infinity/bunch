import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserInventory, UserInventoryDocument } from './schemas/user-inventory.schema';
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
        unlocked_accents: [],
        unlock_dates: {},
        unlock_methods: {},
      });
    }

    return inventory;
  }

  /**
   * Unlock a rank accent for a user
   */
  async unlockAccent(
    userId: string, 
    accentName: string,
    method: string = 'achievement'
  ): Promise<void> {
    const inventory = await this.getInventory(userId);

    // Check if already unlocked
    if (inventory.unlocked_accents.includes(accentName)) {
      console.log(`User ${userId} already has ${accentName} unlocked`);
      return;
    }

    // Add to unlocked list
    inventory.unlocked_accents.push(accentName);
    inventory.unlock_dates[accentName] = new Date();
    inventory.unlock_methods[accentName] = method;
    inventory.updated_at = new Date();

    await inventory.save();

    console.log(`✅ Unlocked ${accentName} for user ${userId} via ${method}`);
  }

  /**
   * Equip a rank accent
   */
  async equipAccent(userId: string, accentName: string | null): Promise<void> {
    const inventory = await this.getInventory(userId);

    // If accentName is null, unequip (use base rank)
    if (accentName === null) {
      inventory.equipped_accent = undefined;
      await inventory.save();

      // Update User model
      await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $unset: { equipped_accent: '' } }
      );
      return;
    }

    // Check if user has unlocked this accent
    if (!inventory.unlocked_accents.includes(accentName)) {
      throw new BadRequestException('Accent not unlocked');
    }

    // Equip accent
    inventory.equipped_accent = accentName;
    inventory.updated_at = new Date();
    await inventory.save();

    // Update User model for quick access
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { equipped_accent: accentName }
    );

    console.log(`✅ User ${userId} equipped ${accentName}`);
  }

  /**
   * Get equipped accent or determine default based on rank
   */
  async getDisplayAccent(userId: string, currentRank: string): Promise<string> {
    const inventory = await this.getInventory(userId);

    // If user has equipped a custom accent, use it
    if (inventory.equipped_accent) {
      return inventory.equipped_accent;
    }

    // Otherwise, use their current rank
    return currentRank;
  }

  /**
   * Check what accents a user has unlocked
   */
  async getUnlockedAccents(userId: string): Promise<string[]> {
    const inventory = await this.getInventory(userId);
    return inventory.unlocked_accents;
  }

  /**
   * Automatically unlock accents when user ranks up
   */
  async onRankUp(userId: string, newRank: string): Promise<void> {
    // When user reaches a + rank, auto-unlock that accent
    if (newRank.endsWith('+')) {
      await this.unlockAccent(userId, newRank, 'rank_progression');
    }
  }
}
