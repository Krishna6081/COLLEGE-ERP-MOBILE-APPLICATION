import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  static success<T>(res: Response, message: string, data?: T, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data ?? null,
    });
  }

  static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    pagination: PaginationMeta,
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
    });
  }

  static error(res: Response, message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: {
        code,
        details: details ?? null,
      },
    });
  }
}
