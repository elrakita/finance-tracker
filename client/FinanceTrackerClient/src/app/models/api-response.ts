export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors: string[];
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}