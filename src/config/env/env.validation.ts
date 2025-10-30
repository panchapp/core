import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  // App
  @IsNumber({}, { message: 'Application port must be a valid number' })
  PORT!: number;

  @IsEnum(['development', 'production', 'test'], {
    message: 'Environment must be one of: development, production, test',
  })
  NODE_ENV!: 'development' | 'production' | 'test';

  // Postgres Database
  @IsString({ message: 'PostgreSQL database host is required' })
  POSTGRES_DB_HOST!: string;

  @IsNumber({}, { message: 'PostgreSQL database port must be a valid number' })
  POSTGRES_DB_PORT!: number;

  @IsString({ message: 'PostgreSQL database name is required' })
  POSTGRES_DB_NAME!: string;

  @IsString({ message: 'PostgreSQL database username is required' })
  POSTGRES_DB_USER!: string;

  @IsString({ message: 'PostgreSQL database password is required' })
  POSTGRES_DB_PASSWORD!: string;

  @IsString({ message: 'PostgreSQL SSL setting is required' })
  POSTGRES_DB_SSL!: string;
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
