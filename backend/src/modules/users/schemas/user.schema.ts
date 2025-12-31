import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true })
  twitter_id: string;

  @Prop()
  twitter_username: string;

  @Prop()
  twitter_avatar?: string;

  @Prop({ unique: true, sparse: true })
  wallet_address?: string;

  @Prop({ default: false })
  wallet_verified: boolean;

  @Prop({ unique: true, sparse: true })
  username: string;

  @Prop()
  display_name?: string;

  @Prop()
  avatar_url?: string;

  @Prop()
  bio?: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  last_seen_at: Date;

  @Prop({ default: true })
  is_online: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ twitter_id: 1 });
UserSchema.index({ twitter_username: 1 });
UserSchema.index({ wallet_address: 1 });
UserSchema.index({ is_online: 1 });



