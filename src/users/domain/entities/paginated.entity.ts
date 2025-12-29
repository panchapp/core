export interface PaginatedEntity<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
