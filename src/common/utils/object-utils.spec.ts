import { isEmptyObject } from '@/common/utils/object-utils';

describe('object utils', () => {
  describe('isEmptyObject', () => {
    it('should return true for an empty object', () => {
      // Arrange
      const emptyObj = {};

      // Act
      const result = isEmptyObject(emptyObj);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for an object with properties', () => {
      // Arrange
      const objWithProps = { name: 'test', value: 42 };

      // Act
      const result = isEmptyObject(objWithProps);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an object with a single property', () => {
      // Arrange
      const singleProp = { key: 'value' };

      // Act
      const result = isEmptyObject(singleProp);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an object with null or undefined values', () => {
      // Arrange
      const objWithNull = { prop: null };
      const objWithUndefined = { prop: undefined };

      // Act
      const nullResult = isEmptyObject(objWithNull);
      const undefinedResult = isEmptyObject(objWithUndefined);

      // Assert
      expect(nullResult).toBe(false);
      expect(undefinedResult).toBe(false);
    });

    it('should return false for an object with nested objects', () => {
      // Arrange
      const nestedObj = { nested: {} };

      // Act
      const result = isEmptyObject(nestedObj);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an object with array properties', () => {
      // Arrange
      const objWithArray = { items: [] };

      // Act
      const result = isEmptyObject(objWithArray);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for an object created with Object.create(null)', () => {
      // Arrange
      const protoLessObj = Object.create(null) as Record<string, never>;

      // Act
      const result = isEmptyObject(protoLessObj);

      // Assert
      expect(result).toBe(true);
    });
  });
});
