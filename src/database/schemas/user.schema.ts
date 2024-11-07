import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDocument, CreateSchema } from '@/base/base.schema';

@Schema()
export class User extends BaseDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true })
  passWord: string;

  @Prop()
  lastPasswordChange: Date;
}

export const UserSchema = CreateSchema(User);
