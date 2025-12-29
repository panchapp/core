export interface PaginatedDto<T> {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  items: T[];
}
