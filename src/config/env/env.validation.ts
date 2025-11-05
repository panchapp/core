import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  // App
  @IsNumber()
  PORT!: number;

  @IsEnum(['development', 'production', 'test'])
  NODE_ENV!: 'development' | 'production' | 'test';

  // Logging
  @IsEnum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
  LOG_LEVEL!: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

  @IsBoolean()
  ENABLE_REQUEST_LOGGING!: boolean;

  // Postgres Database
  @IsString()
  POSTGRES_DB_HOST!: string;

  @IsNumber()
  POSTGRES_DB_PORT!: number;

  @IsString()
  POSTGRES_DB_NAME!: string;

  @IsString()
  POSTGRES_DB_USER!: string;

  @IsString()
  POSTGRES_DB_PASSWORD!: string;

  @IsString()
  POSTGRES_DB_SSL!: string;

  // Auth
  @IsString()
  JWT_SECRET!: string;

  @IsNumber()
  JWT_EXPIRATION_TIME!: number;

  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  GOOGLE_CLIENT_SECRET!: string;

  @IsUrl({
    require_protocol: false,
    require_tld: false,
    protocols: ['http', 'https'],
  })
  GOOGLE_CALLBACK_URL!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      const constraints = Object.values(error.constraints || {});
      return constraints.join(', ');
    });

    throw new Error(JSON.stringify({ errors: errorMessages }, null, 2));
  }

  return validatedConfig;
}
