import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';

export function getDatabaseConfig(configService: ConfigService): Knex.Config {
  return {
    client: 'postgresql',
    connection: {
      host: configService.get<string>('postgres.host'),
      port: configService.get<number>('postgres.port'),
      database: configService.get<string>('postgres.database'),
      user: configService.get<string>('postgres.username'),
      password: configService.get<string>('postgres.password'),
      ssl:
        configService.get<string>('postgres.ssl') === 'true'
          ? { rejectUnauthorized: false }
          : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'migrations',
      directory: './migrations',
    },
  };
}
