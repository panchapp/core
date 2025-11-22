/* eslint-disable @typescript-eslint/unbound-method */
import { CustomException } from '@/common/exceptions/custom.exception';
import { UsersService } from '@/users/application/services/users.service';
import { UserCreateDto } from '@/users/domain/dtos/user-create.dto';
import { UserUpdateDto } from '@/users/domain/dtos/user-update.dto';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UsersRepository } from '@/users/domain/repositories/users.repository';

describe('UsersService', () => {
  let repository: jest.Mocked<UsersRepository>;
  let service: UsersService;

  const sampleUser = UserEntity.create({
    id: 'user-1',
    email: 'user@example.com',
    name: 'Example User',
    googleId: null,
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

  describe('getAllUsers', () => {
    it('should return all users when repository finds users', async () => {
      // Arrange
      repository.findAll.mockResolvedValue([sampleUser]);

      // Act
      const result = await service.getAllUsers();

      // Assert
      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([sampleUser]);
    });

    it('should return an empty array when repository finds no users', async () => {
      // Arrange
      repository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.getAllUsers();

      // Assert
      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should wrap errors in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error finding all users');
      repository.findAll.mockRejectedValue(error);

      // Act
      const promise = service.getAllUsers();

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
    });

    it('should wrap non-CustomException errors in a CustomException', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      repository.findAll.mockRejectedValue(error);

      // Act
      const promise = service.getAllUsers();

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
      const result = await service.getUserById(sampleUser.id);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(sampleUser.id);
      expect(result).toEqual(sampleUser);
    });

    it('should return null when repository does not find the user by id', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act
      const result = await service.getUserById('missing-user');

      // Assert
      expect(repository.findById).toHaveBeenCalledWith('missing-user');
      expect(result).toBeNull();
    });

    it('should wrap errors in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error finding user by id');
      repository.findById.mockRejectedValue(error);

      // Act
      const promise = service.getUserById(sampleUser.id);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
    });

    it('should wrap non-CustomException errors in a CustomException', async () => {
      // Arrange
      const error = new Error('Database query failed');
      repository.findById.mockRejectedValue(error);

      // Act
      const promise = service.getUserById(sampleUser.id);

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
      const result = await service.getUserByEmail(sampleUser.email);

      // Assert
      expect(repository.findByEmail).toHaveBeenCalledWith(sampleUser.email);
      expect(result).toEqual(sampleUser);
    });

    it('should return null when repository does not find the user by email', async () => {
      // Arrange
      repository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.getUserByEmail('missing@example.com');

      // Assert
      expect(repository.findByEmail).toHaveBeenCalledWith(
        'missing@example.com',
      );
      expect(result).toBeNull();
    });

    it('should wrap errors in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error finding user by email');
      repository.findByEmail.mockRejectedValue(error);

      // Act
      const promise = service.getUserByEmail(sampleUser.email);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
    });

    it('should wrap non-CustomException errors in a CustomException', async () => {
      // Arrange
      const error = new Error('Database query failed');
      repository.findByEmail.mockRejectedValue(error);

      // Act
      const promise = service.getUserByEmail(sampleUser.email);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('An unknown error occurred');
    });
  });

  describe('createUser', () => {
    const payload: UserCreateDto = {
      email: 'new-user@example.com',
      name: 'New User',
      isSuperAdmin: false,
      googleId: null,
    };

    it('should return the created user when repository creates the user', async () => {
      // Arrange
      repository.create.mockResolvedValue(sampleUser);

      // Act
      const result = await service.createUser(payload);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(sampleUser);
    });

    it('should return null when repository does not create the user', async () => {
      // Arrange
      repository.create.mockResolvedValue(null);

      // Act
      const result = await service.createUser(payload);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(payload);
      expect(result).toBeNull();
    });

    it('should wrap errors in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error creating user');
      repository.create.mockRejectedValue(error);

      // Act
      const promise = service.createUser(payload);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
    });

    it('should wrap non-CustomException errors in a CustomException', async () => {
      // Arrange
      const error = new Error('Unique constraint violation');
      repository.create.mockRejectedValue(error);

      // Act
      const promise = service.createUser(payload);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('An unknown error occurred');
    });
  });

  describe('updateUser', () => {
    const updates: UserUpdateDto = {
      name: 'Updated Name',
      isSuperAdmin: true,
    };

    it('should return the updated user when repository updates the user', async () => {
      // Arrange
      repository.update.mockResolvedValue(
        UserEntity.create({
          id: sampleUser.id,
          email: sampleUser.email,
          name: updates.name ?? sampleUser.name,
          isSuperAdmin: updates.isSuperAdmin ?? sampleUser.isSuperAdmin,
          googleId: sampleUser.googleId,
          createdAt: sampleUser.createdAt,
        }),
      );

      // Act
      const result = await service.updateUser(sampleUser.id, updates);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(sampleUser.id, updates);
      expect(result?.name).toBe(updates.name);
      expect(result?.isSuperAdmin).toBe(true);
    });

    it('should return null when repository does not update the user', async () => {
      // Arrange
      repository.update.mockResolvedValue(null);

      // Act
      const result = await service.updateUser(sampleUser.id, updates);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(sampleUser.id, updates);
      expect(result).toBeNull();
    });

    it('should wrap errors in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error updating user');
      repository.update.mockRejectedValue(error);

      // Act
      const promise = service.updateUser(sampleUser.id, updates);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
    });

    it('should wrap non-CustomException errors in a CustomException', async () => {
      // Arrange
      const error = new Error('Update constraint violation');
      repository.update.mockRejectedValue(error);

      // Act
      const promise = service.updateUser(sampleUser.id, updates);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('An unknown error occurred');
    });
  });

  describe('deleteUser', () => {
    it('should delete the user', async () => {
      // Arrange
      repository.delete.mockResolvedValue();

      // Act
      await service.deleteUser(sampleUser.id);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(sampleUser.id);
    });

    it('should wrap errors in a CustomException', async () => {
      // Arrange
      const error = CustomException.persistence('Error deleting user');
      repository.delete.mockRejectedValue(error);

      // Act
      const promise = service.deleteUser(sampleUser.id);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow(error);
    });

    it('should wrap non-CustomException errors in a CustomException', async () => {
      // Arrange
      const error = new Error('Delete constraint violation');
      repository.delete.mockRejectedValue(error);

      // Act
      const promise = service.deleteUser(sampleUser.id);

      // Assert
      await expect(promise).rejects.toThrow(CustomException);
      await expect(promise).rejects.toThrow('An unknown error occurred');
    });
  });
});
