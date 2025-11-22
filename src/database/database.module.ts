import { getDatabaseConfig } from '@/config/database/database.config';
import { KNEX_DATABASE_TOKEN } from '@/database/database.tokens';
import {
  Global,
  Inject,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: KNEX_DATABASE_TOKEN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Knex => {
        const config = getDatabaseConfig(configService);
        const knexInstance = knex(config);
        return knexInstance;
      },
    },
  ],
  exports: [KNEX_DATABASE_TOKEN],
})
export class DatabaseModule implements OnModuleDestroy, OnModuleInit {
  constructor(
    @Inject(KNEX_DATABASE_TOKEN) private readonly db: Knex,
    @InjectPinoLogger(DatabaseModule.name) private readonly logger: PinoLogger,
  ) {}

  async onModuleInit() {
    try {
      await this.db.select(1);
      this.logger.info('Database connection initialized');
    } catch (error) {
      this.logger.error({
        message: 'Error initializing database connection',
        error: {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.db.destroy();
  }
}
