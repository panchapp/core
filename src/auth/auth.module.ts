import { Module } from '@nestjs/common';
import { AuthController } from '@/auth/infrastructure/controllers/auth.controller';

@Module({
  controllers: [AuthController],
})
export class AuthModule {}
