import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';
import { UserCreateDto } from '@/users/infrastructure/controllers/dtos/input/user-create.dto';
import { UserUpdateDto } from '@/users/infrastructure/controllers/dtos/input/user-update.dto';
import { UserValueObjectMapper } from '@/users/infrastructure/controllers/mappers/input/user-value-object.mapper';

describe('UserValueObjectMapper', () => {
  describe('toCreationValueObject', () => {
    it('should map UserCreateDto to UserCreationValueObject with all fields', () => {
      // Arrange
      const dto: UserCreateDto = {
        email: 'user@example.com',
        name: 'Example User',
        googleId: 'google-123',
        isSuperAdmin: true,
      };

      // Act
      const result = UserValueObjectMapper.toCreationValueObject(dto);

      // Assert
      expect(result).toBeInstanceOf(UserCreationValueObject);
      expect(result.email).toBe(dto.email);
      expect(result.name).toBe(dto.name);
      expect(result.googleId).toBe(dto.googleId);
      expect(result.isSuperAdmin).toBe(dto.isSuperAdmin);
    });
  });

  describe('toUpdateValueObject', () => {
    it('should map UserUpdateDto with all fields to UserUpdateValueObject', () => {
      // Arrange
      const dto: UserUpdateDto = {
        email: 'updated@example.com',
        name: 'Updated User',
        googleId: 'google-999',
        isSuperAdmin: true,
      };

      // Act
      const result = UserValueObjectMapper.toUpdateValueObject(dto);

      // Assert
      expect(result).toBeInstanceOf(UserUpdateValueObject);
      expect(result.email).toBe(dto.email);
      expect(result.name).toBe(dto.name);
      expect(result.googleId).toBe(dto.googleId);
      expect(result.isSuperAdmin).toBe(dto.isSuperAdmin);
    });

    it('should map UserUpdateDto with only email field', () => {
      // Arrange
      const dto: UserUpdateDto = {
        email: 'newemail@example.com',
      };

      // Act
      const result = UserValueObjectMapper.toUpdateValueObject(dto);

      // Assert
      expect(result).toBeInstanceOf(UserUpdateValueObject);
      expect(result.email).toBe(dto.email);
      expect(result.name).toBeUndefined();
      expect(result.googleId).toBeUndefined();
      expect(result.isSuperAdmin).toBeUndefined();
    });

    it('should map UserUpdateDto with only name field', () => {
      // Arrange
      const dto: UserUpdateDto = {
        name: 'Updated Name',
      };

      // Act
      const result = UserValueObjectMapper.toUpdateValueObject(dto);

      // Assert
      expect(result).toBeInstanceOf(UserUpdateValueObject);
      expect(result.name).toBe(dto.name);
      expect(result.email).toBeUndefined();
      expect(result.googleId).toBeUndefined();
      expect(result.isSuperAdmin).toBeUndefined();
    });

    it('should map UserUpdateDto with only googleId field', () => {
      // Arrange
      const dto: UserUpdateDto = {
        googleId: 'google-123',
      };

      // Act
      const result = UserValueObjectMapper.toUpdateValueObject(dto);

      // Assert
      expect(result).toBeInstanceOf(UserUpdateValueObject);
      expect(result.googleId).toBe(dto.googleId);
      expect(result.email).toBeUndefined();
      expect(result.name).toBeUndefined();
      expect(result.isSuperAdmin).toBeUndefined();
    });

    it('should map UserUpdateDto with only isSuperAdmin field', () => {
      // Arrange
      const dto: UserUpdateDto = {
        isSuperAdmin: false,
      };

      // Act
      const result = UserValueObjectMapper.toUpdateValueObject(dto);

      // Assert
      expect(result).toBeInstanceOf(UserUpdateValueObject);
      expect(result.isSuperAdmin).toBe(false);
      expect(result.email).toBeUndefined();
      expect(result.name).toBeUndefined();
      expect(result.googleId).toBeUndefined();
    });

    it('should map UserUpdateDto with multiple fields', () => {
      // Arrange
      const dto: UserUpdateDto = {
        email: 'multi@example.com',
        name: 'Multi Field User',
        isSuperAdmin: true,
      };

      // Act
      const result = UserValueObjectMapper.toUpdateValueObject(dto);

      // Assert
      expect(result).toBeInstanceOf(UserUpdateValueObject);
      expect(result.email).toBe(dto.email);
      expect(result.name).toBe(dto.name);
      expect(result.isSuperAdmin).toBe(dto.isSuperAdmin);
      expect(result.googleId).toBeUndefined();
    });

    it('should map empty UserUpdateDto to UserUpdateValueObject with all undefined fields', () => {
      // Arrange
      const dto: UserUpdateDto = {};

      // Act
      const result = UserValueObjectMapper.toUpdateValueObject(dto);

      // Assert
      expect(result).toBeInstanceOf(UserUpdateValueObject);
      expect(result.email).toBeUndefined();
      expect(result.name).toBeUndefined();
      expect(result.googleId).toBeUndefined();
      expect(result.isSuperAdmin).toBeUndefined();
    });
  });
});
