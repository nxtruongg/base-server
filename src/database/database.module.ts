import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IAppConfig } from '@/config/config.interface';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<IAppConfig>) => {
        const databaseConfig =
          configService.get<IAppConfig['database']>('database');
        return { uri: databaseConfig.uri };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
