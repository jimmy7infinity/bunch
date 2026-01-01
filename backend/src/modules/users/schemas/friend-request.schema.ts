import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FriendRequestDocument = FriendRequest & Document;

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

@Schema({ timestamps: true })
export class FriendRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  from_user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  to_user_id: Types.ObjectId;

  @Prop({ enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: FriendRequestStatus;

  @Prop()
  message?: string;

  @Prop()
  responded_at?: Date;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);

// Indexes
FriendRequestSchema.index({ from_user_id: 1, to_user_id: 1 }, { unique: true }); // Can't send duplicate requests
FriendRequestSchema.index({ to_user_id: 1, status: 1 }); // Find pending requests for a user
FriendRequestSchema.index({ from_user_id: 1, status: 1 }); // Find sent requests

