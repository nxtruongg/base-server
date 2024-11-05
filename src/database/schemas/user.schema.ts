import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDocument, CreateSchema } from 'src/base/base.schema';

@Schema()
export class User extends BaseDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true })
  passWord: string;
}

export const UserSchema = CreateSchema(User);
