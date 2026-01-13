import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserMarketPositionDocument = UserMarketPosition & Document;

export type PositionType = 'yes' | 'no';

@Schema({ timestamps: true })
export class UserMarketPosition {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  market_id: string;

  @Prop({ required: true, enum: ['yes', 'no'] })
  position: PositionType;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const UserMarketPositionSchema = SchemaFactory.createForClass(UserMarketPosition);

// Indexes
UserMarketPositionSchema.index({ user_id: 1, market_id: 1 }, { unique: true }); // One position per user per market
UserMarketPositionSchema.index({ market_id: 1 }); // Query by market
