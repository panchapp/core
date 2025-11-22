import { UserEntity } from '@/users/domain/entities/user.entity';
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

    it('should map UserDbModel to UserEntity with null google_id', () => {
      // Arrange
      const dbModel: UserDbModel = {
        id: 'user-2',
        email: 'user2@example.com',
        name: 'Another User',
        google_id: null,
        is_super_admin: false,
        created_at: new Date('2024-02-01T00:00:00.000Z'),
      };

      // Act
      const result = UserPersistenceMapper.toEntity(dbModel);

      // Assert
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe(dbModel.id);
      expect(result.email).toBe(dbModel.email);
      expect(result.name).toBe(dbModel.name);
      expect(result.googleId).toBeNull();
      expect(result.isSuperAdmin).toBe(false);
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
        google_id: null,
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

  describe('toDbModel', () => {
    it('should map full UserEntity to UserDbModel with all fields', () => {
      // Arrange
      const entity = UserEntity.create({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Example User',
        googleId: 'google-123',
        isSuperAdmin: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      });

      // Act
      const result = UserPersistenceMapper.toDbModel(entity);

      // Assert
      expect(result).toEqual({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Example User',
        google_id: 'google-123',
        is_super_admin: true,
        created_at: new Date('2024-01-01T00:00:00.000Z'),
      });
    });

    it('should map UserEntity with null googleId to UserDbModel (excluding null)', () => {
      // Arrange
      const entity = UserEntity.create({
        id: 'user-2',
        email: 'user2@example.com',
        name: 'Another User',
        googleId: null,
        isSuperAdmin: false,
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
      });

      // Act
      const result = UserPersistenceMapper.toDbModel(entity);

      // Assert
      expect(result).toEqual({
        id: 'user-2',
        email: 'user2@example.com',
        name: 'Another User',
        is_super_admin: false,
        created_at: new Date('2024-02-01T00:00:00.000Z'),
      });
      expect(result.google_id).toBeUndefined();
    });

    it('should correctly map camelCase fields to snake_case', () => {
      // Arrange
      const entity = UserEntity.create({
        id: 'user-3',
        email: 'user3@example.com',
        name: 'Test User',
        googleId: 'google-456',
        isSuperAdmin: true,
        createdAt: new Date('2024-03-01T00:00:00.000Z'),
      });

      // Act
      const result = UserPersistenceMapper.toDbModel(entity);

      // Assert
      expect(result.google_id).toBe(entity.googleId);
      expect(result.is_super_admin).toBe(entity.isSuperAdmin);
      expect(result.created_at).toEqual(entity.createdAt);
    });

    it('should map partial entity with only id field', () => {
      // Arrange
      const partialEntity = { id: 'user-4' };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result).toEqual({
        id: 'user-4',
      });
    });

    it('should map partial entity with only email field', () => {
      // Arrange
      const partialEntity = { email: 'user5@example.com' };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result).toEqual({
        email: 'user5@example.com',
      });
    });

    it('should map partial entity with only name field', () => {
      // Arrange
      const partialEntity = { name: 'Partial User' };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result).toEqual({
        name: 'Partial User',
      });
    });

    it('should map partial entity with only googleId field', () => {
      // Arrange
      const partialEntity = { googleId: 'google-789' };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result).toEqual({
        google_id: 'google-789',
      });
    });

    it('should map partial entity with only isSuperAdmin field', () => {
      // Arrange
      const partialEntity = { isSuperAdmin: true };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result).toEqual({
        is_super_admin: true,
      });
    });

    it('should map partial entity with only createdAt field', () => {
      // Arrange
      const createdAt = new Date('2024-05-01T00:00:00.000Z');
      const partialEntity = { createdAt };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result).toEqual({
        created_at: createdAt,
      });
    });

    it('should map partial entity with multiple fields', () => {
      // Arrange
      const partialEntity = {
        id: 'user-6',
        email: 'user6@example.com',
        name: 'Multi Field User',
      };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result).toEqual({
        id: 'user-6',
        email: 'user6@example.com',
        name: 'Multi Field User',
      });
    });

    it('should skip undefined fields in partial entity', () => {
      // Arrange
      const partialEntity = {
        id: 'user-7',
        email: undefined,
        name: 'Test User',
        googleId: undefined,
      };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result).toEqual({
        id: 'user-7',
        name: 'Test User',
      });
      expect(result.email).toBeUndefined();
      expect(result.google_id).toBeUndefined();
    });

    it('should skip null fields in partial entity', () => {
      // Arrange
      const partialEntity = {
        id: 'user-8',
        email: 'user8@example.com',
        googleId: null,
      };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result).toEqual({
        id: 'user-8',
        email: 'user8@example.com',
      });
      expect(result.google_id).toBeUndefined();
    });

    it('should return empty object for empty partial entity', () => {
      // Arrange
      const partialEntity = {};

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result).toEqual({});
    });

    it('should exclude null googleId when mapping to DB model', () => {
      // Arrange
      const entity = UserEntity.create({
        id: 'user-9',
        email: 'user9@example.com',
        name: 'Null Google User',
        googleId: null,
        isSuperAdmin: false,
        createdAt: new Date('2024-06-01T00:00:00.000Z'),
      });

      // Act
      const result = UserPersistenceMapper.toDbModel(entity);

      // Assert
      expect(result.google_id).toBeUndefined();
      expect(result).toEqual({
        id: 'user-9',
        email: 'user9@example.com',
        name: 'Null Google User',
        is_super_admin: false,
        created_at: new Date('2024-06-01T00:00:00.000Z'),
      });
    });

    it('should handle boolean false value for isSuperAdmin', () => {
      // Arrange
      const partialEntity = { isSuperAdmin: false };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result.is_super_admin).toBe(false);
    });

    it('should preserve Date object in createdAt field', () => {
      // Arrange
      const createdAt = new Date('2024-07-01T15:45:30.789Z');
      const partialEntity = {
        id: 'user-10',
        createdAt,
      };

      // Act
      const result = UserPersistenceMapper.toDbModel(partialEntity);

      // Assert
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.created_at?.getTime()).toBe(createdAt.getTime());
    });
  });
});
