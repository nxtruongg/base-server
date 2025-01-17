import { IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import e from 'express';

export class CreateUserDto {
  @IsNotEmpty()
  userName: string;

  @IsNotEmpty()
  name: string;

  @IsEnum(['local', 'google', 'facebook'])
  authProvider?: string;

  @MinLength(6)
  passWord?: string;

  @MinLength(6)
  rePassWord?: string;
}
