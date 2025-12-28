import { CustomException } from '@/common/exceptions/custom.exception';

const enum POSTGRES_ERROR_CODE {
  UNIQUE_CONSTRAINT_VIOLATION = '23505',
}

interface PostgreSQLError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
  table?: string;
  column?: string;
}

const KEY_PATTERN = /Key \(([^)]+)\)=\(([^)]+)\)/;

function snakeToCamel(str: string): string {
  return str.replaceAll(
    /_([a-z])/g,
    (_match: string, letter: string): string => {
      return letter.toUpperCase();
    },
  );
}

function extractColumnValuePairs(
  error: PostgreSQLError,
): Array<{ column: string; value: string }> {
  if (error.detail) {
    const match = KEY_PATTERN.exec(error.detail);
    if (match) {
      const columns = match[1].split(',').map((col) => col.trim());
      const values = match[2].split(',').map((val) => val.trim());

      return columns.map((column, index) => ({
        column,
        value: values[index] || '',
      }));
    }
  }

  return [];
}

export function handleUniqueConstraintViolation(
  error: PostgreSQLError,
): CustomException {
  const columnValuePairs = extractColumnValuePairs(error);
  const columnNames = columnValuePairs.map((pair) => pair.column);
  const fields = columnNames.map(snakeToCamel).join(' and ');
  const message = `A record with these ${fields} already exists`;
  return CustomException.conflict(message, error, {
    code: error.code,
    table: error.table,
    constraint: error.constraint,
    column: error.column,
    fields: columnValuePairs,
  });
}

export function handlePgDatabaseError(
  error: unknown,
  defaultMessage: string,
): CustomException {
  if (error === null || error === undefined) {
    return CustomException.persistence(defaultMessage, error);
  }

  const pgError = error as PostgreSQLError;

  if (pgError.code === POSTGRES_ERROR_CODE.UNIQUE_CONSTRAINT_VIOLATION) {
    return handleUniqueConstraintViolation(pgError);
  }

  return CustomException.persistence(defaultMessage, error);
}
