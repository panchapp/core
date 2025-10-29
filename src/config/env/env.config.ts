import { validate } from '@/config/env/env.validation';
import dotenv from 'dotenv';

dotenv.config({ path: '.env', override: true });

function envConfig() {
  return {
    // Application
    app: {
      port: Number.parseInt(process.env.PORT!, 10),
      nodeEnv: process.env.NODE_ENV!,
    },

    // Logging
    logging: {
      level: process.env.LOG_LEVEL!,
      enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
    },

    // Database
    postgres: {
      host: process.env.POSTGRES_DB_HOST!,
      port: Number.parseInt(process.env.POSTGRES_DB_PORT!, 10),
      database: process.env.POSTGRES_DB_NAME!,
      username: process.env.POSTGRES_DB_USER!,
      password: process.env.POSTGRES_DB_PASSWORD!,
      ssl: process.env.POSTGRES_DB_SSL!,
    },
  };
}

export function getEnvConfig() {
  return {
    load: [envConfig],
    validate,
    isGlobal: true,
    envFilePath: '.env',
  };
}
