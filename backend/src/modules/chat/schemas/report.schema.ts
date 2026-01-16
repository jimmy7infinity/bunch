import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';
export type ReportType = 'message' | 'user' | 'chat';

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reporter_id: Types.ObjectId;

  @Prop({ required: true, enum: ['message', 'user', 'chat'] })
  type: ReportType;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  message_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reported_user_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  conversation_id?: Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop()
  additional_context?: string;

  @Prop({ required: true, enum: ['pending', 'reviewed', 'dismissed', 'actioned'], default: 'pending' })
  status: ReportStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewed_by?: Types.ObjectId;

  @Prop()
  reviewed_at?: Date;

  @Prop()
  review_notes?: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// Indexes
ReportSchema.index({ status: 1, created_at: -1 }); // Find pending reports
ReportSchema.index({ reporter_id: 1 }); // Find reports by user
ReportSchema.index({ reported_user_id: 1 }); // Find reports against a user
ReportSchema.index({ message_id: 1 }); // Find reports for a message
