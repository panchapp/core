import { UsersService } from '@/users/application/services/users.service';
import { UsersController } from '@/users/infrastructure/controllers/users.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
