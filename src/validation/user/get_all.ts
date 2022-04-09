import { Request, Response, NextFunction } from 'express';
import { getPaginationData, QueryString } from '../utils';
import { User } from '../../models';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  const queryStringInput = req.query;
  const countQueryArgs = { isActive: true };
  const { error, paginationData } = await getPaginationData(
    User,
    countQueryArgs,
    queryStringInput as QueryString,
  );

  if (error) {
    return res.fatalError(error);
  }

  req.paginationData = paginationData;
  next();
};
