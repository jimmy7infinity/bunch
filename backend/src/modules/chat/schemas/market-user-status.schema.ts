import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MarketUserStatusDocument = MarketUserStatus & Document;

export type StatusType = 'position' | 'whale';

@Schema({ timestamps: true })
export class MarketUserStatus {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  market_id: string;

  @Prop({ required: true, enum: ['position', 'whale'] })
  status: StatusType; // 'whale' overrides 'position'

  @Prop({ required: true })
  position_size_usd: number;

  @Prop({ required: true, default: Date.now })
  computed_at: Date;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const MarketUserStatusSchema = SchemaFactory.createForClass(MarketUserStatus);

// Indexes
MarketUserStatusSchema.index({ user_id: 1, market_id: 1 }, { unique: true }); // One status per user per market
MarketUserStatusSchema.index({ market_id: 1 }); // Query by market
MarketUserStatusSchema.index({ computed_at: -1 }); // Sort by freshness
