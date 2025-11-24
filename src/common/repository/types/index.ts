export interface PaginatedWithTotal<T> {
  total: number;
  docs: T[];
}

export interface IPaginatedParams {
  offset: number;
  limit: number;
}
