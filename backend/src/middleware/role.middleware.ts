import { Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/app-error';
import { AuthenticatedRequest, UserRole } from '../types';

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Access denied'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
};

export const isAdmin = authorize('admin');
export const isUser = authorize('user', 'admin');
