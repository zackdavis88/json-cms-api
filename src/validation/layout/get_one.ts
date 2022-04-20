import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Layout } from '../../models';
import { getModelInstance, PopulatedLayoutInstance } from '../utils';

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  const layoutId = req.params.layoutId.toLowerCase();

  if (!mongoose.Types.ObjectId.isValid(layoutId)) {
    return res.validationError('layoutId is not valid');
  }

  const getQueryArgs = {
    _id: layoutId,
    isActive: true,
  };
  const notFoundMsg = 'requested layout not found';
  const options = {
    populate: {
      createdBy: '-_id username displayName',
      updatedBy: '-_id username displayName',
      components: '',
    },
  };
  const { error, modelInstance: layout } = await getModelInstance(
    Layout,
    getQueryArgs,
    notFoundMsg,
    options,
  );
  if (typeof error === 'string') {
    return res.notFoundError(error);
  } else if (error) {
    return res.fatalError(error);
  }

  req.requestedLayout = layout as PopulatedLayoutInstance;
  next();
};
