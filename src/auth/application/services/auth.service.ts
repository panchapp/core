import { TokenValueObject } from '@/auth/domain/value-objects/token.value-object';
import { CustomException } from '@/common/exceptions/custom.exception';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(tokenValueObject: TokenValueObject): Promise<string> {
    try {
      return await this.jwtService.signAsync(tokenValueObject);
    } catch (error) {
      throw CustomException.unauthorized('Failed to sign token', error);
    }
  }

  async verifyToken(token: string): Promise<TokenValueObject> {
    try {
      const payload =
        await this.jwtService.verifyAsync<Record<string, unknown>>(token);
      return TokenValueObject.createFromUnknown(payload);
    } catch (error) {
      throw CustomException.unauthorized('Invalid token', error);
    }
  }
}
