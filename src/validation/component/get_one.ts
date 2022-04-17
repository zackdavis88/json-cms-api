import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Component } from '../../models';
import { getModelInstance, PopulatedComponentInstance } from '../utils';

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  const componentId = req.params.componentId.toLowerCase();

  if (!mongoose.Types.ObjectId.isValid(componentId)) {
    return res.validationError('componentId is not valid');
  }

  const getQueryArgs = {
    _id: componentId,
    isActive: true,
  };
  const notFoundMsg = 'requested component not found';
  const options = {
    populate: {
      createdBy: '-_id username displayName',
      updatedBy: '-_id username displayName',
      blueprint: '',
    },
  };
  const { error, modelInstance: component } = await getModelInstance(
    Component,
    getQueryArgs,
    notFoundMsg,
    options,
  );
  if (typeof error === 'string') {
    return res.notFoundError(error);
  } else if (error) {
    return res.fatalError(error);
  }

  req.requestedComponent = component as PopulatedComponentInstance;
  next();
};
