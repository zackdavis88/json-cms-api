import { Request, Response, NextFunction } from 'express';
import { Fragment } from '../../models';
import { getModelInstance, PopulatedFragmentInstance } from '../utils';

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  const fragmentName = req.params.fragmentName.toLowerCase();

  const getQueryArgs = {
    name: fragmentName,
    isActive: true,
  };
  const notFoundMsg = 'requested fragment not found';
  const options = {
    populate: {
      createdBy: '-_id username displayName',
      updatedBy: '-_id username displayName',
    },
  };
  const { error, modelInstance: fragment } = await getModelInstance(
    Fragment,
    getQueryArgs,
    notFoundMsg,
    options,
  );
  if (typeof error === 'string') {
    return res.notFoundError(error);
  } else if (error) {
    return res.fatalError(error);
  }

  req.requestedFragment = fragment as PopulatedFragmentInstance;
  next();
};
