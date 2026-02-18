import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SpecialRankDocument = SpecialRank & Document;

/**
 * Special Rank Assignment Schema
 * Tracks temporary performance ranks (DIAMOND, ON FIRE, DANK, SIZE)
 * These expire and need to be re-earned each season or when conditions no longer met
 */
@Schema({ timestamps: true })
export class SpecialRank {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, enum: ['DIAMOND', 'ON FIRE', 'DANK', 'SIZE', 'NINJA'] })
  rank_name: string;

  @Prop({ default: Date.now })
  assigned_at: Date;

  @Prop()
  expires_at?: Date; // For temporary ranks

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Object, default: {} })
  criteria_met: Record<string, any>; // What triggered this rank: { hold_days: 35, position_size: 5000 }

  @Prop()
  last_checked_at?: Date; // When we last verified they still meet criteria
}

export const SpecialRankSchema = SchemaFactory.createForClass(SpecialRank);

// Indexes
SpecialRankSchema.index({ user_id: 1, rank_name: 1 });
SpecialRankSchema.index({ user_id: 1, is_active: 1 });
SpecialRankSchema.index({ expires_at: 1 });
