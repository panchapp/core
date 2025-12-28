import { CustomException } from '@/common/exceptions/custom.exception';
import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class CustomValidationPipe implements PipeTransform<unknown> {
  private static readonly PRIMITIVE_TYPES = new Set<Type<unknown>>([
    String,
    Boolean,
    Number,
    Array,
    Object,
  ]);

  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || CustomValidationPipe.PRIMITIVE_TYPES.has(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value ?? {}) as Record<
      string,
      unknown
    >;

    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw CustomException.validation('Validation failed', undefined, {
        errors: this.formatValidationErrors(errors),
      });
    }

    return object;
  }

  private formatValidationErrors(
    errors: ValidationError[],
    parentPath = '',
  ): Array<{ field: string; message: string }> {
    return errors.flatMap((error) => {
      const fieldPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      const constraintErrors = error.constraints
        ? Object.values(error.constraints).map((message) => ({
            field: fieldPath,
            message,
          }))
        : [];

      const childErrors =
        error.children && error.children.length > 0
          ? this.formatValidationErrors(error.children, fieldPath)
          : [];

      return [...constraintErrors, ...childErrors];
    });
  }
}
