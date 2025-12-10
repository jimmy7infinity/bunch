import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  wallet_address: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  display_name?: string;

  @Prop()
  avatar_url?: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  last_seen_at: Date;

  @Prop({ default: true })
  is_online: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ wallet_address: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ is_online: 1 });

