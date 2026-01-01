import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversation_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ type: Map, of: [Types.ObjectId], default: {} })
  reactions: Map<string, Types.ObjectId[]>;

  @Prop({ default: false })
  deleted: boolean;

  @Prop()
  edited_at?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  reply_to?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  mentions?: Types.ObjectId[];

  @Prop({ default: false })
  is_ai?: boolean;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes
MessageSchema.index({ conversation_id: 1, created_at: -1 }); // Messages in a conversation
MessageSchema.index({ sender_id: 1 }); // Messages by user
MessageSchema.index({ created_at: -1 }); // All messages by time





