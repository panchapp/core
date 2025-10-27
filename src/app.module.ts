import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import envConfig from '@/config/env/env.config';
import { ConfigModule } from '@nestjs/config';
import { validate } from '@/config/env/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      validate,
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
