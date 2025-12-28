import {
  CustomException,
  CustomExceptionKind,
} from '@/common/exceptions/custom.exception';

describe('CustomException', () => {
  describe('constructor', () => {
    it('should create an instance with kind and message', () => {
      // Arrange
      const kind = CustomExceptionKind.validation;
      const message = 'Validation failed';

      // Act
      const exception = new CustomException(kind, message);

      // Assert
      expect(exception).toBeInstanceOf(CustomException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.kind).toBe(kind);
      expect(exception.message).toBe(message);
      expect(exception.timestamp).toBeInstanceOf(Date);
      expect(exception.details).toBeUndefined();
    });

    it('should create an instance with details', () => {
      // Arrange
      const kind = CustomExceptionKind.badRequest;
      const message = 'Invalid input';
      const details = { field: 'email', reason: 'invalid format' };

      // Act
      const exception = new CustomException(kind, message, undefined, details);

      // Assert
      expect(exception.kind).toBe(kind);
      expect(exception.message).toBe(message);
      expect(exception.details).toEqual(details);
    });

    it('should set cause when provided as Error instance', () => {
      // Arrange
      const cause = new Error('Original error');
      const kind = CustomExceptionKind.persistence;
      const message = 'Database operation failed';

      // Act
      const exception = new CustomException(kind, message, cause);

      // Assert
      expect(exception.cause).toBe(cause);
      expect(exception.stack).toBe(cause.stack);
    });

    it('should handle non-Error cause', () => {
      // Arrange
      const cause = 'String error';
      const kind = CustomExceptionKind.internalServerError;
      const message = 'Something went wrong';

      // Act
      const exception = new CustomException(kind, message, cause);

      // Assert
      expect(exception.cause).toBeUndefined();
      expect(exception.stack).toBeDefined();
    });

    it('should set timestamp to current date', () => {
      // Arrange
      const beforeCreation = new Date();
      const kind = CustomExceptionKind.notFound;
      const message = 'Resource not found';

      // Act
      const exception = new CustomException(kind, message);
      const afterCreation = new Date();

      // Assert
      expect(exception.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(exception.timestamp.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });
  });

  describe('static factory methods', () => {
    it.each([
      ['persistence', CustomExceptionKind.persistence],
      ['validation', CustomExceptionKind.validation],
      ['unauthorized', CustomExceptionKind.unauthorized],
      ['forbidden', CustomExceptionKind.forbidden],
      ['notFound', CustomExceptionKind.notFound],
      ['badRequest', CustomExceptionKind.badRequest],
      ['conflict', CustomExceptionKind.conflict],
      ['internalServerError', CustomExceptionKind.internalServerError],
    ])(
      'should create exception with correct kind using %s()',
      (methodName, expectedKind) => {
        // Arrange
        const message = 'Test error message';
        const method = CustomException[
          methodName as keyof typeof CustomException
        ] as (
          message: string,
          cause?: unknown,
          details?: Record<string, unknown>,
        ) => CustomException;

        // Act
        const exception = method(message);

        // Assert
        expect(exception).toBeInstanceOf(CustomException);
        expect(exception.kind).toBe(expectedKind);
        expect(exception.message).toBe(message);
      },
    );

    it('should create persistence exception with cause and details', () => {
      // Arrange
      const message = 'Database error';
      const cause = new Error('Connection failed');
      const details = { table: 'users', operation: 'insert' };

      // Act
      const exception = CustomException.persistence(message, cause, details);

      // Assert
      expect(exception.kind).toBe(CustomExceptionKind.persistence);
      expect(exception.message).toBe(message);
      expect(exception.cause).toBe(cause);
      expect(exception.details).toEqual(details);
    });

    it('should create validation exception with details', () => {
      // Arrange
      const message = 'Invalid data';
      const details = { errors: ['email is required', 'name is too short'] };

      // Act
      const exception = CustomException.validation(message, undefined, details);

      // Assert
      expect(exception.kind).toBe(CustomExceptionKind.validation);
      expect(exception.message).toBe(message);
      expect(exception.details).toEqual(details);
    });

    it('should merge details when provided in factory methods', () => {
      // Arrange
      const message = 'Error with details';
      const details = { key1: 'value1', key2: 'value2' };

      // Act
      const exception = CustomException.badRequest(message, undefined, details);

      // Assert
      expect(exception.details).toEqual(details);
      expect(exception.details?.key1).toBe('value1');
      expect(exception.details?.key2).toBe('value2');
    });

    it('should create conflict exception with cause and details', () => {
      // Arrange
      const message = 'Resource conflict';
      const cause = new Error('Duplicate entry');
      const details = { resource: 'user', field: 'email' };

      // Act
      const exception = CustomException.conflict(message, cause, details);

      // Assert
      expect(exception.kind).toBe(CustomExceptionKind.conflict);
      expect(exception.message).toBe(message);
      expect(exception.cause).toBe(cause);
      expect(exception.details).toEqual(details);
    });
  });

  describe('static from()', () => {
    it('should return the same instance when cause is CustomException', () => {
      // Arrange
      const originalException = CustomException.notFound('Resource not found');

      // Act
      const result = CustomException.from(originalException);

      // Assert
      expect(result).toBe(originalException);
      expect(result).toBeInstanceOf(CustomException);
    });

    it('should wrap Error instance in internalServerError', () => {
      // Arrange
      const error = new Error('Original error');

      // Act
      const result = CustomException.from(error);

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.internalServerError);
      expect(result.message).toBe('An unknown error occurred');
      expect(result.cause).toBe(error);
    });

    it('should wrap string error in internalServerError', () => {
      // Arrange
      const error = 'String error message';

      // Act
      const result = CustomException.from(error);

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.internalServerError);
      expect(result.message).toBe('An unknown error occurred');
    });

    it('should wrap number error in internalServerError', () => {
      // Arrange
      const error = 404;

      // Act
      const result = CustomException.from(error);

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.internalServerError);
      expect(result.message).toBe('An unknown error occurred');
    });

    it('should wrap null in internalServerError', () => {
      // Arrange
      const error = null;

      // Act
      const result = CustomException.from(error);

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.internalServerError);
      expect(result.message).toBe('An unknown error occurred');
    });

    it('should wrap undefined in internalServerError', () => {
      // Arrange
      const error = undefined;

      // Act
      const result = CustomException.from(error);

      // Assert
      expect(result).toBeInstanceOf(CustomException);
      expect(result.kind).toBe(CustomExceptionKind.internalServerError);
      expect(result.message).toBe('An unknown error occurred');
    });
  });

  describe('toLogObject()', () => {
    it('should return log object with all properties', () => {
      // Arrange
      const kind = CustomExceptionKind.validation;
      const message = 'Validation error';
      const details = { field: 'email' };
      const exception = new CustomException(kind, message, undefined, details);

      // Act
      const logObject = exception.toLogObject();

      // Assert
      expect(logObject).toEqual({
        message: exception.message,
        kind: exception.kind,
        timestamp: exception.timestamp,
        details: exception.details,
        stack: exception.stack,
      });
      expect(logObject.message).toBe(message);
      expect(logObject.kind).toBe(kind);
      expect(logObject.timestamp).toBeInstanceOf(Date);
      expect(logObject.details).toEqual(details);
      expect(logObject.stack).toBeDefined();
    });

    it('should return log object without details when details are undefined', () => {
      // Arrange
      const exception = new CustomException(
        CustomExceptionKind.notFound,
        'Not found',
      );

      // Act
      const logObject = exception.toLogObject();

      // Assert
      expect(logObject.details).toBeUndefined();
      expect(logObject.message).toBe('Not found');
      expect(logObject.kind).toBe(CustomExceptionKind.notFound);
    });

    it('should include stack trace in log object', () => {
      // Arrange
      const exception = new CustomException(
        CustomExceptionKind.badRequest,
        'Bad request',
      );

      // Act
      const logObject = exception.toLogObject();

      // Assert
      expect(logObject.stack).toBeDefined();
      expect(typeof logObject.stack).toBe('string');
    });
  });
});
