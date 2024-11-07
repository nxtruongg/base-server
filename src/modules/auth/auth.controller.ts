import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { IsPublicRoute } from '@/common/decorators/is-public-route.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @IsPublicRoute()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @IsPublicRoute()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
