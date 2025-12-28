import { UserEntity } from '@/users/domain/entities/user.entity';

describe('UserEntity', () => {
  describe('constructor', () => {
    it('should create a UserEntity with all required fields', () => {
      // Arrange
      const id = 'user-1';
      const email = 'user@example.com';
      const name = 'John Doe';
      const googleId = 'google-123';
      const isSuperAdmin = true;
      const createdAt = new Date('2024-01-01T00:00:00.000Z');

      // Act
      const user = new UserEntity(
        id,
        email,
        name,
        googleId,
        isSuperAdmin,
        createdAt,
      );

      // Assert
      expect(user).toBeInstanceOf(UserEntity);
      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.googleId).toBe(googleId);
      expect(user.isSuperAdmin).toBe(isSuperAdmin);
      expect(user.createdAt).toEqual(createdAt);
    });
  });

  describe('create', () => {
    it('should create a UserEntity with all fields provided', () => {
      // Arrange
      const props = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'John Doe',
        googleId: 'google-123',
        isSuperAdmin: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      // Act
      const user = UserEntity.create(props);

      // Assert
      expect(user).toBeInstanceOf(UserEntity);
      expect(user.id).toBe(props.id);
      expect(user.email).toBe(props.email);
      expect(user.name).toBe(props.name);
      expect(user.googleId).toBe(props.googleId);
      expect(user.isSuperAdmin).toBe(props.isSuperAdmin);
      expect(user.createdAt).toEqual(props.createdAt);
    });

    it('should convert string createdAt to Date object', () => {
      // Arrange
      const dateString = '2024-05-01T12:30:45.123Z';
      const props = {
        id: 'user-5',
        email: 'user5@example.com',
        name: 'Date Test User',
        googleId: 'google-123',
        isSuperAdmin: true,
        createdAt: dateString,
      };

      // Act
      const user = UserEntity.create(props);

      // Assert
      expect(user).toBeInstanceOf(UserEntity);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBe(new Date(dateString).getTime());
    });

    it('should preserve Date object when createdAt is already a Date', () => {
      // Arrange
      const createdAt = new Date('2024-06-01T15:45:30.789Z');
      const props = {
        id: 'user-6',
        email: 'user6@example.com',
        name: 'Date Preserve User',
        googleId: 'google-123',
        isSuperAdmin: true,
        createdAt,
      };

      // Act
      const user = UserEntity.create(props);

      // Assert
      expect(user).toBeInstanceOf(UserEntity);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.createdAt).toBe(createdAt);
      expect(user.createdAt.getTime()).toBe(createdAt.getTime());
    });

    it('should handle ISO date string format', () => {
      // Arrange
      const isoDateString = '2024-07-01T00:00:00.000Z';
      const props = {
        id: 'user-7',
        email: 'user7@example.com',
        name: 'ISO Date User',
        googleId: 'google-123',
        isSuperAdmin: true,
        createdAt: isoDateString,
      };

      // Act
      const user = UserEntity.create(props);

      // Assert
      expect(user).toBeInstanceOf(UserEntity);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.createdAt.toISOString()).toBe(isoDateString);
    });
  });
});
