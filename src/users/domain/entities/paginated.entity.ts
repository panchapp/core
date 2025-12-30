export class PaginatedEntity<T> {
  constructor(
    public readonly items: T[],
    public readonly totalCount: number,
    public readonly totalPages: number,
    public readonly currentPage: number,
  ) {}

  static create<T>(props: {
    items: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }): PaginatedEntity<T> {
    return new PaginatedEntity(
      props.items,
      props.totalCount,
      props.totalPages,
      props.currentPage,
    );
  }
}
