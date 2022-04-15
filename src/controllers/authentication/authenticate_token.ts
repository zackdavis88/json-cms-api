import { Request, Response, NextFunction } from 'express';
import { User, UserInstance } from '../../models';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { _id, apiKey } = req.tokenData;
  const queryArgs = {
    _id,
    apiKey,
    isActive: true,
  };

  let user: UserInstance;
  try {
    user = await User.findOne(queryArgs).exec();
  } catch (findOneError) {
    return res.fatalError(findOneError);
  }

  if (!user) {
    return res.authenticationError('x-auth-token user could not be authenticated');
  }

  req.user = user;
  next();
};
