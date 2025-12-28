export function isEmptyObject<T extends object>(value: T): boolean {
  return Object.keys(value).length === 0;
}
