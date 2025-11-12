import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from '@/config/swagger/swagger.config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port')!;

  // Configuration
  app.useLogger(app.get(Logger));
  app.flushLogs();
  app.enableShutdownHooks();
  setupSwagger(app);

  // Start the application
  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
