import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { IAppConfig } from '@/config/config.interface';
import { CACHE_STORE } from '@/common/constants';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<IAppConfig>) => {
        const cacheConfig = configService.get<IAppConfig['cache']>('cache');
        if (cacheConfig.store === CACHE_STORE.redis)
          return {
            store: '' as any,
            host: cacheConfig.redis.host,
            port: cacheConfig.redis.port,
            ttl: cacheConfig.ttl,
          };
        return {
          ttl: cacheConfig.ttl,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheModule {}
