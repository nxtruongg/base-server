import { IAppConfig } from '@/config/config.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    configService: ConfigService<IAppConfig>,
  ) {
    super({
      clientID: configService.get<string>('googleClientId'),
      clientSecret: configService.get<string>('googleClientSecret'),
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, name, emails } = profile;

    const user = {
      provider: 'google',
      providerId: id,
      accessToken,
      refreshToken,
      profile,
    };

    return user;
  }
}
