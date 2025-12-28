import {
  CustomException,
  CustomExceptionKind,
} from '@/common/exceptions/custom.exception';
import { CustomExceptionFilter } from '@/common/filters/custom-exception.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import type { PinoLogger } from 'nestjs-pino';

describe('CustomExceptionFilter', () => {
  let filter: CustomExceptionFilter;
  let logger: { error: jest.Mock };
  let response: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let request: { url: string; method: string; path: string; ip: string };
  let host: ArgumentsHost;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
    };

    filter = new CustomExceptionFilter(logger as unknown as PinoLogger);

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    request = {
      url: '/api/test',
      method: 'GET',
      path: '/api/test',
      ip: '127.0.0.1',
    };

    const httpArgumentsHost = {
      getResponse: () => response,
      getRequest: () => request,
    };

    host = {
      switchToHttp: () => httpArgumentsHost,
    } as unknown as ArgumentsHost;
  });

  it.each([
    [CustomExceptionKind.persistence, HttpStatus.INTERNAL_SERVER_ERROR],
    [CustomExceptionKind.validation, HttpStatus.BAD_REQUEST],
    [CustomExceptionKind.unauthorized, HttpStatus.UNAUTHORIZED],
    [CustomExceptionKind.forbidden, HttpStatus.FORBIDDEN],
    [CustomExceptionKind.notFound, HttpStatus.NOT_FOUND],
    [CustomExceptionKind.badRequest, HttpStatus.BAD_REQUEST],
    [CustomExceptionKind.conflict, HttpStatus.CONFLICT],
    [CustomExceptionKind.internalServerError, HttpStatus.INTERNAL_SERVER_ERROR],
  ])('should map %s exceptions to HTTP %s', (kind, expectedStatus) => {
    // Arrange
    const error = new CustomException(kind, 'Something went wrong');

    // Act
    filter.catch(error, host);

    // Assert
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        kind,
        message: 'Something went wrong',
      }),
    );
    expect(response.status).toHaveBeenCalledWith(expectedStatus);
    expect(response.json).toHaveBeenCalledTimes(1);
    const jsonCall = (
      response.json.mock.calls[0] as unknown as [
        {
          statusCode: number;
          message: string;
          timestamp: string;
        },
      ]
    )?.[0];
    expect(jsonCall).toMatchObject({
      statusCode: expectedStatus,
      message: 'Something went wrong',
    });
    expect(jsonCall?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should fall back to 500 when status mapping is missing', () => {
    // Arrange
    const customException = new CustomException(
      'unknown-kind' as CustomExceptionKind,
      'Unexpected scenario',
    );

    // Act
    filter.catch(customException, host);

    // Assert
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unexpected scenario',
      }),
    );
    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledTimes(1);
    const jsonCall = (
      response.json.mock.calls[0] as unknown as [
        {
          statusCode: number;
          message: string;
          timestamp: string;
        },
      ]
    )?.[0];
    expect(jsonCall).toMatchObject({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unexpected scenario',
    });
    expect(jsonCall?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should include validation errors in response when present', () => {
    // Arrange
    const validationErrors = [
      { field: 'email', message: 'email must be an email' },
      {
        field: 'name',
        message: 'name must be longer than or equal to 3 characters',
      },
    ];
    const error = CustomException.validation('Validation failed', undefined, {
      errors: validationErrors,
    });

    // Act
    filter.catch(error, host);

    // Assert
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledTimes(1);
    const jsonCall = (
      response.json.mock.calls[0] as unknown as [
        {
          statusCode: number;
          message: string;
          timestamp: string;
          errors: Array<{ field: string; message: string }>;
        },
      ]
    )?.[0];
    expect(jsonCall).toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
      errors: validationErrors,
    });
    expect(jsonCall?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should not include errors property when validation errors are not present', () => {
    // Arrange
    const error = CustomException.notFound('Resource not found', undefined, {
      resourceId: '123',
    });

    // Act
    filter.catch(error, host);

    // Assert
    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledTimes(1);
    const jsonCall = (
      response.json.mock.calls[0] as unknown as [
        {
          statusCode: number;
          message: string;
          timestamp: string;
          errors?: unknown;
        },
      ]
    )?.[0];
    expect(jsonCall).toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Resource not found',
    });
    expect(jsonCall?.errors).toBeUndefined();
    expect(jsonCall?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
