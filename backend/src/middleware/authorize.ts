import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { sendError } from '../utils/apiResponse';

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
}
