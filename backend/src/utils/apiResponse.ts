import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    error: null,
  };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string, statusCode = 400): void {
  const response: ApiResponse<null> = {
    success: false,
    data: null,
    error,
  };
  res.status(statusCode).json(response);
}
