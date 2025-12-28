import { isNotNullish, isNullish } from '@/common/utils/type-guards';

describe('type guards', () => {
  describe('isNotNullish', () => {
    it('should return true for defined primitive values', () => {
      // Arrange
      const inputs = [0, '', false, 42, 'hello'];

      // Act
      const results = inputs.map((value) => isNotNullish(value));

      // Assert
      results.forEach((result) => expect(result).toBe(true));
    });

    it('should return false for null or undefined values', () => {
      // Arrange
      const inputs = [undefined, null];

      // Act
      const results = inputs.map((value) => isNotNullish(value));

      // Assert
      expect(results).toEqual([false, false]);
    });

    it('should filter out nullish values from an array', () => {
      // Arrange
      const values = ['first', null, 'second', undefined];

      // Act
      const filtered = values.filter(isNotNullish);

      // Assert
      expect(filtered).toEqual(['first', 'second']);
    });
  });

  describe('isNullish', () => {
    it('should return true for undefined or null values', () => {
      // Arrange
      const inputs = [undefined, null];

      // Act
      const results = inputs.map((value) => isNullish(value));

      // Assert
      results.forEach((result) => expect(result).toBe(true));
    });

    it('should return false for defined primitive values', () => {
      // Arrange
      const inputs = [0, '', false, 42, 'hello'];

      // Act
      const results = inputs.map((value) => isNullish(value));

      // Assert
      results.forEach((result) => expect(result).toBe(false));
    });

    it('should filter out non-nullish values from an array', () => {
      // Arrange
      const values = ['first', null, 'second', undefined];

      // Act
      const filtered = values.filter(isNullish);

      // Assert
      expect(filtered).toEqual([null, undefined]);
    });
  });
});
