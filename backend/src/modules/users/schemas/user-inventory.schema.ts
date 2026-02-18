import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserInventoryDocument = UserInventory & Document;

export type InventoryItemType = 'rank_accent' | 'pfp_effect' | 'chat_badge' | 'emoji_pack';

export interface InventoryItem {
  item_id: string; // e.g., 'DIAMOND', 'sparkle_effect', 'emoji_pack_1'
  item_type: InventoryItemType;
  unlocked_at: Date;
  unlock_method: string; // 'achievement', 'purchase', 'manual', 'special_rank'
}

/**
 * User Inventory Schema
 * Tracks all items a user has unlocked and equipped
 * Designed to support multiple item types (rank accents, effects, badges, etc.)
 */
@Schema({ timestamps: true })
export class UserInventory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  items: InventoryItem[]; // All unlocked items

  @Prop({ type: Object, default: {} })
  equipped: Record<InventoryItemType, string | null>; // One equipped item per type
  // Example: { rank_accent: 'DIAMOND', pfp_effect: null, chat_badge: 'supporter' }

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const UserInventorySchema = SchemaFactory.createForClass(UserInventory);

// Indexes
UserInventorySchema.index({ user_id: 1 }, { unique: true });
UserInventorySchema.index({ 'items.item_id': 1 });
