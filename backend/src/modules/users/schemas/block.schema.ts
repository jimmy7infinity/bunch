import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlockDocument = Block & Document;

@Schema({ timestamps: true })
export class Block {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  blocker_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  blocked_id: Types.ObjectId;

  @Prop()
  reason?: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const BlockSchema = SchemaFactory.createForClass(Block);

// Indexes
BlockSchema.index({ blocker_id: 1, blocked_id: 1 }, { unique: true }); // Can't block same user twice
BlockSchema.index({ blocker_id: 1 }); // Find who a user has blocked
BlockSchema.index({ blocked_id: 1 }); // Find who blocked a user

