import { ConfigService } from '@nestjs/config';

export function getLoggingConfig(configService: ConfigService) {
  const nodeEnv = configService.get<string>('app.nodeEnv')!;
  const level = configService.get<string>('logging.level')!;
  const enableRequestLogging = configService.get<boolean>(
    'logging.enableRequestLogging',
  )!;

  const isProduction = nodeEnv === 'production';

  return {
    messageKey: 'message',
    pinoHttp: {
      level,
      autoLogging: enableRequestLogging,
      messageKey: 'message',
      serializers: {
        req: (request: Request) => {
          if (!enableRequestLogging) return undefined;
          return request;
        },
        res: (response: Response) => {
          if (!enableRequestLogging) return undefined;
          return response;
        },
      },
      transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              messageKey: 'message',
            },
          },
    },
  };
}
