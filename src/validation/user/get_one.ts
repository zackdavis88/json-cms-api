import { Request, Response, NextFunction } from 'express';
import { User } from '../../models';
import { getModelInstance } from '../utils';

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.params.username.toLowerCase();
  const getQueryArgs = {
    username,
    isActive: true,
  };
  const notFoundMsg = 'requested user not found';
  const { error, modelInstance: user } = await getModelInstance(
    User,
    getQueryArgs,
    notFoundMsg,
  );
  if (typeof error === 'string') {
    return res.notFoundError(error);
  } else if (error) {
    return res.fatalError(error);
  }

  req.requestedUser = user;
  next();
};
