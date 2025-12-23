import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
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

  @Prop({ default: Date.now })
  created_at: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes
MessageSchema.index({ created_at: -1 });
MessageSchema.index({ sender_id: 1 });



