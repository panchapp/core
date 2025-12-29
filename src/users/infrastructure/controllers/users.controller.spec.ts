/* eslint-disable @typescript-eslint/unbound-method */
import { UsersService } from '@/users/application/services/users.service';
import { PaginatedEntity } from '@/users/domain/entities/paginated.entity';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserCreationValueObject } from '@/users/domain/value-objects/user-creation.value-object';
import { UserFindAllValueObject } from '@/users/domain/value-objects/user-find-all.value-object';
import { UserUpdateValueObject } from '@/users/domain/value-objects/user-update.value-object';
import { UserCreateDto } from '@/users/infrastructure/controllers/dtos/input/user-create.dto';
import { UserFindAllDto } from '@/users/infrastructure/controllers/dtos/input/user-find-all.dto';
import { UserFindByEmailDto } from '@/users/infrastructure/controllers/dtos/input/user-find-by-email.dto';
import { UserFindByIdDto } from '@/users/infrastructure/controllers/dtos/input/user-find-by-id.dto';
import { UserUpdateDto } from '@/users/infrastructure/controllers/dtos/input/user-update.dto';
import { UserDto } from '@/users/infrastructure/controllers/dtos/output/user.dto';
import { UserDtoMapper } from '@/users/infrastructure/controllers/mappers/output/user-dto.mapper';
import { UsersController } from '@/users/infrastructure/controllers/users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const sampleUser = UserEntity.create({
    id: 'user-1',
    email: 'user@example.com',
    name: 'Example User',
    googleId: 'google-123',
    isSuperAdmin: false,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  });

  const sampleUserDto: UserDto = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Example User',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    isSuperAdmin: false,
  };

  beforeEach(() => {
    usersService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      getByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    controller = new UsersController(usersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated UserDto when users are found', async () => {
      // Arrange
      const queryDto: UserFindAllDto = {
        page: 1,
        limit: 10,
      };
      const paginatedEntity: PaginatedEntity<UserEntity> = {
        items: [sampleUser],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
      };
      const paginatedDto = {
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
        items: [sampleUserDto],
      };
      usersService.getAll.mockResolvedValue(paginatedEntity);
      jest.spyOn(UserDtoMapper, 'toPaginatedDto').mockReturnValue(paginatedDto);

      // Act
      const result = await controller.getAll(queryDto);

      // Assert
      expect(usersService.getAll).toHaveBeenCalledTimes(1);
      expect(usersService.getAll).toHaveBeenCalledWith(
        expect.any(UserFindAllValueObject),
      );
      const getAllCall = usersService.getAll.mock.calls[0][0];
      expect(getAllCall).toBeInstanceOf(UserFindAllValueObject);
      expect(getAllCall.page).toBe(queryDto.page);
      expect(getAllCall.limit).toBe(queryDto.limit);
      expect(UserDtoMapper.toPaginatedDto).toHaveBeenCalledWith(
        paginatedEntity,
      );
      expect(result).toEqual(paginatedDto);
    });
  });

  describe('getById', () => {
    it('should return a UserDto when user is found', async () => {
      // Arrange
      const paramsDto: UserFindByIdDto = { id: 'user-1' };
      usersService.getById.mockResolvedValue(sampleUser);
      jest.spyOn(UserDtoMapper, 'toDto').mockReturnValue(sampleUserDto);

      // Act
      const result = await controller.getById(paramsDto);

      // Assert
      expect(usersService.getById).toHaveBeenCalledWith('user-1');
      expect(usersService.getById).toHaveBeenCalledTimes(1);
      expect(UserDtoMapper.toDto).toHaveBeenCalledWith(sampleUser);
      expect(result).toEqual(sampleUserDto);
    });
  });

  describe('getByEmail', () => {
    it('should return a UserDto when user is found by email', async () => {
      // Arrange
      const paramsDto: UserFindByEmailDto = { email: 'user@example.com' };
      usersService.getByEmail.mockResolvedValue(sampleUser);
      jest.spyOn(UserDtoMapper, 'toDto').mockReturnValue(sampleUserDto);

      // Act
      const result = await controller.getByEmail(paramsDto);

      // Assert
      expect(usersService.getByEmail).toHaveBeenCalledWith('user@example.com');
      expect(usersService.getByEmail).toHaveBeenCalledTimes(1);
      expect(UserDtoMapper.toDto).toHaveBeenCalledWith(sampleUser);
      expect(result).toEqual(sampleUserDto);
    });
  });

  describe('create', () => {
    it('should return a UserDto when user is created successfully', async () => {
      // Arrange
      const bodyDto: UserCreateDto = {
        email: 'newuser@example.com',
        name: 'New User',
        googleId: 'google-123',
        isSuperAdmin: false,
      };
      const createdUser = UserEntity.create({
        id: 'user-new',
        email: 'newuser@example.com',
        name: 'New User',
        googleId: 'google-123',
        isSuperAdmin: false,
        createdAt: new Date('2024-03-01T00:00:00.000Z'),
      });
      const createdUserDto: UserDto = {
        id: 'user-new',
        email: 'newuser@example.com',
        name: 'New User',
        createdAt: new Date('2024-03-01T00:00:00.000Z'),
        isSuperAdmin: false,
      };
      usersService.create.mockResolvedValue(createdUser);
      jest.spyOn(UserDtoMapper, 'toDto').mockReturnValue(createdUserDto);

      // Act
      const result = await controller.create(bodyDto);

      // Assert
      expect(usersService.create).toHaveBeenCalledTimes(1);
      const createCall = usersService.create.mock.calls[0][0];
      expect(createCall).toBeInstanceOf(UserCreationValueObject);
      expect(createCall.email).toBe(bodyDto.email);
      expect(createCall.name).toBe(bodyDto.name);
      expect(createCall.googleId).toBe(bodyDto.googleId);
      expect(createCall.isSuperAdmin).toBe(bodyDto.isSuperAdmin);
      expect(UserDtoMapper.toDto).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUserDto);
    });
  });

  describe('update', () => {
    it('should return a UserDto when user is updated successfully', async () => {
      // Arrange
      const paramsDto: UserFindByIdDto = { id: 'user-1' };
      const bodyDto: UserUpdateDto = {
        name: 'Updated Name',
      };
      const updatedUser = UserEntity.create({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Updated Name',
        googleId: 'google-123',
        isSuperAdmin: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      });
      const updatedUserDto: UserDto = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Updated Name',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        isSuperAdmin: false,
      };
      usersService.update.mockResolvedValue(updatedUser);
      jest.spyOn(UserDtoMapper, 'toDto').mockReturnValue(updatedUserDto);

      // Act
      const result = await controller.update(paramsDto, bodyDto);

      // Assert
      expect(usersService.update).toHaveBeenCalledTimes(1);
      expect(usersService.update).toHaveBeenCalledWith(
        'user-1',
        expect.any(UserUpdateValueObject),
      );
      const updateCall = usersService.update.mock.calls[0][1];
      expect(updateCall).toBeInstanceOf(UserUpdateValueObject);
      expect(updateCall.name).toBe(bodyDto.name);
      expect(updateCall.isSuperAdmin).toBe(bodyDto.isSuperAdmin);
      expect(UserDtoMapper.toDto).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUserDto);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const paramsDto: UserFindByIdDto = { id: 'user-1' };
      usersService.delete.mockResolvedValue(undefined);

      // Act
      await controller.delete(paramsDto);

      // Assert
      expect(usersService.delete).toHaveBeenCalledWith('user-1');
      expect(usersService.delete).toHaveBeenCalledTimes(1);
    });
  });
});
