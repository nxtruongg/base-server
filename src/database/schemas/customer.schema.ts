import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDocument, CreateSchema } from 'src/base/base.schema';

@Schema()
export class Customer extends BaseDocument {
  @Prop({ required: true })
  ma_kh: string;

  @Prop({ required: true })
  ten_kh: string;
}

export const CustomerSchema = CreateSchema(Customer);

CustomerSchema.index({ ma_kh: 1 });
CustomerSchema.index({ ten_kh: 1 });
