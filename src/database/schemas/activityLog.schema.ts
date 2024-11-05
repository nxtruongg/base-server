import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IActivityLog extends Document {
  action: string;
  documentId: string;
  collectionName: string;
  timestamp: Date;
  user: any;
  changes: any;
}

@Schema()
export class ActivityLog extends Document {
  @Prop({ required: true })
  action: string;

  @Prop({})
  documentId: string;

  @Prop({ required: true })
  collectionName: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Object })
  user: any;

  @Prop({ type: Object })
  changes: any;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ collectionName: 1 });
ActivityLogSchema.index({ user: 1 });
ActivityLogSchema.index({ documentId: 1 });
