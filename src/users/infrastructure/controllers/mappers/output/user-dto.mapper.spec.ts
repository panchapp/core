import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserDto } from '@/users/infrastructure/controllers/dtos/output/user.dto';
import { UserDtoMapper } from '@/users/infrastructure/controllers/mappers/output/user-dto.mapper';

describe('UserDtoMapper', () => {
  describe('toDto', () => {
    it('should map UserEntity to UserDto with all public fields', () => {
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
      const result = UserDtoMapper.toDto(entity);

      // Assert
      expect(result).toBeInstanceOf(UserDto);
      expect(result.id).toBe(entity.id);
      expect(result.email).toBe(entity.email);
      expect(result.name).toBe(entity.name);
      expect(result.createdAt).toEqual(entity.createdAt);
    });

    it('should exclude fields that are not in the UserDto', () => {
      // Arrange
      const entity = UserEntity.create({
        id: 'user-2',
        email: 'user2@example.com',
        name: 'Another User',
        googleId: 'google-456',
        isSuperAdmin: true,
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
      });

      // Act
      const result = UserDtoMapper.toDto(entity);

      // Assert
      expect(result).toBeInstanceOf(UserDto);
      expect(result.id).toBe(entity.id);
      expect(result.email).toBe(entity.email);
      expect(result.name).toBe(entity.name);
      expect(result.createdAt).toEqual(entity.createdAt);
      // Verify sensitive fields are not in the DTO
      expect('googleId' in result).toBe(false);
      expect('isSuperAdmin' in result).toBe(false);
    });
  });

  describe('toDtos', () => {
    it('should map an array of UserEntity to an array of UserDto', () => {
      // Arrange
      const entities = [
        UserEntity.create({
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
          googleId: 'google-1',
          isSuperAdmin: false,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        }),
        UserEntity.create({
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User Two',
          googleId: 'google-2',
          isSuperAdmin: true,
          createdAt: new Date('2024-02-01T00:00:00.000Z'),
        }),
        UserEntity.create({
          id: 'user-3',
          email: 'user3@example.com',
          name: 'User Three',
          googleId: 'google-3',
          isSuperAdmin: false,
          createdAt: new Date('2024-03-01T00:00:00.000Z'),
        }),
      ];

      // Act
      const result = UserDtoMapper.toDtos(entities);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(UserDto);
      expect(result[1]).toBeInstanceOf(UserDto);
      expect(result[2]).toBeInstanceOf(UserDto);

      expect(result[0].id).toBe(entities[0].id);
      expect(result[0].email).toBe(entities[0].email);
      expect(result[0].name).toBe(entities[0].name);

      expect(result[1].id).toBe(entities[1].id);
      expect(result[1].email).toBe(entities[1].email);
      expect(result[1].name).toBe(entities[1].name);

      expect(result[2].id).toBe(entities[2].id);
      expect(result[2].email).toBe(entities[2].email);
      expect(result[2].name).toBe(entities[2].name);

      // Verify sensitive fields are excluded from all DTOs
      expect('googleId' in result[0]).toBe(false);
      expect('isSuperAdmin' in result[0]).toBe(false);
      expect('googleId' in result[1]).toBe(false);
      expect('isSuperAdmin' in result[1]).toBe(false);
      expect('googleId' in result[2]).toBe(false);
      expect('isSuperAdmin' in result[2]).toBe(false);
    });

    it('should return an empty array when given an empty array', () => {
      // Arrange
      const entities: UserEntity[] = [];

      // Act
      const result = UserDtoMapper.toDtos(entities);

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });
});
