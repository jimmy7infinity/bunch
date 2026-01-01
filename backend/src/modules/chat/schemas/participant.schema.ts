import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ParticipantDocument = Participant & Document;

export type ParticipantRole = 'owner' | 'admin' | 'member';

@Schema({ timestamps: true })
export class Participant {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversation_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, enum: ['owner', 'admin', 'member'], default: 'member' })
  role: ParticipantRole;

  @Prop({ default: Date.now })
  joined_at: Date;

  @Prop()
  last_read_at?: Date;

  @Prop({ default: false })
  muted: boolean;

  @Prop({ default: true })
  has_notifications: boolean;

  @Prop({ default: false })
  is_favorite: boolean;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

// Indexes
ParticipantSchema.index({ conversation_id: 1, user_id: 1 }, { unique: true }); // Unique membership
ParticipantSchema.index({ user_id: 1, last_read_at: -1 }); // User's conversations sorted by read time
ParticipantSchema.index({ conversation_id: 1, role: 1 }); // Find admins/owners of a conversation

