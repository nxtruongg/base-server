import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class File extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ default: 'files' })
  group: string;

  @Prop()
  thumbnailPath?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdBy?: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
