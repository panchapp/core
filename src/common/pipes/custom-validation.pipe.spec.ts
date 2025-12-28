import {
  CustomException,
  CustomExceptionKind,
} from '@/common/exceptions/custom.exception';
import { CustomValidationPipe } from '@/common/pipes/custom-validation.pipe';
import { ArgumentMetadata } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

// Test DTOs for validation testing
class TestNestedDto {
  @IsString()
  @IsNotEmpty()
  nestedField!: string;
}

class TestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(10)
  name!: string;

  @IsOptional()
  @IsString()
  optionalField?: string;

  @ValidateNested()
  @Type(() => TestNestedDto)
  nested?: TestNestedDto;
}

describe('CustomValidationPipe', () => {
  let pipe: CustomValidationPipe;

  beforeEach(() => {
    pipe = new CustomValidationPipe();
  });

  describe('transform', () => {
    describe('primitive types', () => {
      it.each([
        [String, 'test string'],
        [Boolean, true],
        [Number, 123],
        [Array, [1, 2, 3]],
        [Object, { key: 'value' }],
      ])('should return value unchanged for %p', async (metatype, value) => {
        // Arrange
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype,
          data: '',
        };

        // Act
        const result = await pipe.transform(value, metadata);

        // Assert
        expect(result).toBe(value);
      });
    });

    it('should return value unchanged when metatype is undefined', async () => {
      // Arrange
      const value = { some: 'data' };
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: undefined,
        data: '',
      };

      // Act
      const result = await pipe.transform(value, metadata);

      // Assert
      expect(result).toBe(value);
    });

    describe('valid DTOs', () => {
      it('should transform and return valid DTO', async () => {
        // Arrange
        const value = {
          email: 'test@example.com',
          name: 'John Doe',
        };
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: TestDto,
          data: '',
        };

        // Act
        const result = await pipe.transform(value, metadata);

        // Assert
        expect(result).toBeInstanceOf(TestDto);
        expect((result as TestDto).email).toBe('test@example.com');
        expect((result as TestDto).name).toBe('John Doe');
      });

      it('should handle optional fields', async () => {
        // Arrange
        const value = {
          email: 'test@example.com',
          name: 'John',
        };
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: TestDto,
          data: '',
        };

        // Act
        const result = await pipe.transform(value, metadata);

        // Assert
        expect(result).toBeInstanceOf(TestDto);
        expect((result as TestDto).optionalField).toBeUndefined();
      });

      it('should handle null/undefined values by converting to empty object', async () => {
        // Arrange
        const value = null;
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: TestDto,
          data: '',
        };

        // Act & Assert
        await expect(pipe.transform(value, metadata)).rejects.toThrow(
          CustomException,
        );
      });

      it('should handle undefined values by converting to empty object', async () => {
        // Arrange
        const value = undefined;
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: TestDto,
          data: '',
        };

        // Act & Assert
        await expect(pipe.transform(value, metadata)).rejects.toThrow(
          CustomException,
        );
      });
    });

    describe('invalid DTOs', () => {
      it('should throw CustomException with formatted errors for validation errors', async () => {
        // Arrange
        const value = {
          email: 'invalid-email',
          name: 'John',
        };
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: TestDto,
          data: '',
        };

        // Act & Assert
        await expect(pipe.transform(value, metadata)).rejects.toThrow(
          CustomException,
        );

        try {
          await pipe.transform(value, metadata);
          fail('Expected CustomException to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(CustomException);
          expect((error as CustomException).kind).toBe(
            CustomExceptionKind.validation,
          );
          expect((error as CustomException).message).toBe('Validation failed');
          expect((error as CustomException).details?.errors).toBeDefined();
          expect(
            Array.isArray((error as CustomException).details?.errors),
          ).toBe(true);
          const errors = (error as CustomException).details?.errors as Array<{
            field: string;
            message: string;
          }>;
          expect(errors.length).toBeGreaterThan(0);
          expect(errors.some((e) => e.field === 'email')).toBe(true);
        }
      });

      it('should throw CustomException for non-whitelisted properties', async () => {
        // Arrange
        const value = {
          email: 'test@example.com',
          name: 'John',
          unknownField: 'should be rejected',
        };
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: TestDto,
          data: '',
        };

        // Act & Assert
        try {
          await pipe.transform(value, metadata);
          fail('Expected CustomException to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(CustomException);
          const errors = (error as CustomException).details?.errors as Array<{
            field: string;
            message: string;
          }>;
          expect(errors.length).toBeGreaterThan(0);
          expect(
            errors.some((e) =>
              e.message.toLowerCase().includes('unknownfield'),
            ),
          ).toBe(true);
        }
      });

      it('should format nested validation errors with correct field paths', async () => {
        // Arrange
        const value = {
          email: 'test@example.com',
          name: 'John',
          nested: {
            nestedField: '', // Invalid: should not be empty
          },
        };
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: TestDto,
          data: '',
        };

        // Act & Assert
        try {
          await pipe.transform(value, metadata);
          fail('Expected CustomException to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(CustomException);
          const errors = (error as CustomException).details?.errors as Array<{
            field: string;
            message: string;
          }>;
          expect(errors.length).toBeGreaterThan(0);
          expect(errors.some((e) => e.field === 'nested.nestedField')).toBe(
            true,
          );
        }
      });

      it('should handle multiple validation errors', async () => {
        // Arrange
        const value = {
          email: 'invalid',
          name: 'A', // Too short
        };
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: TestDto,
          data: '',
        };

        // Act & Assert
        try {
          await pipe.transform(value, metadata);
          fail('Expected CustomException to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(CustomException);
          const errors = (error as CustomException).details?.errors as Array<{
            field: string;
            message: string;
          }>;
          expect(errors.length).toBeGreaterThan(1);
        }
      });
    });
  });
});
