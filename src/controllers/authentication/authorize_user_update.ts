import { Request, Response, NextFunction } from 'express';

export const authorizeUserUpdate = (req: Request, res: Response, next: NextFunction) => {
  const requestingUser = req.user;
  const requestedUser = req.params.username.toLowerCase();

  if (requestingUser.username !== requestedUser) {
    return res.authorizationError('you do not have permission to perform this action');
  }

  next();
};
