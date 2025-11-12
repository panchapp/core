import { KNEX_DATABASE_TOKEN } from '@/database/database.tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class UsersService {
  constructor(@Inject(KNEX_DATABASE_TOKEN) private readonly db: Knex) {}
}
