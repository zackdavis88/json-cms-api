import { Request, Response, NextFunction } from 'express';
import { getPaginationData, QueryString, QueryArgs, escapeRegex } from '../utils';
import { User } from '../../models';

interface CountQueryArgs extends QueryArgs {
  isActive: boolean;
  name?: {
    $regex: string;
    $options: string;
  };
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  const queryStringInput = req.query;
  const countQueryArgs: CountQueryArgs = { isActive: true };
  if (queryStringInput.filterName) {
    countQueryArgs.name = {
      $regex: `^${escapeRegex(queryStringInput.filterName.toString())}`,
      $options: 'i',
    };
  }
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
