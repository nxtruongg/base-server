import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { IsPublicRoute } from '@/common/decorators/is-public-route.decorator';
import { GoogleAuthGuard } from '../../common/guards/auth/google-auth.guard';
import { Response } from 'express';

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

  @IsPublicRoute()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    // Điều này sẽ được xử lý tự động bởi Passport
  }

  @IsPublicRoute()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    const user = req.user;
    return await this.authService.loginByGoogle({
      email: user.profile._json.email,
      name: user.profile.displayName,
      passWord: user.providerId,
    });
  }
}
