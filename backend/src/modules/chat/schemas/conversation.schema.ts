import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export type ConversationType = 'dm' | 'group' | 'global' | 'market';

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, enum: ['dm', 'group', 'global', 'market'] })
  type: ConversationType;

  @Prop({ sparse: true })
  market_id?: string;

  @Prop({ sparse: true })
  slug?: string;

  @Prop({ sparse: true })
  dm_hash?: string;

  @Prop()
  title?: string;

  @Prop({ default: false })
  is_private: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  created_by?: Types.ObjectId;

  @Prop({ default: 0 })
  participant_count: number;

  @Prop()
  last_message_at?: Date;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes
ConversationSchema.index({ type: 1, market_id: 1 }, { unique: true, sparse: true, partialFilterExpression: { market_id: { $type: 'string' } } }); // Unique market chats
ConversationSchema.index({ type: 1, slug: 1 }, { unique: true, sparse: true, partialFilterExpression: { slug: { $type: 'string' } } }); // Unique global chats
ConversationSchema.index({ type: 1, dm_hash: 1 }, { unique: true, sparse: true, partialFilterExpression: { dm_hash: { $type: 'string' } } }); // Unique DMs
ConversationSchema.index({ last_message_at: -1 }); // Sort by activity
ConversationSchema.index({ created_at: -1 }); // Sort by creation

