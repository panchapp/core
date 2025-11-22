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
import { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

const statusByKind: Record<CustomExceptionKind, number> = {
  [CustomExceptionKind.persistence]: HttpStatus.INTERNAL_SERVER_ERROR,
  [CustomExceptionKind.validation]: HttpStatus.BAD_REQUEST,
  [CustomExceptionKind.unauthorized]: HttpStatus.UNAUTHORIZED,
  [CustomExceptionKind.forbidden]: HttpStatus.FORBIDDEN,
  [CustomExceptionKind.notFound]: HttpStatus.NOT_FOUND,
  [CustomExceptionKind.badRequest]: HttpStatus.BAD_REQUEST,
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
    const request = ctx.getRequest<Request>();

    const status =
      statusByKind[exception.kind] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error({
      ...exception.toLogObject(),
    });

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      kind: exception.kind,
      timestamp: exception.timestamp.toISOString(),
      path: request.url,
    });
  }
}
