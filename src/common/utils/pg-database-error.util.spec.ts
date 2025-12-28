import {
  CustomException,
  CustomExceptionKind,
} from '@/common/exceptions/custom.exception';
import {
  handlePgDatabaseError,
  handleUniqueConstraintViolation,
} from '@/common/utils/pg-database-error.util';

interface PostgreSQLError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
  table?: string;
  column?: string;
}

describe('pg-database-error.util', () => {
  describe('handleUniqueConstraintViolation', () => {
    it('should create conflict exception with single column', () => {
      // Arrange
      const error: PostgreSQLError = {
        name: 'PostgreSQLError',
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        constraint: 'users_email_unique',
        detail: 'Key (email)=(test@example.com) already exists.',
        table: 'users',
        column: 'email',
      };

      // Act
      const result = handleUniqueConstraintViolation(error);

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.conflict);
      expect(result.message).toBe('A record with these email already exists');
      expect(result.details).toEqual({
        code: '23505',
        table: 'users',
        constraint: 'users_email_unique',
        column: 'email',
        fields: [{ column: 'email', value: 'test@example.com' }],
      });
    });

    it('should create conflict exception with multiple columns', () => {
      // Arrange
      const error: PostgreSQLError = {
        name: 'PostgreSQLError',
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        constraint: 'users_email_name_unique',
        detail: 'Key (email, name)=(test@example.com, John) already exists.',
        table: 'users',
      };

      // Act
      const result = handleUniqueConstraintViolation(error);

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.conflict);
      expect(result.message).toBe(
        'A record with these email and name already exists',
      );
      expect(result.details).toEqual({
        code: '23505',
        table: 'users',
        constraint: 'users_email_name_unique',
        column: undefined,
        fields: [
          { column: 'email', value: 'test@example.com' },
          { column: 'name', value: 'John' },
        ],
      });
    });

    it('should handle snake_case column names and convert to camelCase', () => {
      // Arrange
      const error: PostgreSQLError = {
        name: 'PostgreSQLError',
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        constraint: 'users_google_id_unique',
        detail: 'Key (google_id)=(google-123) already exists.',
        table: 'users',
        column: 'google_id',
      };

      // Act
      const result = handleUniqueConstraintViolation(error);

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.conflict);
      expect(result.message).toBe(
        'A record with these googleId already exists',
      );
      expect(result.details?.fields).toEqual([
        { column: 'google_id', value: 'google-123' },
      ]);
    });

    it('should handle error without detail field', () => {
      // Arrange
      const error: PostgreSQLError = {
        name: 'PostgreSQLError',
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        constraint: 'users_email_unique',
        table: 'users',
        column: 'email',
      };

      // Act
      const result = handleUniqueConstraintViolation(error);

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.conflict);
      expect(result.message).toBe('A record with these  already exists');
      expect(result.details).toEqual({
        code: '23505',
        table: 'users',
        constraint: 'users_email_unique',
        column: 'email',
        fields: [],
      });
    });

    it('should handle error with malformed detail field', () => {
      // Arrange
      const error: PostgreSQLError = {
        name: 'PostgreSQLError',
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        constraint: 'users_email_unique',
        detail: 'Invalid format',
        table: 'users',
        column: 'email',
      };

      // Act
      const result = handleUniqueConstraintViolation(error);

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.conflict);
      expect(result.message).toBe('A record with these  already exists');
      expect(result.details?.fields).toEqual([]);
    });

    it('should preserve the original error as cause when it is an Error instance', () => {
      // Arrange
      const error = new Error('duplicate key value violates unique constraint');
      (error as PostgreSQLError).code = '23505';
      (error as PostgreSQLError).constraint = 'users_email_unique';
      (error as PostgreSQLError).detail =
        'Key (email)=(test@example.com) already exists.';
      (error as PostgreSQLError).table = 'users';
      (error as PostgreSQLError).column = 'email';

      // Act
      const result = handleUniqueConstraintViolation(error as PostgreSQLError);

      // Assert
      expect(result.cause).toBe(error);
    });
  });

  describe('handlePgDatabaseError', () => {
    it('should handle unique constraint violation error code', () => {
      // Arrange
      const error: PostgreSQLError = {
        name: 'PostgreSQLError',
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        constraint: 'users_email_unique',
        detail: 'Key (email)=(test@example.com) already exists.',
        table: 'users',
        column: 'email',
      };

      // Act
      const result = handlePgDatabaseError(error, 'Error creating user');

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.conflict);
      expect(result.message).toBe('A record with these email already exists');
      expect(result.details?.code).toBe('23505');
    });

    it('should handle unknown error code with persistence exception', () => {
      // Arrange
      const error = new Error('connection timeout');
      (error as PostgreSQLError).code = '08006';

      // Act
      const result = handlePgDatabaseError(
        error as PostgreSQLError,
        'Error querying database',
      );

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.persistence);
      expect(result.message).toBe('Error querying database');
      expect(result.cause).toBe(error);
    });

    it('should handle error without code', () => {
      // Arrange
      const error = new Error('Unknown database error');

      // Act
      const result = handlePgDatabaseError(error, 'Error processing request');

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.persistence);
      expect(result.message).toBe('Error processing request');
      expect(result.cause).toBe(error);
    });

    it('should handle non-PostgreSQL error objects', () => {
      // Arrange
      const error = new Error('Generic error');

      // Act
      const result = handlePgDatabaseError(error, 'Error processing request');

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.persistence);
      expect(result.message).toBe('Error processing request');
      expect(result.cause).toBe(error);
    });

    it('should handle string errors', () => {
      // Arrange
      const error = 'String error message';

      // Act
      const result = handlePgDatabaseError(error, 'Error processing request');

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.persistence);
      expect(result.message).toBe('Error processing request');
    });

    it('should handle null errors', () => {
      // Arrange
      const error = null;

      // Act
      const result = handlePgDatabaseError(error, 'Error processing request');

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.persistence);
      expect(result.message).toBe('Error processing request');
      expect(result.cause).toBeUndefined();
    });

    it('should handle undefined errors', () => {
      // Arrange
      const error = undefined;

      // Act
      const result = handlePgDatabaseError(error, 'Error processing request');

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.persistence);
      expect(result.message).toBe('Error processing request');
      expect(result.cause).toBeUndefined();
    });

    it('should handle multiple unique constraint columns correctly', () => {
      // Arrange
      const error: PostgreSQLError = {
        name: 'PostgreSQLError',
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        constraint: 'users_composite_unique',
        detail: 'Key (user_id, role_id)=(123, 456) already exists.',
        table: 'user_roles',
      };

      // Act
      const result = handlePgDatabaseError(error, 'Error creating user role');

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.conflict);
      expect(result.message).toBe(
        'A record with these userId and roleId already exists',
      );
      expect(result.details?.fields).toEqual([
        { column: 'user_id', value: '123' },
        { column: 'role_id', value: '456' },
      ]);
    });

    it('should handle values with spaces in detail field', () => {
      // Arrange
      const error: PostgreSQLError = {
        name: 'PostgreSQLError',
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        constraint: 'users_name_unique',
        detail: 'Key (name)=(John Doe) already exists.',
        table: 'users',
        column: 'name',
      };

      // Act
      const result = handlePgDatabaseError(error, 'Error creating user');

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.conflict);
      expect(result.message).toBe('A record with these name already exists');
      expect(result.details?.fields).toEqual([
        { column: 'name', value: 'John Doe' },
      ]);
    });
  });
});
