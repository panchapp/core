/* eslint-disable @typescript-eslint/unbound-method */
import { CustomException } from '@/common/exceptions/custom.exception';
import { UsersService } from '@/users/application/services/users.service';
import { PaginatedEntity } from '@/users/domain/entities/paginated.entity';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UsersRepository } from '@/users/domain/repositories/users.repository';
import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserFindAllValueObject } from '@/users/domain/value-objects/user-find-all.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const sampleUser = UserEntity.create({
    id: 'user-1',
    email: 'user@example.com',
    name: 'Example User',
    googleId: 'google-123',
    isSuperAdmin: false,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<UsersRepository>;

    service = new UsersService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    const findAllValueObject = UserFindAllValueObject.create({
      page: 1,
      limit: 10,
    });

    it('should return paginated users when repository finds users', async () => {
      // Arrange
      const paginatedResult: PaginatedEntity<UserEntity> = {
        items: [sampleUser],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
      };
      repository.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await service.getAll(findAllValueObject);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith(findAllValueObject);
      expect(result).toEqual(paginatedResult);
    });

    it('should wrap errors in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error finding all users');
      repository.findAll.mockRejectedValue(error);

      // Act
      const promise = service.getAll(findAllValueObject);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
    });

    it('should wrap non-CustomException errors in a CustomException', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      repository.findAll.mockRejectedValue(error);

      // Act
      const promise = service.getAll(findAllValueObject);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('An unknown error occurred');
    });
  });

  describe('getUserById', () => {
    it('should return a specific user by id when repository finds the user', async () => {
      // Arrange
      repository.findById.mockResolvedValue(sampleUser);

      // Act
      const result = await service.getById(sampleUser.id);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(sampleUser.id);
      expect(result).toEqual(sampleUser);
    });

    it('should throw CustomException.notFound when repository does not find the user by id', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act
      const promise = service.getById('missing-user');

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('User not found');
      expect(repository.findById).toHaveBeenCalledWith('missing-user');
    });

    it('should wrap errors in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error finding user by id');
      repository.findById.mockRejectedValue(error);

      // Act
      const promise = service.getById(sampleUser.id);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
    });

    it('should wrap non-CustomException errors in a CustomException', async () => {
      // Arrange
      const error = new Error('Database query failed');
      repository.findById.mockRejectedValue(error);

      // Act
      const promise = service.getById(sampleUser.id);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('An unknown error occurred');
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email when repository finds the user', async () => {
      // Arrange
      repository.findByEmail.mockResolvedValue(sampleUser);

      // Act
      const result = await service.getByEmail(sampleUser.email);

      // Assert
      expect(repository.findByEmail).toHaveBeenCalledWith(sampleUser.email);
      expect(result).toEqual(sampleUser);
    });

    it('should throw CustomException.notFound when repository does not find the user by email', async () => {
      // Arrange
      repository.findByEmail.mockResolvedValue(null);

      // Act
      const promise = service.getByEmail('missing@example.com');

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('User not found');
      expect(repository.findByEmail).toHaveBeenCalledWith(
        'missing@example.com',
      );
    });

    it('should wrap errors in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error finding user by email');
      repository.findByEmail.mockRejectedValue(error);

      // Act
      const promise = service.getByEmail(sampleUser.email);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
    });

    it('should wrap non-CustomException errors in a CustomException', async () => {
      // Arrange
      const error = new Error('Database query failed');
      repository.findByEmail.mockRejectedValue(error);

      // Act
      const promise = service.getByEmail(sampleUser.email);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('An unknown error occurred');
    });
  });

  describe('createUser', () => {
    const payload = UserCreationValueObject.create({
      email: 'new-user@example.com',
      name: 'New User',
      googleId: 'google-123',
      isSuperAdmin: false,
    });

    it('should return the created user when repository creates the user', async () => {
      // Arrange
      repository.create.mockResolvedValue(sampleUser);

      // Act
      const result = await service.create(payload);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(sampleUser);
    });

    it('should throw CustomException.internalServerError when repository does not create the user', async () => {
      // Arrange
      repository.create.mockResolvedValue(null);

      // Act
      const promise = service.create(payload);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('Failed to create user');
      expect(repository.create).toHaveBeenCalledWith(payload);
    });

    it('should wrap errors in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error creating user');
      repository.create.mockRejectedValue(error);

      // Act
      const promise = service.create(payload);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
    });

    it('should wrap non-CustomException errors in a CustomException', async () => {
      // Arrange
      const error = new Error('Unique constraint violation');
      repository.create.mockRejectedValue(error);

      // Act
      const promise = service.create(payload);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('An unknown error occurred');
    });
  });

  describe('updateUser', () => {
    const updates = UserUpdateValueObject.create({
      name: 'Updated Name',
      isSuperAdmin: true,
    });

    it('should return the updated user when repository updates the user', async () => {
      // Arrange
      const updatedUser = UserEntity.create({
        id: sampleUser.id,
        email: sampleUser.email,
        name: updates.name ?? sampleUser.name,
        isSuperAdmin: updates.isSuperAdmin ?? sampleUser.isSuperAdmin,
        googleId: sampleUser.googleId,
        createdAt: sampleUser.createdAt,
      });
      repository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(sampleUser.id, updates);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(sampleUser.id, updates);
      expect(repository.update).toHaveBeenCalledTimes(1);
      expect(result.name).toBe(updates.name);
      expect(result.isSuperAdmin).toBe(true);
    });

    it('should throw CustomException.notFound when repository does not update the user', async () => {
      // Arrange
      repository.update.mockResolvedValue(null);

      // Act
      const promise = service.update('missing-user', updates);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('User not found');
      expect(repository.update).toHaveBeenCalledWith('missing-user', updates);
    });

    it('should wrap errors from update in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error updating user');
      repository.update.mockRejectedValue(error);

      // Act
      const promise = service.update(sampleUser.id, updates);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
      expect(repository.update).toHaveBeenCalledWith(sampleUser.id, updates);
    });

    it('should wrap non-CustomException errors from update in a CustomException', async () => {
      // Arrange
      const error = new Error('Update constraint violation');
      repository.update.mockRejectedValue(error);

      // Act
      const promise = service.update(sampleUser.id, updates);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('An unknown error occurred');
      expect(repository.update).toHaveBeenCalledWith(sampleUser.id, updates);
    });
  });

  describe('deleteUser', () => {
    it('should delete the user successfully', async () => {
      // Arrange
      repository.delete.mockResolvedValue(sampleUser);

      // Act
      await service.delete(sampleUser.id);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(sampleUser.id);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw CustomException.notFound when repository does not delete the user', async () => {
      // Arrange
      repository.delete.mockResolvedValue(null);

      // Act
      const promise = service.delete('missing-user');

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('User not found');
      expect(repository.delete).toHaveBeenCalledWith('missing-user');
    });

    it('should wrap errors from delete in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error deleting user');
      repository.delete.mockRejectedValue(error);

      // Act
      const promise = service.delete(sampleUser.id);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
      expect(repository.delete).toHaveBeenCalledWith(sampleUser.id);
    });

    it('should wrap non-CustomException errors from delete in a CustomException', async () => {
      // Arrange
      const error = new Error('Delete constraint violation');
      repository.delete.mockRejectedValue(error);

      // Act
      const promise = service.delete(sampleUser.id);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('An unknown error occurred');
      expect(repository.delete).toHaveBeenCalledWith(sampleUser.id);
    });
  });
});
