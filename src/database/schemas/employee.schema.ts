import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDocument, CreateSchema } from '@/base/base.schema';

@Schema()
export class Employee extends BaseDocument {
  @Prop({ required: true, unique: true })
  code: string;
  @Prop({ required: true })
  name: string;
}
export const EmployeeSchema = CreateSchema(Employee);

EmployeeSchema.index({ code: 1 });
EmployeeSchema.index({ name: 1 });
