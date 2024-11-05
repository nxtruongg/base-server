import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDocument, CreateSchema } from 'src/base/base.schema';

@Schema()
export class Category extends BaseDocument {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  parentCategory: string;

  @Prop()
  description: string;
}
export const CategorySchema = CreateSchema(Category);

CategorySchema.index({ name: 1 });
CategorySchema.index({ code: 1 });
