import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FriendshipDocument = Friendship & Document;

@Schema({ timestamps: true })
export class Friendship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user1_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user2_id: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

// Indexes
FriendshipSchema.index({ user1_id: 1, user2_id: 1 }, { unique: true }); // No duplicate friendships
FriendshipSchema.index({ user1_id: 1 }); // Find user's friends
FriendshipSchema.index({ user2_id: 1 }); // Find user's friends (reverse)

