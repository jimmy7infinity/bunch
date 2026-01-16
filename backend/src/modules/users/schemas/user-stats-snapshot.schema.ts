import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserStatsSnapshotDocument = UserStatsSnapshot & Document;

@Schema({ _id: false })
export class Totals {
  @Prop({ default: 0 })
  total_markets: number;

  @Prop({ default: 0 })
  open_positions: number;

  @Prop({ default: 0 })
  resolved_markets: number;

  @Prop({ default: 0 })
  total_risked_usd: number;

  @Prop({ default: 0 })
  total_pnl_usd: number;
}

@Schema({ _id: false })
export class Performance {
  @Prop({ default: 0 })
  win_rate: number; // 0-1 (e.g., 0.65 = 65%)

  @Prop({ default: 0 })
  avg_position_size_usd: number;
}

@Schema({ _id: false })
export class MonthlyPnL {
  @Prop({ required: true })
  month: string; // Format: YYYY-MM

  @Prop({ required: true })
  pnl: number;
}

@Schema({ _id: false })
export class History {
  @Prop({ type: [MonthlyPnL], default: [] })
  pnl_by_month: MonthlyPnL[];
}

@Schema({ timestamps: true })
export class UserStatsSnapshot {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  wallet_address: string;

  @Prop({ type: Totals, default: () => ({}) })
  totals: Totals;

  @Prop({ type: Performance, default: () => ({}) })
  performance: Performance;

  @Prop({ type: History, default: () => ({ pnl_by_month: [] }) })
  history: History;

  @Prop({ required: true, default: Date.now })
  updated_at: Date;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const UserStatsSnapshotSchema = SchemaFactory.createForClass(UserStatsSnapshot);

// Indexes
UserStatsSnapshotSchema.index({ user_id: 1 }, { unique: true }); // One snapshot per user
UserStatsSnapshotSchema.index({ wallet_address: 1 }); // Query by wallet
UserStatsSnapshotSchema.index({ updated_at: -1 }); // Sort by freshness
