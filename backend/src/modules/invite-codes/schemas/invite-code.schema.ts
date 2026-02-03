import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InviteCodeDocument = InviteCode & Document;

@Schema({ timestamps: true })
export class InviteCode {
  @Prop({ unique: true, required: true, index: true })
  code: string;

  @Prop({ default: false })
  used: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  usedBy?: Types.ObjectId;

  @Prop({ default: 1 })
  maxUses: number;

  @Prop({ default: 0 })
  useCount: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const InviteCodeSchema = SchemaFactory.createForClass(InviteCode);

// Indexes
InviteCodeSchema.index({ code: 1 });
InviteCodeSchema.index({ used: 1 });
InviteCodeSchema.index({ createdBy: 1 });
InviteCodeSchema.index({ expiresAt: 1 });
