import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDocument, CreateSchema } from '@/base/base.schema';

@Schema()
export class Product extends BaseDocument {
  @Prop({ required: true, unique: true })
  code: string;
  @Prop({ required: true })
  name: string;
  @Prop({ default: 0 })
  price: number;
  @Prop()
  description: string;
  @Prop()
  category: string;
}
export const ProductSchema = CreateSchema(Product);

ProductSchema.index({ code: 1 });
ProductSchema.index({ name: 1 });
