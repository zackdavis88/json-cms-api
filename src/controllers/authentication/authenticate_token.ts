import { Request, Response, NextFunction } from 'express';
import { User, UserInstance } from '../../models';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const { _id, apiKey } = req.tokenData;
  const queryArgs = {
    _id,
    apiKey,
    isActive: true,
  };
  User.findOne(queryArgs, (err: Error, user: UserInstance) => {
    if (err) {
      return res.fatalError(err);
    }

    if (!user)
      return res.authenticationError('x-auth-token user could not be authenticated');

    req.user = user;
    next();
  });
};
