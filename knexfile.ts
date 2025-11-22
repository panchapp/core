import * as dotenv from 'dotenv';
import { Knex } from 'knex';

// Load environment variables
dotenv.config({ path: '.env' });

const config: Knex.Config = {
  client: 'postgresql',
  connection: {
    host: process.env.POSTGRES_DB_HOST,
    port: process.env.POSTGRES_DB_PORT
      ? Number.parseInt(process.env.POSTGRES_DB_PORT, 10)
      : undefined,
    database: process.env.POSTGRES_DB_NAME,
    user: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    ssl:
      process.env.POSTGRES_DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'migrations',
  },
};

export default config;
