import { Request, Response, NextFunction } from 'express';
import { ComponentInstance } from '../../models';
import { validateName } from '../utils';
import { validateComponents } from './utils';

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const { name, components } = req.body;

  if (!name && !components) {
    return res.validationError('request contains no update data');
  }

  const isRequired = false;
  const nameError = await validateName(name, isRequired);
  if (nameError) {
    return res.validationError(nameError);
  }

  let componentList: ComponentInstance[];
  try {
    const result = await validateComponents(components, isRequired);
    if (result) {
      componentList = result;
    }
  } catch (componentsError) {
    if (typeof componentsError === 'string') {
      return res.validationError(componentsError);
    } else {
      return res.fatalError(componentsError);
    }
  }

  if (componentList) {
    req.layoutComponents = componentList;
  }

  next();
};
