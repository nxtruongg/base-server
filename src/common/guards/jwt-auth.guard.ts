import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Model } from 'mongoose';
import { IAppConfig } from '@/config/config.interface';
import { User } from '@/database/schemas/user.schema';
import { IUserRequest } from '../interfaces/user-request.interfaces';
import { IS_PUBLIC_USER_ROUTE_KEY } from '../decorators/is-public-user-route.decorator';
import { IS_PUBLIC_ROUTE_KEY } from '../decorators/is-public-route.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<IAppConfig>,
    private reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.get<boolean>(
      IS_PUBLIC_ROUTE_KEY,
      context.getHandler(),
    );
    if (isPublicRoute) return true;
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException(
        'Unauthorized: Authorization header is missing',
      );
    }
    const publicToken = this.configService.get<string>('publicToken');

    const isPublicUserRoute = this.reflector.get<boolean>(
      IS_PUBLIC_USER_ROUTE_KEY,
      context.getHandler(),
    );

    if (isPublicUserRoute && authHeader === `Bearer ${publicToken}`) {
      return true;
    }
    const token = authHeader.replace('Bearer ', '');

    const decodedToken: IUserRequest = this.jwtService.decode(token);

    if (!decodedToken || !decodedToken.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const dbUser = await this.userModel.findById(decodedToken.userId);
    if (!dbUser) {
      throw new UnauthorizedException('User no longer exists');
    }
    if (
      dbUser.lastPasswordChange &&
      decodedToken.iat <
        Math.floor(new Date(dbUser.lastPasswordChange).getTime() / 1000)
    ) {
      throw new UnauthorizedException(
        'Token has expired due to password change or user update',
      );
    }

    return true;
  }
  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
