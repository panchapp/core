export enum CustomExceptionKind {
  persistence = 'persistence',
  validation = 'validation',
  unauthorized = 'unauthorized',
  forbidden = 'forbidden',
  notFound = 'not_found',
  badRequest = 'bad_request',
  conflict = 'conflict',
  internalServerError = 'internal_server_error',
}

export class CustomException extends Error {
  public readonly kind: CustomExceptionKind;
  public readonly timestamp: Date;
  public readonly details?: Record<string, unknown>;

  constructor(
    kind: CustomExceptionKind,
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>,
  ) {
    super(message, { cause: cause instanceof Error ? cause : undefined });
    this.kind = kind;
    this.timestamp = new Date();
    this.details = details;
    if (cause instanceof Error) {
      this.stack = cause.stack;
    }
  }

  static persistence(
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>,
  ) {
    return new CustomException(
      CustomExceptionKind.persistence,
      message,
      cause,
      {
        ...details,
      },
    );
  }

  static validation(
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>,
  ) {
    return new CustomException(CustomExceptionKind.validation, message, cause, {
      ...details,
    });
  }

  static unauthorized(
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>,
  ) {
    return new CustomException(
      CustomExceptionKind.unauthorized,
      message,
      cause,
      {
        ...details,
      },
    );
  }

  static forbidden(
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>,
  ) {
    return new CustomException(CustomExceptionKind.forbidden, message, cause, {
      ...details,
    });
  }

  static notFound(
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>,
  ) {
    return new CustomException(CustomExceptionKind.notFound, message, cause, {
      ...details,
    });
  }

  static badRequest(
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>,
  ) {
    return new CustomException(CustomExceptionKind.badRequest, message, cause, {
      ...details,
    });
  }

  static conflict(
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>,
  ) {
    return new CustomException(CustomExceptionKind.conflict, message, cause, {
      ...details,
    });
  }

  static internalServerError(
    message: string,
    cause?: unknown,
    details?: Record<string, unknown>,
  ) {
    return new CustomException(
      CustomExceptionKind.internalServerError,
      message,
      cause,
      {
        ...details,
      },
    );
  }

  static from(cause: unknown): CustomException {
    if (cause instanceof CustomException) {
      return cause;
    }

    const customException = CustomException.internalServerError(
      'An unknown error occurred',
      cause,
    );

    return customException;
  }

  toLogObject(): Record<string, unknown> {
    return {
      message: this.message,
      kind: this.kind,
      timestamp: this.timestamp,
      details: this.details,
      stack: this.stack,
    };
  }
}
