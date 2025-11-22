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
  constructor(@Inject(KNEX_DATABASE_TOKEN) private readonly db: Knex) {}

  async onModuleInit() {
    try {
      await this.db.select(1);
    } catch (error) {
      throw new Error(`Failed to initialize database connection`, {
        cause: (error as Error).message,
      });
    }
  }

  async onModuleDestroy() {
    await this.db.destroy();
  }
}
