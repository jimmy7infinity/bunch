import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export type UserStatus = 'active' | 'banned' | 'suspended' | 'deleted';
export type UserRole = 'user' | 'moderator' | 'admin';

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

  @Prop({ type: Object })
  polymarket?: {
    verified: boolean;
    username?: string;
    wallet_address?: string;
    verification_token?: string;
    verified_at?: Date;
  };

  @Prop({ type: Object, default: { autoPredictionChat: false } })
  settings?: {
    autoPredictionChat: boolean;
  };

  @Prop({ unique: true, sparse: true })
  username: string;

  @Prop()
  display_name?: string;

  @Prop()
  avatar_url?: string;

  @Prop()
  bio?: string;

  @Prop({ default: 'RECRUIT' })
  rank?: string;

  @Prop({ type: [String], default: [] })
  special_ranks?: string[]; // Active special ranks: ['DIAMOND', 'ON FIRE']

  @Prop()
  equipped_accent?: string; // Currently displayed rank accent (from inventory)

  @Prop({ enum: ['active', 'banned', 'suspended', 'deleted'], default: 'active' })
  status: UserStatus;

  @Prop({ enum: ['user', 'moderator', 'admin'], default: 'user' })
  role: UserRole;

  @Prop()
  banned_at?: Date;

  @Prop()
  banned_reason?: string;

  @Prop()
  suspended_until?: Date;

  @Prop()
  deleted_at?: Date;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  last_seen_at: Date;

  @Prop({ default: true })
  is_online: boolean;

  @Prop({ default: false })
  betaAccess: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ twitter_id: 1 });
UserSchema.index({ twitter_username: 1 });
UserSchema.index({ wallet_address: 1 });
UserSchema.index({ is_online: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });



