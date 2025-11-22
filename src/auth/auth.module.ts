import { AuthController } from '@/auth/infrastructure/controllers/auth.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthController],
})
export class AuthModule {}
