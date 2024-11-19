export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface FileUploadResponse {
  url: string;
  path: string;
  size: number;
  type: string;
}

export * from './database.types';