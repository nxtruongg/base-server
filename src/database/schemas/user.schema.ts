import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDocument, CreateSchema } from '@/base/base.schema';
import { Exclude } from 'class-transformer';

@Schema()
export class User extends BaseDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true })
  @Exclude()
  passWord: string;

  @Prop({
    required: true,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  })
  authProvider: string;

  @Prop()
  @Exclude()
  lastPasswordChange: Date;
}

export const UserSchema = CreateSchema(User);
