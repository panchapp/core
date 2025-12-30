/* eslint-disable @typescript-eslint/unbound-method */
import { TokenValueObject } from '@/auth/domain/value-objects/token.value-object';
import { CustomException } from '@/common/exceptions/custom.exception';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    service = new AuthService(jwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signToken', () => {
    const tokenPayload = TokenValueObject.create({
      userId: 'user-123',
    });
    const expectedToken = 'signed-jwt-token';

    it('should sign a token successfully when jwtService signs the payload', async () => {
      // Arrange
      jwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.signToken(tokenPayload);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith(tokenPayload);
      expect(result).toBe(expectedToken);
    });

    it('should throw CustomException.unauthorized when jwtService throws an error', async () => {
      // Arrange
      const error = new Error('JWT signing failed');
      jwtService.signAsync.mockRejectedValue(error);

      // Act
      const promise = service.signToken(tokenPayload);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('Failed to sign token');
      expect(jwtService.signAsync).toHaveBeenCalledWith(tokenPayload);
    });
  });

  describe('verifyToken', () => {
    const validToken = 'valid-jwt-token';
    const decodedPayload = {
      userId: 'user-123',
      iat: 1234567890,
      exp: 1234567890,
    };

    it('should verify a token successfully when jwtService verifies the token', async () => {
      // Arrange
      jwtService.verifyAsync.mockResolvedValue(decodedPayload);
      const expectedTokenValueObject = TokenValueObject.create({
        userId: 'user-123',
      });

      // Act
      const result = await service.verifyToken(validToken);

      // Assert
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(validToken);
      expect(result).toBeInstanceOf(TokenValueObject);
      expect(result.userId).toBe('user-123');
      expect(result).toEqual(expectedTokenValueObject);
    });

    it('should throw CustomException.unauthorized when jwtService throws an error', async () => {
      // Arrange
      const error = new Error('Invalid token');
      jwtService.verifyAsync.mockRejectedValue(error);

      // Act
      const promise = service.verifyToken(validToken);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('Invalid token');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(validToken);
    });

    it('should throw CustomException when payload is missing userId', async () => {
      // Arrange
      const invalidPayload = {
        sub: 'user-123',
        iat: 1234567890,
        exp: 1234567890,
      };
      jwtService.verifyAsync.mockResolvedValue(invalidPayload);

      // Act
      const promise = service.verifyToken(validToken);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(validToken);
    });

    it('should throw CustomException when payload is null', async () => {
      // Arrange
      jwtService.verifyAsync.mockResolvedValue(
        null as unknown as Record<string, unknown>,
      );

      // Act
      const promise = service.verifyToken(validToken);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(validToken);
    });
  });
});
