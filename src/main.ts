import { AppModule } from '@/app.module';
import { CustomExceptionFilter } from '@/common/filters/custom-exception.filter';
import { setupSwagger } from '@/config/swagger/swagger.config';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port')!;

  // Configuration
  const logger = app.get(Logger);
  const customExceptionFilter = app.get(CustomExceptionFilter);
  app.useLogger(logger);
  app.flushLogs();
  app.enableShutdownHooks();
  app.useGlobalFilters(customExceptionFilter);
  setupSwagger(app);

  // Start the applications
  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
