import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getCached<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async setCached<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async delCache(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async resetCache(): Promise<void> {
    await this.cacheManager.clear();
  }
}
