import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from '@/config/swagger/swagger.config';
import { Logger } from 'nestjs-pino';
import { NestApplicationOptions } from '@nestjs/common';

async function bootstrap() {
  const appOptions: NestApplicationOptions = {
    bufferLogs: true,
  };
  const app = await NestFactory.create(AppModule, appOptions);
  app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port')!;
  setupSwagger(app);
  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
