import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IAppConfig } from '@/config/config.interface';
import { EmailProcessor } from './email.processor';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<IAppConfig>) => {
        const redisConfig =
          configService.get<IAppConfig['cache']>('cache').redis;
        return {
          connection: {
            password: redisConfig.password,
            host: redisConfig.host,
            port: redisConfig.port,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  providers: [EmailProcessor, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
