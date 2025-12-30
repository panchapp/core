import { AuthService } from '@/auth/application/services/auth.service';
import { AuthController } from '@/auth/infrastructure/controllers/auth.controller';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('auth.jwtSecret');
        const expiresIn = configService.get<number>('auth.jwtExpirationTime');
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
