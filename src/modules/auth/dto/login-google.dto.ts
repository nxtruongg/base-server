import { IsNotEmpty } from 'class-validator';

export class LoginGoogleDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  passWord: string;

  @IsNotEmpty()
  name: string;
}
