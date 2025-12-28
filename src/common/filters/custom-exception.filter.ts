import {
  CustomException,
  CustomExceptionKind,
} from '@/common/exceptions/custom.exception';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

const statusByKind: Record<CustomExceptionKind, number> = {
  [CustomExceptionKind.persistence]: HttpStatus.INTERNAL_SERVER_ERROR,
  [CustomExceptionKind.validation]: HttpStatus.BAD_REQUEST,
  [CustomExceptionKind.unauthorized]: HttpStatus.UNAUTHORIZED,
  [CustomExceptionKind.forbidden]: HttpStatus.FORBIDDEN,
  [CustomExceptionKind.notFound]: HttpStatus.NOT_FOUND,
  [CustomExceptionKind.badRequest]: HttpStatus.BAD_REQUEST,
  [CustomExceptionKind.conflict]: HttpStatus.CONFLICT,
  [CustomExceptionKind.internalServerError]: HttpStatus.INTERNAL_SERVER_ERROR,
};

@Catch(CustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(CustomExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: CustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      statusByKind[exception.kind] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error({
      ...exception.toLogObject(),
    });

    const responseBody: Record<string, unknown> = {
      statusCode: status,
      message: exception.message,
      timestamp: exception.timestamp.toISOString(),
    };

    // Include validation errors if present
    if (exception.details && exception.details.errors) {
      responseBody.errors = exception.details.errors;
    }

    response.status(status).json(responseBody);
  }
}
