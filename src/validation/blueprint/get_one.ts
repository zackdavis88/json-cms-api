import { Request, Response, NextFunction } from 'express';
import { Blueprint } from '../../models';
import { getModelInstance, PopulatedBlueprintInstance } from '../utils';

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  const blueprintId = req.params.blueprintId.toLowerCase();
  const getQueryArgs = {
    _id: blueprintId,
    isActive: true,
  };
  const notFoundMsg = 'requested blueprint not found';
  const options = {
    populate: {
      createdBy: '-_id username displayName',
      updatedBy: '-_id username displayName',
    },
  };
  const { error, modelInstance: blueprint } = await getModelInstance(
    Blueprint,
    getQueryArgs,
    notFoundMsg,
    options,
  );
  if (typeof error === 'string') {
    return res.notFoundError(error);
  } else if (error) {
    return res.fatalError(error);
  }

  req.requestedBlueprint = blueprint as PopulatedBlueprintInstance;
  next();
};
