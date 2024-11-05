import { IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  userName: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @MinLength(6)
  passWord: string;

  @IsNotEmpty()
  @MinLength(6)
  rePassWord: string;
}
