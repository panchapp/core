import { handlePgDatabaseError } from '@/common/utils/pg-database-error.util';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { USERS_TABLE_TOKEN } from '@/users/domain/tokens/users.tokens';
import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';
import { KnexUsersRepository } from '@/users/infrastructure/repositories/knex-users.repository';
import { UserPersistenceMapper } from '@/users/infrastructure/repositories/mappers/user-persistence.mapper';
import { UserDbModel } from '@/users/infrastructure/repositories/models/user-db.model';
import { Knex } from 'knex';

// Mock the mapper
jest.mock(
  '@/users/infrastructure/repositories/mappers/user-persistence.mapper',
);

// Mock the pg-database-error utility
jest.mock('@/common/utils/pg-database-error.util');

describe('KnexUsersRepository', () => {
  let repository: KnexUsersRepository;
  let mockKnex: jest.MockedFunction<any>;
  let mockQueryBuilder: {
    select: jest.Mock;
    where: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    returning: jest.Mock;
    first: jest.Mock;
    limit: jest.Mock;
  };
  let toEntitySpy: jest.SpyInstance;
  let toDbModelFromCreationValueObjectSpy: jest.SpyInstance;
  let toDbModelFromUpdateValueObjectSpy: jest.SpyInstance;

  const sampleDbUser: UserDbModel = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Example User',
    google_id: 'google-123',
    is_super_admin: true,
    created_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  const sampleEntity = UserEntity.create({
    id: 'user-1',
    email: 'user@example.com',
    name: 'Example User',
    googleId: 'google-123',
    isSuperAdmin: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    // Create a mock query builder
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      first: jest.fn(),
      limit: jest.fn().mockReturnThis(),
    };

    // Create a mock Knex instance as a function
    mockKnex = jest.fn().mockImplementation((tableName: string) => {
      expect(tableName).toBe(USERS_TABLE_TOKEN);
      return mockQueryBuilder;
    });

    // Create spies for the mapper methods
    toEntitySpy = jest.spyOn(UserPersistenceMapper, 'toEntity');
    toDbModelFromCreationValueObjectSpy = jest.spyOn(
      UserPersistenceMapper,
      'toDbModelFromCreationValueObject',
    );
    toDbModelFromUpdateValueObjectSpy = jest.spyOn(
      UserPersistenceMapper,
      'toDbModelFromUpdateValueObject',
    );

    // Create repository instance
    repository = new KnexUsersRepository(mockKnex as unknown as Knex);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users when database returns users', async () => {
      // Arrange
      const dbUsers = [sampleDbUser];
      mockQueryBuilder.select.mockResolvedValue(dbUsers);
      toEntitySpy.mockReturnValue(sampleEntity);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(toEntitySpy).toHaveBeenCalledWith(sampleDbUser);
      expect(result).toEqual([sampleEntity]);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when database returns no users', async () => {
      // Arrange
      mockQueryBuilder.select.mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(toEntitySpy).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should map multiple users correctly', async () => {
      // Arrange
      const dbUsers = [
        sampleDbUser,
        {
          ...sampleDbUser,
          id: 'user-2',
          email: 'user2@example.com',
        },
      ];
      const entity2 = UserEntity.create({
        ...sampleEntity,
        id: 'user-2',
        email: 'user2@example.com',
      });
      mockQueryBuilder.select.mockResolvedValue(dbUsers);
      toEntitySpy
        .mockReturnValueOnce(sampleEntity)
        .mockReturnValueOnce(entity2);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(toEntitySpy).toHaveBeenCalledTimes(2);
      expect(result[0]).toEqual(sampleEntity);
      expect(result[1]).toEqual(entity2);
    });

    it('should call handlePgDatabaseError when database error occurs', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockQueryBuilder.select.mockRejectedValue(dbError);
      (handlePgDatabaseError as jest.Mock).mockReturnValue(
        new Error('handled error'),
      );

      // Act
      await repository.findAll().catch(() => undefined);

      // Assert
      expect(handlePgDatabaseError).toHaveBeenCalledWith(
        dbError,
        'Error finding all users',
      );
    });
  });

  describe('findById', () => {
    it('should return user when found by id', async () => {
      // Arrange
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.first.mockResolvedValue(sampleDbUser);
      toEntitySpy.mockReturnValue(sampleEntity);

      // Act
      const result = await repository.findById('user-1');

      // Assert
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 'user-1' });
      expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
      expect(toEntitySpy).toHaveBeenCalledWith(sampleDbUser);
      expect(result).toEqual(sampleEntity);
    });

    it('should return null when user not found by id', async () => {
      // Arrange
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      const result = await repository.findById('non-existent-id');

      // Assert
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        id: 'non-existent-id',
      });
      expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
      expect(toEntitySpy).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should call handlePgDatabaseError when database error occurs', async () => {
      // Arrange
      const dbError = new Error('Database query failed');
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.first.mockRejectedValue(dbError);
      (handlePgDatabaseError as jest.Mock).mockReturnValue(
        new Error('handled error'),
      );

      // Act
      await repository.findById('user-1').catch(() => undefined);

      // Assert
      expect(handlePgDatabaseError).toHaveBeenCalledWith(
        dbError,
        'Error finding user by id',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      // Arrange
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.first.mockResolvedValue(sampleDbUser);
      toEntitySpy.mockReturnValue(sampleEntity);

      // Act
      const result = await repository.findByEmail('user@example.com');

      // Assert
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        email: 'user@example.com',
      });
      expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
      expect(toEntitySpy).toHaveBeenCalledWith(sampleDbUser);
      expect(result).toEqual(sampleEntity);
    });

    it('should return null when user not found by email', async () => {
      // Arrange
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      const result = await repository.findByEmail('missing@example.com');

      // Assert
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        email: 'missing@example.com',
      });
      expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
      expect(toEntitySpy).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should call handlePgDatabaseError when database error occurs', async () => {
      // Arrange
      const dbError = new Error('Database query failed');
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.first.mockRejectedValue(dbError);
      (handlePgDatabaseError as jest.Mock).mockReturnValue(
        new Error('handled error'),
      );

      // Act
      await repository.findByEmail('user@example.com').catch(() => undefined);

      // Assert
      expect(handlePgDatabaseError).toHaveBeenCalledWith(
        dbError,
        'Error finding user by email',
      );
    });
  });

  describe('create', () => {
    const createDto = UserCreationValueObject.create({
      email: 'new-user@example.com',
      name: 'New User',
      googleId: 'google-123',
      isSuperAdmin: false,
    });

    const dbModelForCreate: Partial<UserDbModel> = {
      email: 'new-user@example.com',
      name: 'New User',
      google_id: 'google-123',
      is_super_admin: false,
    };

    const createdDbUser: UserDbModel = {
      id: 'user-new',
      email: 'new-user@example.com',
      name: 'New User',
      google_id: 'google-123',
      is_super_admin: false,
      created_at: new Date('2024-01-02T00:00:00.000Z'),
    };

    const createdEntity = UserEntity.create({
      id: 'user-new',
      email: 'new-user@example.com',
      name: 'New User',
      googleId: 'google-123',
      isSuperAdmin: false,
      createdAt: new Date('2024-01-02T00:00:00.000Z'),
    });

    it('should create and return user when successful', async () => {
      // Arrange
      toDbModelFromCreationValueObjectSpy.mockReturnValue(dbModelForCreate);
      mockQueryBuilder.insert.mockReturnThis();
      mockQueryBuilder.returning.mockResolvedValue([createdDbUser]);
      toEntitySpy.mockReturnValue(createdEntity);

      // Act
      const result = await repository.create(createDto);

      // Assert
      expect(toDbModelFromCreationValueObjectSpy).toHaveBeenCalledWith(
        createDto,
      );
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(dbModelForCreate);
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith('*');
      expect(toEntitySpy).toHaveBeenCalledWith(createdDbUser);
      expect(result).toEqual(createdEntity);
    });

    it('should return null when insert returns no result', async () => {
      // Arrange
      toDbModelFromCreationValueObjectSpy.mockReturnValue(dbModelForCreate);
      mockQueryBuilder.insert.mockReturnThis();
      mockQueryBuilder.returning.mockResolvedValue(undefined);

      // Act
      const result = await repository.create(createDto);

      // Assert
      expect(toDbModelFromCreationValueObjectSpy).toHaveBeenCalledWith(
        createDto,
      );
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(dbModelForCreate);
      expect(toEntitySpy).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should call handlePgDatabaseError when database error occurs', async () => {
      // Arrange
      const dbError = new Error('Unique constraint violation');
      toDbModelFromCreationValueObjectSpy.mockReturnValue(dbModelForCreate);
      mockQueryBuilder.insert.mockReturnThis();
      mockQueryBuilder.returning.mockRejectedValue(dbError);
      (handlePgDatabaseError as jest.Mock).mockReturnValue(
        new Error('handled error'),
      );

      // Act
      await repository.create(createDto).catch(() => undefined);

      // Assert
      expect(handlePgDatabaseError).toHaveBeenCalledWith(
        dbError,
        'Error creating user',
      );
    });

    it('should call handlePgDatabaseError when unique constraint violation occurs', async () => {
      // Arrange
      const pgError = {
        code: '23505',
        detail: 'Key (email)=(test@example.com) already exists.',
        constraint: 'users_email_unique',
        table: 'users',
        column: 'email',
      };
      toDbModelFromCreationValueObjectSpy.mockReturnValue(dbModelForCreate);
      mockQueryBuilder.insert.mockReturnThis();
      mockQueryBuilder.returning.mockRejectedValue(pgError);
      (handlePgDatabaseError as jest.Mock).mockReturnValue(
        new Error('handled error'),
      );

      // Act
      await repository.create(createDto).catch(() => undefined);

      // Assert
      expect(handlePgDatabaseError).toHaveBeenCalledWith(
        pgError,
        'Error creating user',
      );
    });
  });

  describe('update', () => {
    const updateDto = UserUpdateValueObject.create({
      name: 'Updated Name',
      isSuperAdmin: true,
    });

    const dbModelForUpdate: Partial<UserDbModel> = {
      name: 'Updated Name',
      is_super_admin: true,
    };

    const updatedDbUser: UserDbModel = {
      ...sampleDbUser,
      name: 'Updated Name',
      is_super_admin: true,
    };

    const updatedEntity = UserEntity.create({
      ...sampleEntity,
      name: 'Updated Name',
      isSuperAdmin: true,
    });

    it('should update and return user when successful', async () => {
      // Arrange
      toDbModelFromUpdateValueObjectSpy.mockReturnValue(dbModelForUpdate);
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.limit.mockReturnThis();
      mockQueryBuilder.update.mockReturnThis();
      mockQueryBuilder.returning.mockResolvedValue([updatedDbUser]);
      toEntitySpy.mockReturnValue(updatedEntity);

      // Act
      const result = await repository.update('user-1', updateDto);

      // Assert
      expect(toDbModelFromUpdateValueObjectSpy).toHaveBeenCalledWith(updateDto);
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 'user-1' });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(dbModelForUpdate);
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith('*');
      expect(toEntitySpy).toHaveBeenCalledWith(updatedDbUser);
      expect(result).toEqual(updatedEntity);
    });

    it('should return null when update returns no result', async () => {
      // Arrange
      toDbModelFromUpdateValueObjectSpy.mockReturnValue(dbModelForUpdate);
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.limit.mockReturnThis();
      mockQueryBuilder.update.mockReturnThis();
      mockQueryBuilder.returning.mockResolvedValue(undefined);

      // Act
      const result = await repository.update('user-1', updateDto);

      // Assert
      expect(toDbModelFromUpdateValueObjectSpy).toHaveBeenCalledWith(updateDto);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 'user-1' });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(dbModelForUpdate);
      expect(toEntitySpy).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return user from findById when update object is empty', async () => {
      // Arrange
      const emptyUpdateDto = UserUpdateValueObject.create({});
      const emptyDbModel: Partial<UserDbModel> = {};
      toDbModelFromUpdateValueObjectSpy.mockReturnValue(emptyDbModel);
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.first.mockResolvedValue(sampleDbUser);
      toEntitySpy.mockReturnValue(sampleEntity);

      // Act
      const result = await repository.update('user-1', emptyUpdateDto);

      // Assert
      expect(toDbModelFromUpdateValueObjectSpy).toHaveBeenCalledWith(
        emptyUpdateDto,
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 'user-1' });
      expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.update).not.toHaveBeenCalled();
      expect(mockQueryBuilder.limit).not.toHaveBeenCalled();
      expect(mockQueryBuilder.returning).not.toHaveBeenCalled();
      expect(toEntitySpy).toHaveBeenCalledWith(sampleDbUser);
      expect(result).toEqual(sampleEntity);
    });

    it('should return null from findById when update object is empty and user not found', async () => {
      // Arrange
      const emptyUpdateDto = UserUpdateValueObject.create({});
      const emptyDbModel: Partial<UserDbModel> = {};
      toDbModelFromUpdateValueObjectSpy.mockReturnValue(emptyDbModel);
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      const result = await repository.update('non-existent-id', emptyUpdateDto);

      // Assert
      expect(toDbModelFromUpdateValueObjectSpy).toHaveBeenCalledWith(
        emptyUpdateDto,
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        id: 'non-existent-id',
      });
      expect(mockQueryBuilder.first).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.update).not.toHaveBeenCalled();
      expect(mockQueryBuilder.limit).not.toHaveBeenCalled();
      expect(mockQueryBuilder.returning).not.toHaveBeenCalled();
      expect(toEntitySpy).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should call handlePgDatabaseError when database error occurs', async () => {
      // Arrange
      const dbError = new Error('Update constraint violation');
      toDbModelFromUpdateValueObjectSpy.mockReturnValue(dbModelForUpdate);
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.limit.mockReturnThis();
      mockQueryBuilder.update.mockReturnThis();
      mockQueryBuilder.returning.mockRejectedValue(dbError);
      (handlePgDatabaseError as jest.Mock).mockReturnValue(
        new Error('handled error'),
      );

      // Act
      await repository.update('user-1', updateDto).catch(() => undefined);

      // Assert
      expect(handlePgDatabaseError).toHaveBeenCalledWith(
        dbError,
        'Error updating user',
      );
    });
  });

  describe('delete', () => {
    it('should delete user successfully and return the deleted user', async () => {
      // Arrange
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.limit.mockReturnThis();
      mockQueryBuilder.delete.mockReturnThis();
      mockQueryBuilder.returning.mockResolvedValue([sampleDbUser]);
      toEntitySpy.mockReturnValue(sampleEntity);

      // Act
      const result = await repository.delete('user-1');

      // Assert
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 'user-1' });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
      expect(mockQueryBuilder.delete).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith('*');
      expect(toEntitySpy).toHaveBeenCalledWith(sampleDbUser);
      expect(result).toEqual(sampleEntity);
    });

    it('should return null when delete returns no result', async () => {
      // Arrange
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.limit.mockReturnThis();
      mockQueryBuilder.delete.mockReturnThis();
      mockQueryBuilder.returning.mockResolvedValue(undefined);

      // Act
      const result = await repository.delete('non-existent-id');

      // Assert
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        id: 'non-existent-id',
      });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
      expect(mockQueryBuilder.delete).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith('*');
      expect(toEntitySpy).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when delete returns empty array', async () => {
      // Arrange
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.limit.mockReturnThis();
      mockQueryBuilder.delete.mockReturnThis();
      mockQueryBuilder.returning.mockResolvedValue([]);

      // Act
      const result = await repository.delete('non-existent-id');

      // Assert
      expect(mockKnex).toHaveBeenCalledWith(USERS_TABLE_TOKEN);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        id: 'non-existent-id',
      });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
      expect(mockQueryBuilder.delete).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith('*');
      expect(toEntitySpy).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should call handlePgDatabaseError when database error occurs', async () => {
      // Arrange
      const dbError = new Error('Delete constraint violation');
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.limit.mockReturnThis();
      mockQueryBuilder.delete.mockReturnThis();
      mockQueryBuilder.returning.mockRejectedValue(dbError);
      (handlePgDatabaseError as jest.Mock).mockReturnValue(
        new Error('handled error'),
      );

      // Act
      await repository.delete('user-1').catch(() => undefined);

      // Assert
      expect(handlePgDatabaseError).toHaveBeenCalledWith(
        dbError,
        'Error deleting user',
      );
    });
  });
});
