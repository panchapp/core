import { UsersService } from '@/users/application/services/users.service';
import { USERS_REPOSITORY_TOKEN } from '@/users/domain/tokens/users.tokens';
import { UsersController } from '@/users/infrastructure/controllers/users.controller';
import { KnexUsersRepository } from '@/users/infrastructure/repositories/knex-users.repository';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: USERS_REPOSITORY_TOKEN, useClass: KnexUsersRepository },
  ],
  exports: [UsersService, USERS_REPOSITORY_TOKEN],
})
export class UsersModule {}
