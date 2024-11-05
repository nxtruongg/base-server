import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema, SchemaOptions } from 'mongoose';

export class BaseDocument extends Document {
  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

/**
 * Hàm tạo schema với các tùy chọn mặc định.
 * @param entity Lớp schema cần tạo
 * @param options Tùy chọn schema bổ sung (nếu có)
 */

export function CreateSchema<T>(
  entity: T,
  options: SchemaOptions = {},
): Schema {
  const baseOptions: SchemaOptions = {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
    ...options,
  };

  const schema = SchemaFactory.createForClass(entity as any);

  schema.set('timestamps', baseOptions.timestamps);
  schema.set('toJSON', baseOptions.toJSON);

  schema.pre('save', function (next) {
    if (this.isModified()) {
      this.updatedAt = new Date();
    }
    next();
  });

  schema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: new Date() });
    next();
  });

  return schema;
}
