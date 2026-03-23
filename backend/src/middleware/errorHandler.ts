import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Unhandled error:', err.message);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  sendError(res, message, statusCode);
}
