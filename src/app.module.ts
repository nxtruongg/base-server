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
import { UsersModule } from './modules/lists/user/user.module';
import { CacheModule } from './cache/cache.module';
import { EmailModule } from './modules/email/email.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    CacheModule,
    EventEmitterModule.forRoot(),
    EmailModule,
    AuthModule,
    UsersModule,
    DynamicLoaderModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ErrorLoggingMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
