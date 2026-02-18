import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserInventoryDocument = UserInventory & Document;

/**
 * User Inventory Schema
 * Tracks what rank accents and cosmetics a user has unlocked
 */
@Schema({ timestamps: true })
export class UserInventory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  unlocked_accents: string[]; // Array of rank names: ['VETERAN+', 'CAPTAIN+', 'DIAMOND', etc.]

  @Prop()
  equipped_accent?: string; // Currently equipped accent (optional, null = use base rank)

  @Prop({ type: Object, default: {} })
  unlock_dates: Record<string, Date>; // { 'DIAMOND': Date, 'VETERAN+': Date }

  @Prop({ type: Object, default: {} })
  unlock_methods: Record<string, string>; // { 'DIAMOND': 'achievement', 'EARLY': 'manual' }

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const UserInventorySchema = SchemaFactory.createForClass(UserInventory);

// Indexes
UserInventorySchema.index({ user_id: 1 }, { unique: true });
UserInventorySchema.index({ unlocked_accents: 1 });
