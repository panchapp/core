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
          kind: string;
          timestamp: string;
          path: string;
        },
      ]
    )?.[0];
    expect(jsonCall).toMatchObject({
      statusCode: expectedStatus,
      message: 'Something went wrong',
      kind,
      path: request.url,
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
        kind: 'unknown-kind',
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
          kind: string;
          timestamp: string;
          path: string;
        },
      ]
    )?.[0];
    expect(jsonCall).toMatchObject({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unexpected scenario',
      kind: 'unknown-kind',
      path: request.url,
    });
    expect(jsonCall?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
