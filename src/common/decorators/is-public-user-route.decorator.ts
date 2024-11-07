import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_USER_ROUTE_KEY = 'is_public_user_route';
export const IsPublicUserRoute = () =>
  SetMetadata(IS_PUBLIC_USER_ROUTE_KEY, true);
