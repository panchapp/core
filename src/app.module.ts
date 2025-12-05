import { AppController } from '@/app.controller';
import { AuthModule } from '@/auth/auth.module';
import { CustomExceptionFilter } from '@/common/filters/custom-exception.filter';
import { getEnvConfig } from '@/config/env/env.config';
import { getLoggingConfig } from '@/config/logging/logging.config';
import { DatabaseModule } from '@/database/database.module';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AppsModule } from './apps/apps.module';

@Module({
  imports: [
    ConfigModule.forRoot(getEnvConfig()),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getLoggingConfig(configService),
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    AppsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule {}
