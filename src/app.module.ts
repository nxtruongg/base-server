import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ErrorLoggingMiddleware } from './common/middleware/error-logging.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { DynamicLoaderModule } from './modules/dynamic-feature.module';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from './cache/cache.module';
import { JwtAuthGuard } from '@/common/guards/auth/jwt-auth.guard';
import { EmailModule } from './modules/email/email.module';
import { FileModule } from './modules/file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    DynamicLoaderModule.register(),
    AuthModule,
    CacheModule,
    EventEmitterModule.forRoot(),
    EmailModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ErrorLoggingMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
