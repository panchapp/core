import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';
import { UserPersistenceMapper } from '@/users/infrastructure/repositories/mappers/user-persistence.mapper';
import { UserDbModel } from '@/users/infrastructure/repositories/models/user-db.model';

describe('UserPersistenceMapper', () => {
  describe('toEntity', () => {
    it('should map UserDbModel to UserEntity with all fields', () => {
      // Arrange
      const dbModel: UserDbModel = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Example User',
        google_id: 'google-123',
        is_super_admin: true,
        created_at: new Date('2024-01-01T00:00:00.000Z'),
      };

      // Act
      const result = UserPersistenceMapper.toEntity(dbModel);

      // Assert
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe(dbModel.id);
      expect(result.email).toBe(dbModel.email);
      expect(result.name).toBe(dbModel.name);
      expect(result.googleId).toBe(dbModel.google_id);
      expect(result.isSuperAdmin).toBe(dbModel.is_super_admin);
      expect(result.createdAt).toEqual(dbModel.created_at);
    });

    it('should correctly map snake_case fields to camelCase', () => {
      // Arrange
      const dbModel: UserDbModel = {
        id: 'user-3',
        email: 'user3@example.com',
        name: 'Test User',
        google_id: 'google-456',
        is_super_admin: false,
        created_at: new Date('2024-03-01T00:00:00.000Z'),
      };

      // Act
      const result = UserPersistenceMapper.toEntity(dbModel);

      // Assert
      expect(result.googleId).toBe(dbModel.google_id);
      expect(result.isSuperAdmin).toBe(dbModel.is_super_admin);
      expect(result.createdAt).toEqual(dbModel.created_at);
    });

    it('should preserve Date object from created_at', () => {
      // Arrange
      const createdAt = new Date('2024-04-01T12:30:45.123Z');
      const dbModel: UserDbModel = {
        id: 'user-4',
        email: 'user4@example.com',
        name: 'Date Test User',
        google_id: 'google-456',
        is_super_admin: true,
        created_at: createdAt,
      };

      // Act
      const result = UserPersistenceMapper.toEntity(dbModel);

      // Assert
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBe(createdAt.getTime());
    });
  });

  describe('toDbModelFromCreationValueObject', () => {
    it('should map full UserCreationValueObject to UserDbModel with all fields', () => {
      // Arrange
      const valueObject = UserCreationValueObject.create({
        email: 'user@example.com',
        name: 'Example User',
        googleId: 'google-123',
        isSuperAdmin: true,
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromCreationValueObject(valueObject);

      // Assert
      expect(result).toEqual({
        email: 'user@example.com',
        name: 'Example User',
        google_id: 'google-123',
        is_super_admin: true,
      });
    });

    it('should correctly map camelCase fields to snake_case', () => {
      // Arrange
      const valueObject = UserCreationValueObject.create({
        email: 'user3@example.com',
        name: 'Test User',
        googleId: 'google-456',
        isSuperAdmin: true,
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromCreationValueObject(valueObject);

      // Assert
      expect(result.google_id).toBe(valueObject.googleId);
      expect(result.is_super_admin).toBe(valueObject.isSuperAdmin);
    });

    it('should map all required fields from UserCreationValueObject', () => {
      // Arrange
      const valueObject = UserCreationValueObject.create({
        email: 'newuser@example.com',
        name: 'New User',
        googleId: 'google-789',
        isSuperAdmin: false,
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromCreationValueObject(valueObject);

      // Assert
      expect(result.email).toBe(valueObject.email);
      expect(result.name).toBe(valueObject.name);
      expect(result.google_id).toBe(valueObject.googleId);
      expect(result.is_super_admin).toBe(valueObject.isSuperAdmin);
    });
  });

  describe('toDbModelFromUpdateValueObject', () => {
    it('should map UserUpdateValueObject with all fields to UserDbModel', () => {
      // Arrange
      const valueObject = UserUpdateValueObject.create({
        email: 'updated@example.com',
        name: 'Updated User',
        googleId: 'google-789',
        isSuperAdmin: false,
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromUpdateValueObject(valueObject);

      // Assert
      expect(result).toEqual({
        email: 'updated@example.com',
        name: 'Updated User',
        google_id: 'google-789',
        is_super_admin: false,
      });
    });

    it('should map UserUpdateValueObject with only name field', () => {
      // Arrange
      const valueObject = UserUpdateValueObject.create({
        name: 'Updated Name',
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromUpdateValueObject(valueObject);

      // Assert
      expect(result).toEqual({
        name: 'Updated Name',
      });
    });

    it('should map UserUpdateValueObject with only email field', () => {
      // Arrange
      const valueObject = UserUpdateValueObject.create({
        email: 'newemail@example.com',
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromUpdateValueObject(valueObject);

      // Assert
      expect(result).toEqual({
        email: 'newemail@example.com',
      });
    });

    it('should map UserUpdateValueObject with only googleId field', () => {
      // Arrange
      const valueObject = UserUpdateValueObject.create({
        googleId: 'google-999',
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromUpdateValueObject(valueObject);

      // Assert
      expect(result).toEqual({
        google_id: 'google-999',
      });
    });

    it('should map UserUpdateValueObject with only isSuperAdmin field', () => {
      // Arrange
      const valueObject = UserUpdateValueObject.create({
        isSuperAdmin: true,
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromUpdateValueObject(valueObject);

      // Assert
      expect(result).toEqual({
        is_super_admin: true,
      });
    });

    it('should map UserUpdateValueObject with multiple fields', () => {
      // Arrange
      const valueObject = UserUpdateValueObject.create({
        email: 'multi@example.com',
        name: 'Multi Field User',
        isSuperAdmin: true,
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromUpdateValueObject(valueObject);

      // Assert
      expect(result).toEqual({
        email: 'multi@example.com',
        name: 'Multi Field User',
        is_super_admin: true,
      });
    });

    it('should skip undefined fields in UserUpdateValueObject', () => {
      // Arrange
      const valueObject = UserUpdateValueObject.create({
        name: 'Test User',
        email: undefined,
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromUpdateValueObject(valueObject);

      // Assert
      expect(result).toEqual({
        name: 'Test User',
      });
      expect(result.email).toBeUndefined();
      expect(result.google_id).toBeUndefined();
      expect(result.is_super_admin).toBeUndefined();
    });

    it('should handle boolean false value for isSuperAdmin', () => {
      // Arrange
      const valueObject = UserUpdateValueObject.create({
        isSuperAdmin: false,
      });

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromUpdateValueObject(valueObject);

      // Assert
      expect(result.is_super_admin).toBe(false);
    });

    it('should return empty object for UserUpdateValueObject with no fields', () => {
      // Arrange
      const valueObject = UserUpdateValueObject.create({});

      // Act
      const result =
        UserPersistenceMapper.toDbModelFromUpdateValueObject(valueObject);

      // Assert
      expect(result).toEqual({});
    });
  });
});
